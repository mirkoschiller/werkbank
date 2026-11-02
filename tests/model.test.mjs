import test from 'node:test';
import assert from 'node:assert/strict';
import {freshBoard,validateBoard,moveCard} from '../src/model.js';
test('three initial columns',()=>assert.deepEqual(freshBoard().columns.map(c=>c.title),['Ideen','In Arbeit','Erledigt']));
test('move card across columns',()=>{const b=freshBoard();b.columns[0].cards.push({id:'card1',text:'Hallo',color:'blue'});assert.equal(moveCard(b,'card1',b.columns[2].id),true);assert.equal(b.columns[0].cards.length,0);assert.equal(b.columns[2].cards[0].text,'Hallo')});
test('board data validation',()=>{const b=freshBoard();assert.equal(validateBoard(b).columns.length,3);b.columns[0].cards.push({id:'x',text:'test',color:'invalid'});assert.throws(()=>validateBoard(b))});
