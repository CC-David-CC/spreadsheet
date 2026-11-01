import {calculate} from './formulas.mjs';
// Export one sheet's values. CSV has no formula, formatting or sheet model.
export function sheetToCSVWithReport(data,{protect=true}={}){
 let lastRow=-1,lastCol=-1;
 for(let r=0;r<data.length;r++)for(let c=0;c<(data[r]?.length||0);c++)if(data[r][c]!==''&&data[r][c]!=null){lastRow=Math.max(lastRow,r);lastCol=Math.max(lastCol,c)}
 if(lastRow<0)return {csv:'',protectedCells:0,unprotectedCells:0};
 const numeric=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
 let protectedCells=0,unprotectedCells=0;const escape=value=>{let text=String(value);if((/^[\t\r\n]/.test(text)||/^[ \t\r\n]*[=+@-]/.test(text))&&!numeric.test(text)){if(protect){text="'"+text;protectedCells++;}else unprotectedCells++;}return '"'+text.replaceAll('"','""')+'"';};
 const rows=[];for(let r=0;r<=lastRow;r++){const fields=[];for(let c=0;c<=lastCol;c++){
  let value=data[r]?.[c]??'';if(typeof value==='string'&&value.startsWith('=')){const result=calculate(data,r,c);if(result.error)throw Error('Cannot export: an unsupported or invalid formula appears in the current sheet.');value=result.value;}fields.push(escape(value));
 }rows.push(fields.join(','));}
 const output=rows.join('\r\n')+'\r\n';if(new TextEncoder().encode(output).byteLength>8*1024*1024)throw Error('CSV output exceeds 8 MiB.');return {csv:output,protectedCells,unprotectedCells};
}
export function sheetToCSV(data){return sheetToCSVWithReport(data).csv;
}
