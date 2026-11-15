import assert from 'node:assert/strict';
import {calculate} from "../../formulas.mjs";
import {sheetToCSV} from "../../csv-export.mjs";
for (const fn of ['SUM','AVERAGE','MIN','MAX','COUNT']) {
  for (const value of ['1e309','-1e309','  1e309  ']) {
    const data=[[value],['1'],[`=${fn}(A1:A2)`]];
    assert.deepEqual(calculate(data,2,0),{error:'#ERROR!'},`${fn} must not silently discard overflowing ${value}`);
    assert.throws(()=>sheetToCSV(data),/unsupported or invalid formula/);
  }
  const label=[['label'],['1'],[`=${fn}(A1:A2)`]];
  assert.equal(calculate(label,2,0).value,1,`${fn} still ignores labels`);
}
assert.equal(calculate([['1e307'],['1'],['=SUM(A1:A2)']],2,0).value,1e307);
console.log('PASS aggregate numeric overflow surfaces an error and blocks CSV; labels remain ignored');
