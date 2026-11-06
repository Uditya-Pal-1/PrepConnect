import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../router';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';

export default function NgoDash() {
  const { user, ready } = useAuth(); const [opportunities, setOpportunities] = useState([]); const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const [posts, apps] = await Promise.all([apiGet('/api/opportunities/mine'), apiGet('/api/applications/ngo')]); setOpportunities(posts); setApplications(apps); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (!ready) return; if (user?.role?.toLowerCase() === 'ngo') load(); else setLoading(false); }, [ready, user?.id, user?.role, load]);

  if (!ready) return <><Navbar/><main className="page-shell empty-state">Loading your workspace…</main></>;
  if (!user || user.role?.toLowerCase() !== 'ngo') return <><Navbar/><main className="page-shell empty-state"><span className="eyebrow">ORGANIZATION WORKSPACE</span><h1>Welcome to your NGO dashboard.</h1><p>Sign in with an organization account to manage opportunities and meet volunteers.</p><Link to="/login" className="primary-link">Sign in</Link></main></>;

  async function create(event) {
    event.preventDefault(); setBusy(true); setNotice(''); setError('');
    const form = new FormData(event.currentTarget);
    const payload = { title: form.get('title'), description: form.get('description'), requiredSkills: String(form.get('skills')).split(',').map(skill=>skill.trim()).filter(Boolean), location: form.get('location'), duration: form.get('duration'), category: form.get('category'), organization: user.organizationName || user.fullName };
    try { await apiPost('/api/opportunities', payload); event.currentTarget.reset(); setNotice('Your opportunity is live.'); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function review(applicationId, status) {
    setBusy(true); setError('');
    try { await apiPut(`/api/applications/${applicationId}`, { status }); setNotice(`Application ${status}.`); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm('Remove this opportunity and its applications?')) return;
    setBusy(true); setError('');
    try { await apiDelete(`/api/opportunities/${id}`); setNotice('Opportunity removed.'); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function toggle(item) {
    setBusy(true); setError('');
    try { await apiPut(`/api/opportunities/${item._id}`, { status: item.status === 'open' ? 'close' : 'open' }); setNotice(item.status === 'open' ? 'Listing paused.' : 'Listing reopened.'); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <><Navbar/><main className="page-shell dashboard-shell"><header className="page-heading"><span className="eyebrow">ORGANIZATION WORKSPACE</span><h1>Build a team around <em>your mission.</em></h1><p>Publish meaningful work, review volunteer applications, and collaborate with people who care.</p></header>
    <div className="dashboard-stats"><div><strong>{opportunities.length}</strong><span>Opportunities</span></div><div><strong>{opportunities.filter(item=>item.status==='open').length}</strong><span>Open roles</span></div><div><strong>{applications.filter(app=>app.status==='pending').length}</strong><span>To review</span></div><div><strong>{applications.filter(app=>app.status==='accepted').length}</strong><span>Matched</span></div></div>
    {notice&&<p className="success-message" role="status">{notice}</p>}{error&&<div className="form-error" role="alert">{error}<button className="text-button" onClick={load}>Try again</button></div>}
    <div className="dashboard-grid"><section className="dashboard-panel"><span className="eyebrow">CREATE A LISTING</span><h2>Invite the right people in.</h2><form className="publish-form" onSubmit={create}><label>Opportunity title<input name="title" required maxLength="140" placeholder="e.g. Refresh our community website"/></label><label>Project overview<textarea name="description" rows="4" required maxLength="4000" placeholder="Describe the work, goals, and who it will help."/></label><div className="form-row"><label>Skills, separated by commas<input name="skills" required placeholder="Design, research, writing"/></label><label>Cause<select name="category" required><option>Technology</option><option>Design</option><option>Education</option><option>Environment</option><option>Community</option><option>Health</option></select></label></div><div className="form-row"><label>Location<input name="location" required placeholder="Remote or a city"/></label><label>Time commitment<input name="duration" required placeholder="e.g. 3 weeks"/></label></div><button className="auth-button" disabled={busy}>{busy?'Saving…':'Publish opportunity'}</button></form></section>
      <div className="dashboard-column"><section className="dashboard-panel"><div className="panel-title"><div><span className="eyebrow">YOUR LISTINGS</span><h2>Open opportunities</h2></div><span className="count-badge">{opportunities.length}</span></div>{loading?<p className="muted-copy">Loading your listings…</p>:opportunities.length?opportunities.map(item=><article className="dashboard-item" key={item._id}><div className="panel-title"><h3>{item.title}</h3><span className={`status-pill ${item.status}`}>{item.status==='open'?'Open':'Paused'}</span></div><p>{item.location||'Flexible'} · {item.duration||'Flexible'} · {applications.filter(app=>(app.opportunityId?._id||app.opportunityId)===item._id).length} applicants</p><div className="button-row"><button className="secondary-button" disabled={busy} onClick={()=>toggle(item)}>{item.status==='open'?'Pause listing':'Reopen listing'}</button><button className="danger-button" disabled={busy} onClick={()=>remove(item._id)}>Remove</button></div></article>):<p className="muted-copy">No listings yet. Publish your first opportunity on the left.</p>}</section>
      <section className="dashboard-panel"><div className="panel-title"><div><span className="eyebrow">VOLUNTEERS</span><h2>Applications</h2></div><span className="count-badge">{applications.length}</span></div>{loading?<p className="muted-copy">Loading applications…</p>:applications.length?applications.map(app=><article className="dashboard-item applicant-item" key={app._id}><div><h3>{app.volunteerId?.fullName||'Volunteer'}</h3><p>{app.opportunityId?.title} · {app.volunteerId?.email}</p><div className="skill-tags">{(app.volunteerId?.skills||[]).map(skill=><span key={skill}>{skill}</span>)}</div></div><div className="applicant-actions"><span className={`status-pill ${app.status}`}>{app.status}</span>{app.status==='pending'&&<div className="button-row"><button disabled={busy} onClick={()=>review(app._id,'accepted')}>Accept</button><button className="secondary-button" disabled={busy} onClick={()=>review(app._id,'rejected')}>Decline</button></div>}{app.status==='accepted'&&<Link className="apply-link" to={`/chat?applicationId=${app._id}`}>Open conversation →</Link>}</div></article>):<p className="muted-copy">When volunteers apply, you’ll find them here.</p>}</section></div></div>
  </main></>;
}
