import React, { useState } from 'react';
import { Link } from '../router';
import Navbar from '../components/Navbar';
import '../pages/Login.css';
import { apiPost } from '../lib/api';

export default function ForgotPassword() {
  const [email,setEmail]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [result,setResult]=useState(null);
  async function submit(event){event.preventDefault();setBusy(true);setError('');try{setResult(await apiPost('/api/auth/forgot-password',{email}));}catch(err){setError(err.message);}finally{setBusy(false);}}
  return <><Navbar/><main className="auth-container"><section className="auth-card"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>{result?'Check your next step.':'Forgot your password?'}</h1>{result?<><p className="subtitle">{result.message}</p>{result.developmentResetUrl&&<div className="dev-reset"><strong>Development reset link</strong><a href={result.developmentResetUrl}>{result.developmentResetUrl}</a><small>This link is shown only in development. Configure SMTP to email reset links.</small></div>}<Link to="/login" className="auth-button auth-button-link">Return to sign in</Link></>:<><p className="subtitle">Enter the email address on your account. We’ll send a secure reset link if it matches.</p>{error&&<p className="form-error" role="alert">{error}</p>}<form onSubmit={submit}><div className="form-group"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} required/></div><button className="auth-button" disabled={busy}>{busy?'Preparing link…':'Send reset link'}</button></form><p className="auth-footer-text"><Link to="/login" className="auth-link">Back to sign in</Link></p></>}</section></main></>;
}
