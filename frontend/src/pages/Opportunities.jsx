import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from '../router';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiPost } from '../lib/api';

const getOrg = (item) => item.organization || item.ngoId?.organizationName || item.ngoId?.fullName || 'Community organization';

export default function Opportunities() {
  const { user } = useAuth();
  const [items, setItems] = useState([]); const [applications, setApplications] = useState([]);
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('All causes');
  const [loading, setLoading] = useState(true); const [busyId, setBusyId] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const opportunities = await apiGet('/api/opportunities'); setItems(opportunities);
      if (user?.role?.toLowerCase() === 'volunteer') setApplications(await apiGet('/api/applications/mine'));
      else setApplications([]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [user?.role]);
  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => ['All causes', ...new Set(items.map(item => item.category).filter(Boolean))], [items]);
  const filtered = useMemo(() => items.filter(item => (category === 'All causes' || item.category === category) && `${item.title} ${getOrg(item)} ${item.description} ${(item.requiredSkills || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [items, category, query]);
  const applied = new Set(applications.map(application => application.opportunityId?._id || application.opportunityId));

  async function apply(item) {
    if (!user) return;
    setBusyId(item._id); setNotice(''); setError('');
    try {
      await apiPost('/api/applications', { opportunityId: item._id });
      setApplications(await apiGet('/api/applications/mine')); setNotice(`Your application for “${item.title}” has been sent.`);
    } catch (err) { setError(err.message); }
    finally { setBusyId(''); }
  }

  return <><Navbar/><main className="page-shell">
    <header className="page-heading"><span className="eyebrow">FIND YOUR NEXT GOOD THING</span><h1>Make your skills <em>matter.</em></h1><p>Explore real projects from organizations creating change. Find a cause that speaks to you and put your skills to work.</p></header>
    <section className="opportunity-tools"><input aria-label="Search opportunities" placeholder="Search by skill, project, or organization" value={query} onChange={event=>setQuery(event.target.value)}/><select aria-label="Filter by cause" value={category} onChange={event=>setCategory(event.target.value)}>{categories.map(value=><option key={value}>{value}</option>)}</select></section>
    {notice&&<p className="success-message" role="status">{notice} <Link to="/profile">View your applications</Link></p>}{error&&<div className="form-error" role="alert">{error}<button className="text-button" onClick={load}>Try again</button></div>}
    <p className="result-count">{loading?'Loading opportunities…':`${filtered.length} ${filtered.length===1?'opportunity':'opportunities'}`}</p>
    {!loading&&<section className="opportunity-grid">{filtered.map(item=><article className="opportunity-card" key={item._id}><div className="card-meta"><span className="category-pill">{item.category||'Community'}</span><span>{item.location||'Flexible'}</span></div><h2>{item.title}</h2><p className="organization-name">{getOrg(item)}</p><p className="opportunity-description">{item.description}</p><div className="skill-tags">{(item.requiredSkills||[]).map(skill=><span key={skill}>{skill}</span>)}</div><div className="opportunity-bottom"><span>{item.duration||'Flexible schedule'}</span>{!user?<Link className="apply-link" to="/login">Sign in to apply</Link>:user.role?.toLowerCase()!=='volunteer'?<span>Volunteer applications</span>:applied.has(item._id)?<span className="applied-label">Applied ✓</span>:<button disabled={busyId===item._id} onClick={()=>apply(item)}>{busyId===item._id?'Sending…':'Apply now'}</button>}</div></article>)}</section>}
    {!loading&&!filtered.length&&!error&&<div className="empty-state"><h2>No opportunities match your search yet.</h2><p>Try another skill or check back soon. NGOs can <Link to="/register">create an account</Link> to post opportunities.</p></div>}
  </main></>;
}
