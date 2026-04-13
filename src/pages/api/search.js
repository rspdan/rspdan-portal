/**
 * NESTNET Phase 1 — Bridge Search API
 * GET /api/search?q=query&limit=10
 * Searches all indexed Bridge .md files
 * Returns matching documents with highlighted context
 * 
 * Trip STN2 041226
 */

export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const key = url.searchParams.get('key');
  
  // Simple API key check
  if (key !== '9e6e3ae0628e240eb1cdd9fea17bd402') {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!query || query.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'missing query parameter q' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch the search index
    const indexUrl = new URL('/api/search-index.json', url.origin);
    const indexRes = await fetch(indexUrl.toString());
    const index = await indexRes.json();
    
    // Search
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    const results = [];
    
    for (const doc of index.docs) {
      const keywordsLower = (doc.keywords || '').toLowerCase();
      const titleLower = doc.title.toLowerCase();
      const pathLower = doc.path.toLowerCase();
      
      // Score: title matches weighted 3x, path matches 2x, keywords 1x
      let score = 0;
      let matchedTerms = 0;
      
      for (const term of terms) {
        if (titleLower.includes(term)) {
          score += 3;
          matchedTerms++;
        }
        if (pathLower.includes(term)) {
          score += 2;
          matchedTerms++;
        }
        if (keywordsLower.includes(term)) {
          score += 1;
          matchedTerms++;
        }
      }
      
      // Must match at least one term
      if (matchedTerms === 0) continue;
      
      // Boost score if ALL terms matched
      if (matchedTerms >= terms.length) score *= 2;
      
      results.push({
        path: doc.path,
        title: doc.title,
        preview: doc.preview,
        score: score,
        size: doc.size,
      });
    }
    
    // Sort by score descending, return top N
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, limit);
    
    return new Response(JSON.stringify({
      query: query,
      total: results.length,
      showing: topResults.length,
      results: topResults,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: 'search failed', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
