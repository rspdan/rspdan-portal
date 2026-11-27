#!/usr/bin/env python3
"""Run an explicit read-only Repowise MCP query batch and retain raw returns.

Uses the existing installation/configuration; does not index or change providers.
Outputs stay in this Halp-owned directory. Not a production LIBX component.
"""
import asyncio
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

HERE = Path(__file__).resolve().parent
REPO = Path('/workspace/nest-bridge')
READ_ONLY = {'search_codebase', 'get_why', 'get_context', 'get_answer', 'get_symbol'}


async def main():
    request_file = Path(sys.argv[1]).resolve()
    if request_file.parent != HERE:
        raise ValueError('Use a request file in the Halp receiving directory')
    requests = json.loads(request_file.read_text())
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPO, text=True).strip()
    params = StdioServerParameters(command='/home/agent/.local/bin/repowise',
                                   args=['mcp', str(REPO)], cwd=REPO)
    with (HERE / (request_file.stem + '.stderr.log')).open('w') as errlog:
        async with stdio_client(params, errlog=errlog) as (reader, writer):
            async with ClientSession(reader, writer) as session:
                init = await session.initialize()
                surface = await session.list_tools()
                (HERE / (request_file.stem + '.surface.json')).write_text(json.dumps({
                    'reader': 'Halp', 'recorded_utc': datetime.now(timezone.utc).isoformat(),
                    'repo_head': head, 'initialize': init.model_dump(mode='json'),
                    'tools': surface.model_dump(mode='json')}, indent=2) + '\n')
                for req in requests:
                    if req['tool'] not in READ_ONLY:
                        raise ValueError('Non-read tool rejected')
                    name = req['receipt']
                    if Path(name).name != name or not name.endswith('.json'):
                        raise ValueError('Receipt must be a local JSON basename')
                    dest = HERE / name
                    if dest.exists():
                        raise ValueError(f'Receipt already exists: {name}')
                    start = datetime.now(timezone.utc).isoformat()
                    result = await session.call_tool(req['tool'], req['arguments'])
                    payload = {'reader': 'Halp', 'started_utc': start,
                               'completed_utc': datetime.now(timezone.utc).isoformat(),
                               'repo_head_at_start': head, 'tool': req['tool'],
                               'arguments': req['arguments'],
                               'result': result.model_dump(mode='json')}
                    dest.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
                    print(json.dumps({'receipt': name, 'isError': result.isError,
                                      'bytes': dest.stat().st_size}), flush=True)


if __name__ == '__main__':
    asyncio.run(main())
