import * as XLSX from 'xlsx';
import {parseCSV} from './csv.mjs';
import {sheetToCSV} from '../csv-export.mjs';
const MAX_CELLS=10000,MAX_SHEETS=32;
self.onmessage=event=>{const {id,operation,bytes,sheets,data}=event.data;try{
 if(operation==='export-csv'){self.postMessage({id,result:sheetToCSV(data)});
 }else if(operation==='import-csv'){self.postMessage({id,result:parseCSV(bytes)});
 }else if(operation==='import'){
  const workbook=XLSX.read(bytes,{type:'array',cellFormula:true,cellStyles:false,cellDates:false});if(workbook.SheetNames.length>MAX_SHEETS)throw Error('Workbook has too many sheets.');let cells=0;
  const result=workbook.SheetNames.map(name=>{const ws=workbook.Sheets[name],range=ws['!ref']?XLSX.utils.decode_range(ws['!ref']):{s:{r:0,c:0},e:{r:0,c:0}};if(range.e.r>9999||range.e.c>255||(cells+=(range.e.r+1)*(range.e.c+1))>MAX_CELLS)throw Error('Workbook exceeds the 10,000-cell limit.');const data=[];for(let r=0;r<=range.e.r;r++){const row=[];for(let c=0;c<=range.e.c;c++){const cell=ws[XLSX.utils.encode_cell({r,c})];row.push(cell?.f?'='+cell.f:cell?.v??'');}data.push(row);}return {name,data};});self.postMessage({id,result});
 }else if(operation==='export'){
  const workbook=XLSX.utils.book_new();for(const sheet of sheets){const ws=XLSX.utils.aoa_to_sheet(sheet.data.map(row=>row.map(value=>typeof value==='string'&&value.startsWith('=')?null:value)));for(let r=0;r<sheet.data.length;r++)for(let c=0;c<(sheet.data[r]||[]).length;c++){const value=sheet.data[r][c];if(typeof value==='string'&&value.startsWith('=')&&value.length>1)ws[XLSX.utils.encode_cell({r,c})]={t:'n',f:value.slice(1)};}XLSX.utils.book_append_sheet(workbook,ws,sheet.name);}const output=XLSX.write(workbook,{type:'array',bookType:'xlsx'});self.postMessage({id,result:output},[output]);
 }else throw Error('Unsupported conversion.');
 }catch(error){self.postMessage({id,error:error.message||'Spreadsheet conversion failed.'});}};
