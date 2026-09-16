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
  return text.split(/\r?\n/).filter(line => line.trim()).map((line, i) => {
    const numbered = line.trim().match(/^(\d+)\s*[-.)–—:]\s*(.+)$/);
    return { id: numbered ? Number(numbered[1]) : i + 1, text: numbered ? numbered[2] : line.trim(), author: 'Rivelino' };
  });
}
