import assert from 'node:assert/strict';
import {parseCSV} from '../apps/system/spreadsheet/workers/csv.mjs';
const parse=s=>parseCSV(new TextEncoder().encode(s));
let result=parse('\ufeffname,value,note\r\n"a,b",001,"line 1\nline ""2"""\r\nformula,=1+1,\r\n');
assert.deepEqual(result.sheets[0].data,[['name','value','note'],['a,b','001','line 1\nline "2"'],['formula',"'=1+1",'']]);assert.equal(result.escaped,1);
assert.deepEqual(parse('').sheets[0].data,[['']]);assert.deepEqual(parse('a,\n').sheets[0].data,[['a','']]);
assert.throws(()=>parse('a,"unterminated'),/unclosed/);assert.throws(()=>parse('"a"b'),/closing quote/);assert.throws(()=>parse('a"b'),/unexpected quote/);
assert.throws(()=>parse('x,'.repeat(256)+'x'),/256 columns/);assert.throws(()=>parse('x\n'.repeat(1001)),/10,000-cell grid/);
assert.throws(()=>parseCSV(Uint8Array.from([0xff])),/encoded data|encoding/i);console.log('PASS CSV quoting, text preservation, formula escaping and bounds');
