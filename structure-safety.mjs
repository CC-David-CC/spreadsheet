import {calculate} from './formulas.mjs';
// Deleting only beyond all formula cells and references cannot shift any of
// them. Reject syntax that the small formula engine does not recognize.
const functions=new Set(['ABS','SQRT','SIN','COS','TAN','PI','SUM','AVERAGE','MIN','MAX','COUNT']);
export function safeTrailingDeletion(sheets,indices,axis){
 if(!Array.isArray(sheets)||!Array.isArray(indices)||!indices.length||!['row','column'].includes(axis)||indices.some(i=>!Number.isSafeInteger(i)||i<0))return false;
 const first=Math.min(...indices);let last=-1;
 for(const sheet of sheets){
  const data=sheet?.options?.data;if(!Array.isArray(data))return false;
  for(let row=0;row<data.length;row++){
   if(!Array.isArray(data[row]))continue;
   for(let col=0;col<data[row].length;col++){
    const value=data[row][col];if(typeof value!=='string'||!value.startsWith('='))continue;
    last=Math.max(last,axis==='row'?row:col);const input=value.slice(1);if(!input||input.length>1024)return false;
    const raw=input.match(/\s+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z]+[0-9]*|[()+\-*/^,:]/g)||[];
    if(raw.join('')!==input)return false;const tokens=raw.filter(t=>!/^\s+$/.test(t));
    for(let i=0;i<tokens.length;i++){
     const token=tokens[i],ref=/^([A-Za-z]{1,3})([1-9][0-9]{0,4})$/.exec(token);
     if(ref){if(tokens[i+1]==='(')return false;let c=0;for(const ch of ref[1].toUpperCase())c=c*26+ch.charCodeAt(0)-64;const r=Number(ref[2]);if(c>10000||r>10000)return false;last=Math.max(last,axis==='row'?r-1:c-1);}
     else if(/^[A-Za-z]/.test(token)){if(!functions.has(token.toUpperCase())||tokens[i+1]!=='(')return false;}
     // Vendor reference rewrites can misread scientific notation as a cell.
     else if(/^(?:\d|\.)/.test(token)&&/[eE]/.test(token))return false;
    }
   }
  }
 }
 return first>last;
}

// Row-local formulas travel with their input row. The vendor's row move keeps
// those references local; cross-row references and foreign sheet formulas need
// a general reference model and stay blocked.
export function safeRowLocalMove(sheets,target,from,to){
 if(!Array.isArray(sheets)||!sheets.includes(target)||!Number.isSafeInteger(from)||!Number.isSafeInteger(to)||from<0||to<0||from===to||from>=target.options.data.length||to>=target.options.data.length)return false;
 let count=0;
 for(const sheet of sheets){const data=sheet?.options?.data;if(!Array.isArray(data))return false;
  for(let row=0;row<data.length;row++){if(!Array.isArray(data[row]))continue;
   for(let col=0;col<data[row].length;col++){const value=data[row][col];if(typeof value!=='string'||!value.startsWith('='))continue;if(sheet!==target||++count>128||calculate(data,row,col).error)return false;
    const input=value.slice(1);if(!input||input.length>1024)return false;
    const raw=input.match(/\s+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z]+[0-9]*|[()+\-*/^,:]/g)||[];if(raw.join('')!==input)return false;const tokens=raw.filter(t=>!/^\s+$/.test(t));
    for(let i=0;i<tokens.length;i++){const token=tokens[i],ref=/^([A-Za-z]{1,3})([1-9][0-9]{0,4})$/.exec(token);
     if(ref){if(tokens[i+1]==='('||Number(ref[2])!==row+1)return false;let c=0;for(const ch of ref[1].toUpperCase())c=c*26+ch.charCodeAt(0)-64;if(c>10000)return false;}
     else if(/^[A-Za-z]/.test(token)){if(!functions.has(token.toUpperCase())||tokens[i+1]!=='(')return false;}
     else if(/^(?:\d|\.)/.test(token)&&/[eE]/.test(token))return false;
    }
   }
  }
 }
 return true;
}
