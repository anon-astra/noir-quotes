export function findQuoteIndex(quotes, input) {
  const number = String(input ?? '').trim().replace(/^#/, '');
  if (!/^\d+$/.test(number) || !Number.isSafeInteger(Number(number)) || Number(number) < 1) return -1;
  return quotes.findIndex(q => /^\d+$/.test(String(q.id)) && Number(q.id) === Number(number));
}

export function randomQuoteIndex(length, current = -1, random = Math.random) {
  if (!length) return -1;
  if (length === 1) return 0;
  if (current < 0 || current >= length) return Math.floor(random() * length);
  const pick = Math.floor(random() * (length - 1));
  return pick >= current ? pick + 1 : pick;
}

export function parseQuoteLines(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const numbered = lines.map(line => line.match(/^(\d+)\s*[-.)–—:]\s*(.+)$/)).filter(Boolean);
  // Numbered collections may contain headings or replies between entries.
  // Only assign sequential IDs when the entire file is unnumbered.
  if (numbered.length) {
    const seen = new Set();
    return numbered.map(match => {
      const id = Number(match[1]);
      if (!Number.isSafeInteger(id) || id < 1) throw new Error('Quote numbers must be positive integers.');
      if (seen.has(id)) throw new Error(`Duplicate quote number: ${id}.`);
      seen.add(id);
      return { id, text: match[2], author: 'Rivelino' };
    });
  }
  return lines.map((text, i) => ({ id: i + 1, text, author: 'Rivelino' }));
}
