import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../router';
import { apiGet, apiPut } from '../lib/api';

export default function Profile() {
  const { user, ready, updateUser } = useAuth(); const [tab, setTab] = useState('profile'); const [profile, setProfile] = useState(user||{});
  const [activity, setActivity] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const ngo = user?.role?.toLowerCase() === 'ngo';
  const userId = user?.id;
  useEffect(() => {
    if (!ready) return;
    if (!userId) { setLoading(false); return; }
    Promise.all([apiGet('/api/users/profile'), apiGet(ngo?'/api/opportunities/mine':'/api/applications/mine')])
      .then(([data, items]) => { setProfile(data); updateUser(data); setActivity(items); })
      .catch(err => setError(err.message)).finally(()=>setLoading(false));
  }, [userId, ngo, updateUser, ready]);
  if (!ready) return <><Navbar/><main className="page-shell empty-state">Loading your profile…</main></>;
  if (!user) return <><Navbar/><main className="page-shell empty-state"><h1>Your profile is waiting.</h1><p>Sign in to manage your details and activity.</p><Link to="/login" className="primary-link">Sign in</Link></main></>;

  async function saveProfile(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries());
    if (!ngo) payload.skills = String(payload.skills||'').split(',').map(skill=>skill.trim()).filter(Boolean);
    try { const result = await apiPut('/api/users/profile', payload); const saved=result.user; setProfile(saved); updateUser(saved); setNotice('Your profile has been updated.'); }
    catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function changePassword(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const form=new FormData(event.currentTarget); const currentPassword=form.get('currentPassword'); const newPassword=form.get('newPassword'); const confirmPassword=form.get('confirmPassword');
    if (newPassword!==confirmPassword) { setError('Your new passwords do not match.'); setSaving(false); return; }
    try { const result=await apiPut('/api/auth/password',{currentPassword,newPassword});if(result.token)localStorage.setItem('token',result.token);setNotice(result.message);event.currentTarget.reset(); }
    catch(err){setError(err.message);} finally{setSaving(false);}
  }

  return <><Navbar/><main className="page-shell profile-shell"><header className="page-heading"><span className="eyebrow">YOUR SKILLBRIDGE ACCOUNT</span><h1>{profile.fullName||user.fullName||'Your'} <em>profile.</em></h1><p>Keep your details up to date so the right people can find and work with you.</p></header>
    <div className="profile-layout"><aside className="profile-nav"><div className="profile-avatar">{(profile.fullName||user.fullName||'S').split(' ').map(name=>name[0]).slice(0,2).join('').toUpperCase()}</div><strong>{profile.fullName||user.fullName}</strong><span>{ngo?(profile.organizationName||'NGO partner'):'Volunteer'}</span><button className={tab==='profile'?'selected':''} onClick={()=>setTab('profile')}>Profile details</button><button className={tab==='activity'?'selected':''} onClick={()=>setTab('activity')}>{ngo?'Your opportunities':'My applications'}</button><button className={tab==='security'?'selected':''} onClick={()=>setTab('security')}>Password & security</button></aside>
      <section className="profile-main">{error&&<div className="form-error" role="alert">{error}</div>}{notice&&<p className="success-message" role="status">{notice}</p>}
        {tab==='profile'&&<div className="dashboard-panel"><div className="panel-title"><div><span className="eyebrow">ACCOUNT INFORMATION</span><h2>Profile details</h2></div></div><form className="publish-form" onSubmit={saveProfile}><div className="form-row"><label>Full name<input name="fullName" defaultValue={profile.fullName||''} key={`name-${profile.fullName}`} required maxLength="100"/></label><label>Email address<input value={profile.email||''} readOnly/></label></div><label>Location<input name="location" defaultValue={profile.location||''} key={`location-${profile.location}`} placeholder="City, country or remote"/></label>{ngo?<><label>Organization name<input name="organizationName" defaultValue={profile.organizationName||''} key={`org-${profile.organizationName}`} maxLength="120"/></label><label>About your organization<textarea name="organizationDescription" defaultValue={profile.organizationDescription||''} key={`desc-${profile.organizationDescription}`} rows="4" maxLength="2000"/></label><label>Website<input name="websiteUrl" type="url" defaultValue={profile.websiteUrl||''} key={`web-${profile.websiteUrl}`} placeholder="https://"/></label></>:<><label>Skills, separated by commas<input name="skills" defaultValue={(profile.skills||[]).join(', ')} key={`skills-${(profile.skills||[]).join(',')}`} placeholder="Research, design, teaching"/></label><label>Short introduction<textarea name="bio" defaultValue={profile.bio||''} key={`bio-${profile.bio}`} rows="4" maxLength="1000" placeholder="Tell organizations what you care about and how you can help."/></label></>}<button className="auth-button" disabled={saving}>{saving?'Saving…':'Save profile'}</button></form></div>}
        {tab==='security'&&<div className="dashboard-panel"><span className="eyebrow">KEEP YOUR ACCOUNT SAFE</span><h2>Change your password</h2><form className="publish-form" onSubmit={changePassword}><label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required/></label><label>New password<input name="newPassword" type="password" autoComplete="new-password" minLength="8" required/></label><label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required/></label><button className="auth-button" disabled={saving}>{saving?'Updating…':'Update password'}</button></form></div>}
        {tab==='activity'&&<div className="dashboard-panel"><div className="panel-title"><div><span className="eyebrow">YOUR WORK</span><h2>{ngo?'Published opportunities':'Applications'}</h2></div><span className="count-badge">{activity.length}</span></div>{loading?<p className="muted-copy">Loading your activity…</p>:activity.length?activity.map(item=>ngo?<article className="dashboard-item" key={item._id}><div className="panel-title"><h3>{item.title}</h3><span className={`status-pill ${item.status}`}>{item.status==='open'?'Open':'Paused'}</span></div><p>{item.location||'Flexible'} · {item.duration||'Flexible schedule'}</p><Link className="apply-link" to="/ngodash">Manage opportunity →</Link></article>:<article className="dashboard-item" key={item._id}><div className="panel-title"><h3>{item.opportunityId?.title||'Opportunity'}</h3><span className={`status-pill ${item.status}`}>{item.status}</span></div><p>{item.opportunityId?.organization||item.opportunityId?.ngoId?.organizationName||'Community organization'}</p>{item.status==='accepted'&&<Link className="apply-link" to={`/chat?applicationId=${item._id}`}>Open conversation →</Link>}</article>):<div className="empty-state"><p>{ngo?'Your published opportunities will appear here.':'You have not applied to an opportunity yet.'}</p><Link to={ngo?'/ngodash':'/opportunities'} className="primary-link">{ngo?'Post an opportunity':'Explore opportunities'}</Link></div>}</div>}
      </section>
    </div>
  </main></>;
}
