import test from 'node:test';
import assert from 'node:assert/strict';
import { freshBoard } from '../src/model.js';
import { snapshotOf, boardFromSnapshot, makeShareUrl, readShareHash } from '../src/share.js';
import { generateQRMatrix } from '../src/qr.js';

test('round trip preserves all displayed content and colors',async()=>{
  const board=freshBoard();board.title='Klasse 8 – Ideen 💡';
  board.columns[0].cards.push({id:'card-a',text:'Projekt: 🌳 Umwelt\nZweite Zeile',color:'green'});
  board.columns[1].cards.push({id:'card-b',text:'Teste SQL',color:'pink'});
  const url=await makeShareUrl(board,'https://example.org/werkbank/');
  const restored=await readShareHash(new URL(url).hash);
  assert.deepEqual(snapshotOf(restored),snapshotOf(board));
  assert.notEqual(restored.id,board.id);
  assert.ok(url.includes('#b='));
  assert.ok(url.length<1400);
  assert.deepEqual(generateQRMatrix(url).length>20,true);
});
test('long share is refused rather than producing unscannable QR', async()=>{
  const board=freshBoard();
  for(let i=0;i<50;i++)board.columns[0].cards.push({id:`id-${i}`,text:Array.from({length:90},(_,j)=>String.fromCharCode(33+((i*67+j*31+j*j)%90))).join(''),color:'yellow'});
  await assert.rejects(makeShareUrl(board,'https://example.org/werkbank/'),/zu groß/);
});
test('invalid version and colors refused',()=>{
  assert.throws(()=>boardFromSnapshot([2,'Title',[]]),/Ungültiger/);
  assert.throws(()=>boardFromSnapshot([1,'Title',[['Spalte', [['Hallo',99]]]]]),/Ungültiger/);
});
test('irrelevant hashes do not create shared views',async()=>{
  assert.equal(await readShareHash('#something-else'),null);
});
