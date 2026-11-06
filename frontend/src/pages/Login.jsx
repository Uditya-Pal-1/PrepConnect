import React, { useState } from 'react';
import { Link, useNavigate } from '../router';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { apiPost } from '../lib/api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await apiPost('/api/auth/login', { email, password });
      login(result.user, result.token); navigate(result.user.role?.toLowerCase() === 'ngo' ? '/ngodash' : '/opportunities');
    } catch (err) { setError(err.message === 'Failed to fetch' ? 'The API is unavailable. Start the backend and try again.' : err.message); }
    finally { setBusy(false); }
  }
  return <><Navbar/><main className="auth-container"><section className="auth-card"><span className="eyebrow">WELCOME BACK</span><h1>Good to see you.</h1><p className="subtitle">Sign in to continue making an impact.</p>{error && <p className="form-error" role="alert">{error}</p>}<form onSubmit={submit}><div className="form-group"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="form-group"><label htmlFor="password">Password <Link className="forgot-password-link" to="/forgot-password">Forgot password?</Link></label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></div><button className="auth-button" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><p className="auth-footer-text">New to SkillBridge? <Link to="/register" className="auth-link">Create an account</Link></p></section></main></>;
}
