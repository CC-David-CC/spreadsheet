// Delimited files are imported as text. A leading equals sign is escaped so a data file
// cannot silently turn a cell into a spreadsheet formula.
export function parseCSV(bytes,{delimiter=','}={}){
 if(![',','\t'].includes(delimiter))throw Error('Unsupported delimiter.');const format=delimiter==='\t'?'TSV':'CSV';
 if(bytes.byteLength>8*1024*1024)throw Error(format+' files are limited to 8 MiB in Spreadsheet.');
 let text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(text.charCodeAt(0)===0xfeff)text=text.slice(1);
 // Slice contiguous spans instead of appending a new string for each byte.
 // A quoted field is unescaped once, after its closing quote is found.
 const unquote=value=>{const units=new Uint16Array(value.length);let count=0;for(let i=0;i<value.length;i++){const ch=value.charCodeAt(i);units[count++]=ch;if(ch===34&&value.charCodeAt(i+1)===34)i++;}const parts=[];for(let i=0;i<count;i+=8192)parts.push(String.fromCharCode(...units.subarray(i,Math.min(i+8192,count))));return parts.join('');};
 const rows=[],row=[];let fragments=[],start=0,quoted=false,closed=false,hasEscapedQuote=false,total=0,escaped=0,ended=false;
 const addField=end=>{if(!closed)fragments.push(text.slice(start,end));let field=fragments.join('');fragments=[];if(field.startsWith('=')){field="'"+field;escaped++}row.push(field);closed=false;hasEscapedQuote=false;if(row.length>256)throw Error(format+' has more than 256 columns.');};
 const addRow=end=>{addField(end);total+=row.length;if(total>10000)throw Error(format+' exceeds the 10,000-cell limit.');rows.push(row.splice(0));};
 for(let i=0;i<text.length;i++){
  const ch=text[i];ended=false;
  if(quoted){if(ch==='"'){if(text[i+1]==='"'){hasEscapedQuote=true;i++}else{const value=text.slice(start,i);fragments.push(hasEscapedQuote?unquote(value):value);quoted=false;closed=true;start=i+1}}continue;}
  if(ch==='"'){if(i!==start||closed)throw Error(format+' has an unexpected quote.');quoted=true;start=i+1;continue;}
  if(ch===delimiter){addField(i);start=i+1;continue;}
  if(ch==='\r'||ch==='\n'){addRow(i);if(ch==='\r'&&text[i+1]==='\n')i++;start=i+1;ended=true;continue;}
  if(closed)throw Error(format+' has characters after a closing quote.');
 }
 if(quoted)throw Error(format+' has an unclosed quoted field.');if(!ended||!rows.length)addRow(text.length);
 const width=Math.max(10,...rows.map(r=>r.length));if(Math.max(20,rows.length)*width>10000)throw Error(format+' exceeds the 10,000-cell grid limit.');
 return {sheets:[{name:'Sheet1',data:rows}],escaped};
}
