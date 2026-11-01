import {calculate} from './formulas.mjs';
// Export one sheet's values. CSV has no formula, formatting or sheet model.
export function sheetToCSVWithReport(data,{protect=true}={}){
 let lastRow=-1,lastCol=-1;
 for(let r=0;r<data.length;r++)for(let c=0;c<(data[r]?.length||0);c++)if(data[r][c]!==''&&data[r][c]!=null){lastRow=Math.max(lastRow,r);lastCol=Math.max(lastCol,c)}
 if(lastRow<0)return {csv:'',protectedCells:0,unprotectedCells:0};
 const numeric=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
 // Avoid a large chain of intermediate strings for quote-heavy data.
 const quote=text=>{if(!text.includes('"'))return '"'+text+'"';let count=0;for(let i=0;i<text.length;i++)if(text.charCodeAt(i)===34)count++;const units=new Uint16Array(text.length+count+2);let out=0;units[out++]=34;for(let i=0;i<text.length;i++){const ch=text.charCodeAt(i);units[out++]=ch;if(ch===34)units[out++]=34;}units[out++]=34;const parts=[];for(let i=0;i<out;i+=8192)parts.push(String.fromCharCode(...units.subarray(i,Math.min(i+8192,out))));return parts.join('');};
 const maxBytes=8*1024*1024,encoder=new TextEncoder();let outputBytes=0;const addBytes=n=>{outputBytes+=n;if(outputBytes>maxBytes)throw Error('CSV output exceeds 8 MiB.');};
 let protectedCells=0,unprotectedCells=0;const escape=value=>{let text=String(value);if((/^[\t\r\n]/.test(text)||/^[ \t\r\n]*[=+@-]/.test(text))&&!numeric.test(text)){if(protect){text="'"+text;protectedCells++;}else unprotectedCells++;}if(text.length>maxBytes)throw Error('CSV output exceeds 8 MiB.');let quotes=0;for(let i=text.indexOf('"');i!==-1;i=text.indexOf('"',i+1))quotes++;addBytes(encoder.encode(text).byteLength+quotes+2);return quote(text);};
 const rows=[];for(let r=0;r<=lastRow;r++){const fields=[];for(let c=0;c<=lastCol;c++){
  let value=data[r]?.[c]??'';if(typeof value==='string'&&value.startsWith('=')){const result=calculate(data,r,c);if(result.error)throw Error('Cannot export: an unsupported or invalid formula appears in the current sheet.');value=result.value;}if(c)addBytes(1);fields.push(escape(value));
 }addBytes(2);rows.push(fields.join(','));}
 const output=rows.join('\r\n')+'\r\n';return {csv:output,protectedCells,unprotectedCells};
}
export function sheetToCSV(data){return sheetToCSVWithReport(data).csv;
}
