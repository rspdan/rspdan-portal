// POST /api/fleet-save — save fleet board edits via GitHub API commit
import { verifySession } from '../../lib/pspt.js';

export async function POST({ request }) {
  // Auth check
  const session = verifySession(request.headers.get('cookie'));
  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: 'GitHub token not configured' }), { status: 500 });
  }

  try {
    const updates = await request.json();
    const { board_updated, seats } = updates;

    // Read current fleet.js from GitHub
    const owner = 'rspdan';
    const repo = 'rspdan-portal';
    const path = 'src/data/fleet.js';

    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
    );
    if (!fileRes.ok) throw new Error(`GitHub read failed: ${fileRes.status}`);
    const fileData = await fileRes.json();
    let content = Buffer.from(fileData.content, 'base64').toString('utf8');

    // Apply board edits
    if (board_updated) {
      content = content.replace(
        /updated:\s*"[^"]*"(,\s*\n\s*quote:)/,
        `updated: "${board_updated}"$1`
      );
    }

    // Apply crew_seats edits
    if (seats && typeof seats === 'object') {
      for (const [station, seatData] of Object.entries(seats)) {
        if (seatData.station_status) {
          // Update station_status for this station
          const statusRe = new RegExp(
            `(${station}:\\s*\\{\\s*station_status:\\s*)"[^"]*"`,
          );
          content = content.replace(statusRe, `$1"${seatData.station_status}"`);
        }
        if (Array.isArray(seatData.seats)) {
          for (const seat of seatData.seats) {
            if (seat.crew && seat.status) {
              // Update the status for this crew member
              const seatStatusRe = new RegExp(
                `(crew:\\s*"${seat.crew}",\\s*status:\\s*)"[^"]*"`,
              );
              content = content.replace(seatStatusRe, `$1"${seat.status}"`);
            }
            if (seat.crew && seat.note !== undefined) {
              const seatNoteRe = new RegExp(
                `(crew:\\s*"${seat.crew}",[^}]*note:\\s*)"[^"]*"`,
              );
              content = content.replace(seatNoteRe, `$1"${seat.note}"`);
            }
          }
        }
      }
    }

    // Commit the updated file
    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Fleet board update via PSPT (${session.user}, ${new Date().toISOString().slice(0, 16)})`,
          content: Buffer.from(content).toString('base64'),
          sha: fileData.sha,
        }),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      throw new Error(`GitHub commit failed: ${commitRes.status} ${err.message || ''}`);
    }

    return new Response(JSON.stringify({ ok: true, user: session.user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Fleet save error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
