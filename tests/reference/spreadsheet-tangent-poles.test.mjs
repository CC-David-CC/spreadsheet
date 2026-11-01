import assert from 'node:assert/strict';
import {calculate} from '../apps/system/spreadsheet/formulas.mjs';
import {sheetToCSV} from '../apps/system/spreadsheet/csv-export.mjs';
for(const expression of ['=TAN(PI()/2)','=TAN(-PI()/2)','=TAN(3*PI()/2)','=TAN(-3*PI()/2)']){
 assert.equal(calculate([[expression]],0,0).error,'#ERROR!',expression);
 assert.throws(()=>sheetToCSV([[expression]]),/unsupported or invalid formula/);
}
for(const expression of ['=TAN(PI()/2-0.000001)','=TAN(PI()/2+0.000001)']){
 const result=calculate([[expression]],0,0);assert.ok(Number.isFinite(result.value),expression);assert.ok(Math.abs(result.value)>1e5);assert.ok(sheetToCSV([[expression]]).length>0);
}
console.log('PASS spreadsheet tangent poles and finite nearby values');
