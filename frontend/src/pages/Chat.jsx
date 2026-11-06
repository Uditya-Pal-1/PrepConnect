import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from '../router';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost } from '../lib/api';
import './Chat.css';

export default function Chat() {
  const { user, ready } = useAuth(); const applicationId = new URLSearchParams(window.location.search).get('applicationId');
  const [applications, setApplications] = useState([]); const [messages, setMessages] = useState([]); const [text, setText] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const ngo = user?.role?.toLowerCase() === 'ngo';
  const userId = user?.id;

  const loadApplications = useCallback(async () => {
    if (!userId) return;
    try { const rows = await apiGet(ngo?'/api/applications/ngo':'/api/applications/mine'); setApplications(rows.filter(row=>row.status==='accepted')); }
    catch(err){setError(err.message);}
  },[userId,ngo]);
  const loadMessages = useCallback(async () => {
    if (!applicationId) return;
    try { setMessages(await apiGet(`/api/messages/${applicationId}`)); setError(''); }
    catch(err){setError(err.message);}
  },[applicationId]);
  useEffect(()=>{loadApplications();},[loadApplications]);
  useEffect(()=>{loadMessages();const timer=window.setInterval(loadMessages,4000);return()=>window.clearInterval(timer);},[loadMessages]);
  async function send(event){event.preventDefault();if(!text.trim())return;setBusy(true);setError('');try{await apiPost(`/api/messages/${applicationId}`,{text:text.trim()});setText('');await loadMessages();}catch(err){setError(err.message);}finally{setBusy(false);}}

  if(!ready)return <><Navbar/><main className="page-shell empty-state">Loading your conversations…</main></>;
  if(!user)return <><Navbar/><main className="page-shell empty-state"><h1>Good work happens together.</h1><p>Sign in to message a volunteer or organization after an application is accepted.</p><Link to="/login" className="primary-link">Sign in</Link></main></>;
  if(!applicationId)return <><Navbar/><main className="page-shell"><header className="page-heading"><span className="eyebrow">YOUR CONNECTIONS</span><h1>Conversations <em>with purpose.</em></h1><p>Messaging opens once an application is accepted.</p></header>{error&&<p className="form-error" role="alert">{error}</p>}<section className="dashboard-panel conversation-list">{applications.length?applications.map(app=><Link className="conversation-link" key={app._id} to={`/chat?applicationId=${app._id}`}><span className="conversation-avatar">{(app.opportunityId?.title||'S').slice(0,1).toUpperCase()}</span><span><strong>{app.opportunityId?.title||'Opportunity'}</strong><small>{ngo?app.volunteerId?.fullName:app.opportunityId?.organization||app.opportunityId?.ngoId?.organizationName||'Organization'}</small></span><b>Open →</b></Link>):<div className="empty-state"><h2>No conversations yet</h2><p>Once an application is accepted, your conversation will show up here.</p><Link to={ngo?'/ngodash':'/profile'} className="primary-link">{ngo?'Review applications':'View applications'}</Link></div>}</section></main></>;

  const active=applications.find(app=>app._id===applicationId);
  return <><Navbar/><main className="page-shell chat-shell"><Link to="/chat" className="back-link">← All conversations</Link>{error&&<p className="form-error" role="alert">{error}</p>}<section className="chat-panel"><header className="chat-panel-header"><div className="conversation-avatar">{(active?.opportunityId?.title||'S').slice(0,1).toUpperCase()}</div><div><h1>{active?.opportunityId?.title||'Project conversation'}</h1><p>{ngo?active?.volunteerId?.fullName:active?.opportunityId?.organization||active?.opportunityId?.ngoId?.organizationName||'Organization'} · Application accepted</p></div></header><div className="chat-messages-area" aria-live="polite">{messages.length?messages.map(message=><div key={message._id} className={`message-row ${message.senderId?._id===user.id?'message-sender':'message-receiver'}`}><div className="message-bubble"><p className="message-text">{message.text}</p><span className="message-time">{message.senderId?.fullName} · {new Date(message.createdAt).toLocaleString()}</span></div></div>):<p className="empty-state">Start the conversation. Share a little about what you’re hoping to accomplish together.</p>}</div><form className="chat-input-form" onSubmit={send}><textarea aria-label="Message" value={text} maxLength="2000" onChange={event=>setText(event.target.value)} placeholder="Write a message…" rows="2" required/><button className="auth-button" disabled={busy||!text.trim()}>{busy?'Sending…':'Send message'}</button></form></section></main></>;
}
