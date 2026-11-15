import assert from 'node:assert/strict';
import {parseCSV} from '../apps/system/spreadsheet/workers/csv.mjs';
import {sheetToCSVWithReport} from '../apps/system/spreadsheet/csv-export.mjs';
const encode=new TextEncoder();
for(const delimiter of [',','\t']){
 const value='A😀"'.repeat(20000),bytes=encode.encode('"'+value.replaceAll('"','""')+'"'+delimiter+'end\r\n');
 assert.deepEqual(parseCSV(bytes,{delimiter}).sheets[0].data,[[value,'end']]);
}
const lotsOfQuotes=new Uint8Array(6*1024*1024).fill(34);
assert.equal(parseCSV(lotsOfQuotes).sheets[0].data[0][0].length,3*1024*1024-1);
const longField='x'.repeat(8*1024*1024-4),exact=sheetToCSVWithReport([[longField]]).csv;
assert.equal(encode.encode(exact).byteLength,8*1024*1024);
assert.throws(()=>sheetToCSVWithReport([[longField+'x']]),/CSV output exceeds 8 MiB/);
assert.throws(()=>parseCSV(new Uint8Array(8*1024*1024+1)),/limited to 8 MiB/);
assert.equal(sheetToCSVWithReport([['😀"é']]).csv,'"😀""é"\r\n');
console.log('PASS long UTF-8/quoted fields, exact export boundary and import limit');
