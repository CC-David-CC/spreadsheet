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

for(const formula of ['=1/(1/0)','=1e999^0','=(-1)^0.5^0.5','=SUM(1e308,1e308,-1e308)'])assert.equal(calculate([[formula]],0,0).error,'#ERROR!',formula+' propagates intermediate errors');
assert.equal(calculate([['=1/(2/4)']],0,0).value,2);
console.log('PASS nonfinite intermediate values propagate as errors');

for(const [formula,expected] of [['=PI()',Math.PI],['=SQRT(9)',3],['=ABS(-5)',5],['=SIN(PI()/2)',1],['=COS(PI())',-1],['=TAN(0)',0],['=SQRT(ABS(-9))',3],['=SIN(30*PI()/180)',0.5]])assert.ok(Math.abs(calculate([[formula]],0,0).value-expected)<1e-12,formula);
for(const formula of ['=PI(1)','=SQRT()','=SQRT(1,2)','=SQRT(-1)','=SIN(1/0)','=ABS(1e999)','=SIN(A1)','=SIN(A1:A2)'])assert.equal(calculate([[formula]],0,0).error,'#ERROR!',formula);
assert.equal(calculate([['9','=SQRT(A1)']],0,1).value,3);
console.log('PASS bounded scientific functions and domain errors');
