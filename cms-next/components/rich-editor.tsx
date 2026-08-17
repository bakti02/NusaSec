'use client';
export default function RichEditor({value,onChange}:{value:string;onChange:(v:string)=>void}) { return <textarea value={value} onChange={e=>onChange(e.target.value)} rows={16} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #d9e0e8'}} />; }
