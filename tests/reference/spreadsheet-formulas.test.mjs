import assert from 'node:assert/strict';
import {calculate} from '../apps/system/spreadsheet/formulas.mjs';
assert.equal(calculate([['5'],['7'],['=SUM(A1:A2)']],2,0).value,12);
assert.equal(calculate([['4','=A1*2+1']],0,1).value,9);
assert.equal(calculate([['=AVERAGE(2,4,6)']],0,0).value,4);
assert.equal(calculate([['=A1']],0,0).error,'#ERROR!');
assert.equal(calculate([['=SUM(A1:A99999)']],0,0).error,'#ERROR!');
assert.equal(calculate([["=globalThis.alert(1)"]],0,0).error,'#ERROR!');
assert.equal(calculate([["1);alert(1)//",'=A1+2']],0,1).error,'#ERROR!');
console.log('PASS bounded spreadsheet formulas, cycles and hostile input');

const mixed=[['10'],[''],['temperature'],['20'],['=AVERAGE(A1:A4)'],['=COUNT(A1:A4)'],['=SUM(A1:A4)'],['=MIN(A1:A4)'],['=MAX(A1:A4)'],['=COUNT(A1,A2,A3,7)']];
assert.equal(calculate(mixed,4,0).value,15);assert.equal(calculate(mixed,5,0).value,2);assert.equal(calculate(mixed,6,0).value,30);assert.equal(calculate(mixed,7,0).value,10);assert.equal(calculate(mixed,8,0).value,20);assert.equal(calculate(mixed,9,0).value,2);
assert.equal(calculate([['label'],[''],['=AVERAGE(A1:A2)']],2,0).error,'#ERROR!');assert.equal(calculate([['label'],[''],['=MIN(A1:A2)']],2,0).value,0);assert.equal(calculate([['text'],['=A1+1']],1,0).error,'#ERROR!');assert.equal(calculate([['=SUM(A1:A1)']],0,0).error,'#ERROR!');
console.log('PASS aggregate functions ignore empty cells and text labels');
assert.equal(calculate([['=SUM(A99999)']],0,0).error,'#ERROR!');
