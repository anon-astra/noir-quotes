<script>
  import { onMount } from 'svelte';
  import { findQuoteIndex, randomQuoteIndex, parseQuoteLines } from './quote-navigation.js';
  let requestedNumber = $state('');
  let quotes = $state([]), index = $state(0), query = $state(''), saved = $state([]), savedOnly = $state(false), panel = $state(false), status = $state(''), loading = $state(true);
  let filtered = $derived(quotes.filter(q => (!savedOnly || saved.includes(q.text)) && `${q.text} ${q.author} ${q.id}`.toLowerCase().includes(query.toLowerCase())));
  let current = $derived(filtered[index] ?? filtered[0]);
  const persist = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { status = 'Storage unavailable. Changes last for this visit.'; } };
  function normalize(items) {
    if (!Array.isArray(items) || !items.length || items.length > 10000) throw new Error('Use an array of 1–10,000 quotes.');
    return items.map((q, i) => {
      if (typeof q === 'string') q = { text: q };
      if (!q || typeof q.text !== 'string' || !q.text.trim() || q.text.length > 10000) throw new Error(`Quote ${i + 1} needs valid text.`);
      let source = '';
      try { const u = new URL(q.source); if (['https:', 'http:'].includes(u.protocol)) source = u.href; } catch {}
      return { id: String(q.id ?? i + 1), text: q.text.trim(), author: typeof q.author === 'string' ? q.author : 'Unknown', source };
    });
  }
  onMount(async () => {
    try { saved = JSON.parse(localStorage.getItem('noir-saved') || '[]'); if (!Array.isArray(saved)) saved = []; } catch { saved = []; }
    try {
      let stored; try { stored = localStorage.getItem('noir-quotes'); } catch {}
      if (stored) { try { quotes = normalize(JSON.parse(stored)); } catch {} }
      if (!quotes.length) {
  const r = await fetch(`${import.meta.env.BASE_URL}wisdom.txt`);

  if (!r.ok) throw new Error('Could not load default collection.');

  const text = await r.text();
  quotes = normalize(parseQuoteLines(text));
}
    } catch { status = 'Could not load the collection. Import a quote file to begin.'; }
    loading = false;
  });
  function move(step) { if (filtered.length) index = (index + step + filtered.length) % filtered.length; }
  function fetchNumber(event) {
    event.preventDefault();
    const next = findQuoteIndex(quotes, requestedNumber);
    if (next < 0) { status = `Quote ${requestedNumber || 'number'} is not in the loaded collection. Import it from Collection.`; return; }
    query = ''; savedOnly = false; index = next;
    status = `Showing quote ${quotes[next].id}.`;
  }
  function fetchRandom() {
    const next = randomQuoteIndex(quotes.length, quotes.indexOf(current));
    if (next < 0) { status = 'Import a collection to fetch a random quote.'; return; }
    query = ''; savedOnly = false; index = next;
    status = `Random pick: quote ${quotes[next].id}.`;
  }
  function bookmark() { if (!current) return; saved = saved.includes(current.text) ? saved.filter(t => t !== current.text) : [...saved, current.text]; persist('noir-saved', saved); if (savedOnly) index = Math.min(index, Math.max(0, filtered.length - 1)); }
  async function copy() { try { await navigator.clipboard.writeText(`${current.text}\n— ${current.author}`); status = 'Quote copied.'; } catch { status = 'Copy unavailable. Select the quote text to copy it.'; } }
  async function importFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Choose a file smaller than 5 MB.');
      const text = await file.text();
      const items = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseQuoteLines(text);
      quotes = normalize(items); persist('noir-quotes', quotes); index = 0; query = ''; savedOnly = false; panel = false; status = `${quotes.length} quotes imported on this device.`;
    } catch (error) { status = error.message || 'Could not import this file.'; }
    e.target.value = '';
  }
  function keys(e) { if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return; if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }
</script>

<svelte:window onkeydown={keys}/>
<div class="shell">
  <header><a class="wordmark" href="./" aria-label="Noir home">noir<span> / </span></a><div class="top-actions"><span class="collection-label">THE QUOTE COLLECTION</span><button class:active={panel} onclick={() => panel = !panel} aria-expanded={panel}>Collection <span aria-hidden="true">{panel ? '−' : '+'}</span></button></div></header>
  {#if panel}
    <section class="collection" aria-label="Collection settings">
      <div><h2>Your collection</h2><p>A short attributed sample is included. Import your collection as JSON, or a text file with one quote per line. Imports stay on this device.</p></div>
      <label class="import">Import quotes<input type="file" accept=".json,.txt" onchange={importFile}/></label>
      <div class="sources"><a href="https://threadreaderapp.com/thread/1638490799305289728.html" target="_blank" rel="noreferrer">Source thread I ↗</a><a href="https://threadreaderapp.com/thread/1680336720439508994.html" target="_blank" rel="noreferrer">Source thread II ↗</a></div>
    </section>
  {/if}
  <div class="toolbar"><nav aria-label="Quote views"><button class:selected={!savedOnly} onclick={() => { savedOnly = false; index = 0; }}>All quotes <span>{quotes.length}</span></button><button class:selected={savedOnly} onclick={() => { savedOnly = true; index = 0; }}>Saved <span>{saved.length}</span></button></nav><input aria-label="Search quotes" type="search" placeholder="Find a thought…" bind:value={query} oninput={() => index = 0}/></div>
  <div class="fetch-controls">
    <form onsubmit={fetchNumber}>
      <label for="quote-number">Quote number</label>
      <div class="number-field"><span aria-hidden="true">#</span><input id="quote-number" type="text" inputmode="numeric" pattern="[0-9]+" required placeholder="14" bind:value={requestedNumber}/></div>
      <button type="submit" disabled={loading || !quotes.length}>Fetch quote</button>
    </form>
    <button class="random-fetch" onclick={fetchRandom} disabled={loading || !quotes.length}>Random quote ↗</button>
  </div>
  <main>
    {#if loading}<p class="empty">Opening the collection…</p>
    {:else if current}
      <div class="quote-meta"><span>NO. {String(current.id).padStart(3, '0')}</span><button class="save" class:bookmarked={saved.includes(current.text)} onclick={bookmark} aria-label={saved.includes(current.text) ? 'Unsave quote' : 'Save quote'} aria-pressed={saved.includes(current.text)}><svg width="19" height="22" viewBox="0 0 20 24" aria-hidden="true"><path d="M4 3h12v18l-6-4-6 4z" fill={saved.includes(current.text) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.5"/></svg></button></div>
      {#key current.text}<article><span class="quote-mark" aria-hidden="true">“</span><blockquote>{current.text}</blockquote><div class="attribution"><span class="rule"></span><span>{current.author}</span>{#if current.source}<a href={current.source} target="_blank" rel="noreferrer" aria-label="Read quote source">↗</a>{/if}</div></article>{/key}
      <div class="reader-controls"><button class="quiet" onclick={copy}>Copy quote</button><div class="paging"><button onclick={() => move(-1)} disabled={filtered.length < 2} aria-label="Previous quote">←</button><span>{String(Math.min(index + 1, filtered.length)).padStart(2, '0')} <span class="dim">/ {String(filtered.length).padStart(2, '0')}</span></span><button onclick={() => move(1)} disabled={filtered.length < 2} aria-label="Next quote">→</button></div><span class="quiet">{filtered.length} in view</span></div>
    {:else}<div class="empty"><h2>{savedOnly ? 'Nothing saved here yet.' : 'No matching quotes.'}</h2><p>{savedOnly ? 'Bookmark a quote to come back to it.' : 'Try another search, or import your collection.'}</p><button onclick={() => { query = ''; savedOnly = false; }}>View all quotes</button></div>{/if}
  </main>
  <footer><span>A LITTLE LESS NOISE.</span><span class="keyboard">← → to explore</span><span>READ. PAUSE. REPEAT.</span></footer>
  <p class="status" role="status">{status}</p>
</div>
