'use client';
import { useState } from 'react';

const stages = ['DRAFT','REVIEW','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED'];
export default function CMSWorkspace() {
  const [stage, setStage] = useState('DRAFT');
  return <section style={{fontFamily:'system-ui',padding:24}}><h1>Content Workspace</h1><p>Lifecycle-driven NusaSec CMS.</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{stages.map(s => <button key={s} onClick={() => setStage(s)}>{s}</button>)}</div><p>Current stage: <strong>{stage}</strong></p></section>;
}
