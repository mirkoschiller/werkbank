export const STORAGE_KEY = 'werkbank.boards.v1';
export const COLORS = ['yellow', 'blue', 'green', 'pink', 'purple', 'white'];
export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function freshBoard() {
  return { version: 1, id: makeId(), title: 'Meine Werkbank', updatedAt: new Date().toISOString(), columns: [
    { id: makeId(), title: 'Ideen', cards: [] },
    { id: makeId(), title: 'In Arbeit', cards: [] },
    { id: makeId(), title: 'Erledigt', cards: [] }
  ] };
}
export function validateBoard(input) {
  if (!input || typeof input !== 'object' || input.version !== 1 || typeof input.title !== 'string' || !Array.isArray(input.columns) || input.columns.length > 100) throw new Error('Keine gültige Werkbank-Datei (Version 1).');
  const clean = { version: 1, id: typeof input.id === 'string' ? input.id.slice(0,100) : makeId(), title: input.title.slice(0,120), updatedAt: new Date().toISOString(), columns: [] };
  const ids = new Set();
  for (const col of input.columns) {
    if (!col || typeof col.id !== 'string' || typeof col.title !== 'string' || !Array.isArray(col.cards) || col.cards.length > 1000 || ids.has(col.id)) throw new Error('Ungültige Spalten-Daten.');
    ids.add(col.id);
    const cards = [];
    for (const card of col.cards) {
      if (!card || typeof card.id !== 'string' || ids.has(card.id) || typeof card.text !== 'string' || card.text.length > 2000 || !COLORS.includes(card.color)) throw new Error('Ungültige Karten-Daten.');
      ids.add(card.id);
      cards.push({ id: card.id, text: card.text, color: card.color });
    }
    clean.columns.push({ id: col.id, title: col.title.slice(0,80), cards });
  }
  return clean;
}
export function moveCard(board, cardId, targetColumnId, beforeCardId = null) {
  const source = board.columns.find(c => c.cards.some(k => k.id === cardId));
  const target = board.columns.find(c => c.id === targetColumnId);
  if (!source || !target) return false;
  const sourceIndex = source.cards.findIndex(c => c.id === cardId);
  const [card] = source.cards.splice(sourceIndex, 1);
  let index = beforeCardId ? target.cards.findIndex(c => c.id === beforeCardId) : -1;
  if (index < 0) index = target.cards.length;
  target.cards.splice(index, 0, card);
  return true;
}
