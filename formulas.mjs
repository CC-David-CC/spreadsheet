// Deliberately small arithmetic parser: workbook contents never become JavaScript.
export function calculate(data, row, col) {
 const active=new Set(); let steps=0;
 const fail=()=>{throw Error('Invalid formula');};
 const finite=n=>{if(!Number.isFinite(n))fail();return n;};
 const cell=(r,c)=>{if(++steps>20000||r<0||c<0||r>9999||c>9999)fail();const key=r+':'+c;if(active.has(key))fail();const value=data[r]?.[c]??'';if(typeof value==='string'&&value.startsWith('=')){active.add(key);try{return parse(value.slice(1));}finally{active.delete(key);}}if(value===''||value===null)return 0;const n=Number(value);if(!Number.isFinite(n))fail();return n;};
 // Jspreadsheet stores typed numbers as strings. Aggregate ranges ignore
 // blanks and nonnumeric labels but accept decimal numeric strings.
 const aggregateCell=(r,c)=>{if(++steps>20000||r<0||c<0||r>9999||c>9999)fail();const value=data[r]?.[c];if(value===undefined||value===null||value===''||typeof value==='boolean')return null;if(typeof value==='string'&&!value.startsWith('=')){const text=value.trim();if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)||!Number.isFinite(Number(text)))return null;}return cell(r,c);};
 const reference=s=>{const m=/^([A-Za-z]{1,3})([1-9][0-9]{0,4})$/.exec(s);if(!m)fail();let c=0;for(const ch of m[1].toUpperCase())c=c*26+ch.charCodeAt(0)-64;return [Number(m[2])-1,c-1];};
 function parse(input){if(input.length>1024)fail();const tokens=input.match(/\s+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z]+[0-9]*|[()+\-*/^,:]/g)||[];if(tokens.join('')!==input)fail();const t=tokens.filter(x=>!/^\s+$/.test(x));let i=0,depth=0;const peek=()=>t[i],take=x=>peek()===x?(i++,true):false;
 const expression=()=>{if(++depth>64)fail();let v=term();while(peek()==='+'||peek()==='-'){const op=t[i++],n=term();v=finite(op==='+'?v+n:v-n);}depth--;return v;};
 const term=()=>{let v=power();while(peek()==='*'||peek()==='/'){const op=t[i++],n=power();v=finite(op==='*'?v*n:v/n);}return v;};
 const power=()=>{let v=unary();if(take('^'))v=finite(Math.pow(v,power()));return v;};
 const unary=()=>{if(take('+'))return unary();if(take('-'))return -unary();return atom();};
 const atom=()=>{if(take('(')){const v=expression();if(!take(')'))fail();return v;}const token=t[i++];if(!token)fail();if(/^(?:\d|\.)/.test(token))return finite(Number(token));if(/^[A-Za-z]+[0-9]+$/.test(token)){const [r,c]=reference(token);return cell(r,c);}if(!/^[A-Za-z]+$/.test(token)||!take('('))fail();const name=token.toUpperCase();if(!['SUM','AVERAGE','MIN','MAX','COUNT'].includes(name))fail();const values=[];if(!take(')')){do{if(/^[A-Za-z]+[0-9]+$/.test(peek()||'')&&t[i+1]===':'){const [r1,c1]=reference(t[i]);const [r2,c2]=reference(t[i+2]||'');i+=3;const size=(Math.abs(r2-r1)+1)*(Math.abs(c2-c1)+1);if(size>10000)fail();for(let r=Math.min(r1,r2);r<=Math.max(r1,r2);r++)for(let c=Math.min(c1,c2);c<=Math.max(c1,c2);c++){const value=aggregateCell(r,c);if(value!==null)values.push(value);}}else if(/^[A-Za-z]+[0-9]+$/.test(peek()||'')&&(t[i+1]===','||t[i+1]===')')){const [r,c]=reference(t[i++]),value=aggregateCell(r,c);if(value!==null)values.push(value);}else values.push(expression());}while(take(','));if(!take(')'))fail();}if(name==='COUNT')return values.length;if(name==='SUM')return values.reduce((a,b)=>finite(a+b),0);if(!values.length){if(name==='AVERAGE')fail();return 0;}if(name==='AVERAGE')return values.reduce((a,b)=>finite(a+b),0)/values.length;return name==='MIN'?Math.min(...values):Math.max(...values);};
 const result=expression();if(i!==t.length||!Number.isFinite(result))fail();return result;}
 try{return {value:cell(row,col)};}catch{return {error:'#ERROR!'};}
}
