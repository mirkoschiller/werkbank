import { COLORS, makeId, validateBoard } from './model.js';

// Encoding version 1: title, then ordered columns with their ordered (text, color index) cards.
// URLs carry a snapshot, never an identity, an access token, or a live board address.
export const MAX_SHARE_URL_LENGTH = 1400; // conservative for classroom QR scanning
export const MAX_DECOMPRESSED_BYTES = 180_000;
export function snapshotOf(board) {
  const checked = validateBoard(board);
  return [1, checked.title, checked.columns.map(col => [col.title, col.cards.map(c => [c.text, COLORS.indexOf(c.color)])])];
}
export function boardFromSnapshot(value) {
  if (!Array.isArray(value) || value.length !== 3 || value[0] !== 1 || typeof value[1] !== 'string' || !Array.isArray(value[2]) || value[2].length > 100) throw new Error('Ungültiger Freigabelink.');
  const board = {version:1,id:makeId(),title:value[1],columns:[],updatedAt:new Date().toISOString()};
  for (const entry of value[2]) {
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || !Array.isArray(entry[1]) || entry[1].length > 1000) throw new Error('Ungültiger Freigabelink.');
    board.columns.push({id:makeId(),title:entry[0],cards:entry[1].map(card=> {
      if (!Array.isArray(card) || card.length !== 2 || typeof card[0] !== 'string' || !Number.isInteger(card[1]) || card[1]<0 || card[1]>=COLORS.length) throw new Error('Ungültiger Freigabelink.');
      return {id:makeId(),text:card[0],color:COLORS[card[1]]};
    })});
  }
  return validateBoard(board);
}
function toBase64url(bytes) {
  let str='';
  for (let i=0;i<bytes.length;i+=8192) str+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function fromBase64url(str) {
  if (!/^[A-Za-z0-9_-]+$/.test(str)) throw new Error('Ungültiger Freigabelink.');
  const b64=str.replace(/-/g,'+').replace(/_/g,'/');
  const bin=atob(b64.padEnd(Math.ceil(b64.length/4)*4,'='));
  return Uint8Array.from(bin,c=>c.charCodeAt(0));
}
async function compress(bytes) {
  if (typeof CompressionStream==='undefined') throw new Error('Dieser Browser unterstützt komprimierte Freigabelinks nicht. Bitte als JSON exportieren.');
  const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function decompress(bytes) {
  if (typeof DecompressionStream==='undefined') throw new Error('Dieser Browser unterstützt diesen Freigabelink nicht.');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  const reader=stream.getReader(); const chunks=[]; let total=0;
  try {
    while(true) {
      const {done,value}=await reader.read(); if(done)break;
      total+=value.byteLength;
      if(total>MAX_DECOMPRESSED_BYTES) { await reader.cancel(); throw new Error('Die Freigabedaten sind zu groß.'); }
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const result=new Uint8Array(total);let offset=0;
  for(const c of chunks){result.set(c,offset);offset+=c.length;}
  return result;
}
export async function makeShareUrl(board, pageUrl) {
  const payload=JSON.stringify(snapshotOf(board));
  const data=toBase64url(await compress(new TextEncoder().encode(payload)));
  const url=new URL(pageUrl);
  url.hash=`b=${data}`;
  if(url.href.length>MAX_SHARE_URL_LENGTH) throw new Error('Board zu groß für einen gut lesbaren QR-Code. Bitte JSON exportieren oder Karten reduzieren.');
  return url.href;
}
export async function readShareHash(hash) {
  if(!hash.startsWith('#b=')) return null;
  const encoded=hash.slice(3);
  if(encoded.length>MAX_SHARE_URL_LENGTH)throw new Error('Freigabelink zu lang.');
  const bytes=await decompress(fromBase64url(encoded));
  return boardFromSnapshot(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
}
