// CSV is imported as text. A leading equals sign is escaped so a data file
// cannot silently turn a cell into a spreadsheet formula.
export function parseCSV(bytes){
 if(bytes.byteLength>8*1024*1024)throw Error('CSV files are limited to 8 MiB in Spreadsheet.');
 let text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(text.charCodeAt(0)===0xfeff)text=text.slice(1);
 const rows=[],row=[];let field='',quoted=false,closed=false,total=0,escaped=0,ended=false;
 const addField=()=>{if(field.startsWith('=')){field="'"+field;escaped++}row.push(field);field='';closed=false;if(row.length>256)throw Error('CSV has more than 256 columns.');};
 const addRow=()=>{addField();total+=row.length;if(total>10000)throw Error('CSV exceeds the 10,000-cell limit.');rows.push(row.splice(0));};
 for(let i=0;i<text.length;i++){
  const ch=text[i];ended=false;
  if(quoted){if(ch==='"'){if(text[i+1]==='"'){field+='"';i++}else{quoted=false;closed=true}}else field+=ch;continue;}
  if(ch==='"'){if(field.length||closed)throw Error('CSV has an unexpected quote.');quoted=true;continue;}
  if(ch===','){addField();continue;}
  if(ch==='\r'||ch==='\n'){addRow();if(ch==='\r'&&text[i+1]==='\n')i++;ended=true;continue;}
  if(closed)throw Error('CSV has characters after a closing quote.');field+=ch;
 }
 if(quoted)throw Error('CSV has an unclosed quoted field.');if(!ended||!rows.length)addRow();
 const width=Math.max(10,...rows.map(r=>r.length));if(Math.max(20,rows.length)*width>10000)throw Error('CSV exceeds the 10,000-cell grid limit.');
 return {sheets:[{name:'Sheet1',data:rows}],escaped};
}
