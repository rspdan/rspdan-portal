/**
 * NESTNET Phase 2c — Hybrid Search API
 * GET /api/search?q=query&limit=10&mode=hybrid|keyword|semantic
 * 
 * keyword: full-text search against index (Phase 1)
 * semantic: vector similarity via Upstash Vector (Phase 2c)
 * hybrid: both, merged and deduplicated (default)
 *
 * Trip STN2 041226
 */

export const prerender = false;

const VECTOR_URL = import.meta.env.UPSTASH_VECTOR_REST_URL || '';
const VECTOR_TOKEN = import.meta.env.UPSTASH_VECTOR_REST_TOKEN || '';

async function keywordSearch(terms, index, limit) {
  const results = [];
  
  for (const doc of index.docs) {
    const keywordsLower = (doc.keywords || '').toLowerCase();
    const titleLower = doc.title.toLowerCase();
    const pathLower = doc.path.toLowerCase();
    
    let score = 0;
    let matchedTerms = 0;
    
    for (const term of terms) {
      if (titleLower.includes(term)) { score += 3; matchedTerms++; }
      if (pathLower.includes(term)) { score += 2; matchedTerms++; }
      if (keywordsLower.includes(term)) { score += 1; matchedTerms++; }
    }
    
    if (matchedTerms === 0) continue;
    if (matchedTerms >= terms.length) score *= 2;
    
    results.push({
      path: doc.path,
      title: doc.title,
      preview: doc.preview,
      score: score,
      size: doc.size,
      source: 'keyword',
    });
  }
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

async function semanticSearch(query, limit) {
  if (!VECTOR_URL || !VECTOR_TOKEN) return [];
  
  try {
    const resp = await fetch(`${VECTOR_URL}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VECTOR_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: query,
        topK: limit,
        includeMetadata: true,
      }),
    });
    
    const data = await resp.json();
    if (!data || !data.result) return [];
    
    return data.result.map(hit => ({
      path: hit.metadata?.path || '',
      title: hit.metadata?.title || '',
      preview: hit.metadata?.preview || '',
      score: Math.round(hit.score * 100),
      size: hit.metadata?.size || 0,
      source: 'semantic',
      similarity: hit.score,
    }));
  } catch (err) {
    console.error('Semantic search error:', err);
    return [];
  }
}

function mergeResults(keywordResults, semanticResults, limit) {
  const seen = new Set();
  const merged = [];
  
  // Interleave: take top semantic, then top keyword, alternating
  let ki = 0, si = 0;
  while (merged.length < limit && (ki < keywordResults.length || si < semanticResults.length)) {
    // Prefer semantic results slightly (they find meaning, not just words)
    if (si < semanticResults.length) {
      const r = semanticResults[si++];
      if (!seen.has(r.path)) {
        seen.add(r.path);
        merged.push(r);
      }
    }
    if (ki < keywordResults.length && merged.length < limit) {
      const r = keywordResults[ki++];
      if (!seen.has(r.path)) {
        seen.add(r.path);
        merged.push(r);
      }
    }
  }
  
  return merged;
}

export async function GET({ request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const mode = url.searchParams.get('mode') || 'hybrid';
  const key = url.searchParams.get('key');
  
  if (key !== '9e6e3ae0628e240eb1cdd9fea17bd402') {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!query || query.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'missing query parameter q' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let keywordResults = [];
    let semanticResults = [];
    
    if (mode === 'keyword' || mode === 'hybrid') {
      const indexUrl = new URL('/api/search-index.json', url.origin);
      const indexRes = await fetch(indexUrl.toString());
      const index = await indexRes.json();
      const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
      keywordResults = await keywordSearch(terms, index, limit);
    }
    
    if (mode === 'semantic' || mode === 'hybrid') {
      semanticResults = await semanticSearch(query, limit);
    }
    
    let results;
    if (mode === 'hybrid') {
      results = mergeResults(keywordResults, semanticResults, limit);
    } else if (mode === 'semantic') {
      results = semanticResults;
    } else {
      results = keywordResults;
    }
    
    const hasVector = !!(VECTOR_URL && VECTOR_TOKEN);
    
    return new Response(JSON.stringify({
      query,
      mode,
      semantic_available: hasVector,
      total: results.length,
      results,
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: 'search failed', detail: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
