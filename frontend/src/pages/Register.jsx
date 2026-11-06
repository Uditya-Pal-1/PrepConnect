import React, { useState } from 'react';
import { Link, useNavigate } from '../router';
import Navbar from '../components/Navbar';
import './Login.css';
import { apiPost } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [accountType, setAccountType] = useState('volunteer');

  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerPassword, setVolunteerPassword] = useState('');
  const [volunteerSkills, setVolunteerSkills] = useState('');
  const [volunteerLocation, setVolunteerLocation] = useState('');

  const [ngoName, setNgoName] = useState('');
  const [ngoEmail, setNgoEmail] = useState('');
  const [ngoPassword, setNgoPassword] = useState('');
  const [ngoWebsite, setNgoWebsite] = useState('');
  const [ngoLocation, setNgoLocation] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const isNgo = accountType === 'ngo';
    const payload = isNgo
      ? { fullName: ngoName, organizationName: ngoName, email: ngoEmail, password: ngoPassword, role: 'NGO', websiteUrl: ngoWebsite, location: ngoLocation }
      : { fullName: volunteerName, email: volunteerEmail, password: volunteerPassword, role: 'VOLUNTEER', skills: volunteerSkills.split(',').map(skill => skill.trim()).filter(Boolean), location: volunteerLocation };
    try {
      const result = await apiPost('/api/auth/register', payload);
      login(result.user, result.token);
      navigate(isNgo ? '/ngodash' : '/opportunities');
    } catch (err) { setError(err.message === 'Failed to fetch' ? 'The API is unavailable. Start the backend and try again.' : err.message); }
    finally { setBusy(false); }
  };

  return (
    <div><Navbar/>
    <div className="auth-container">
      <div className="auth-card">
        <h1>Join SkillBridge</h1>
        <p className="subtitle">Create your account and start making an impact</p>

        <div className="account-type-selector">
          <button
            type="button"
            className={`selector-btn ${accountType === 'volunteer' ? 'active' : ''}`}
            onClick={() => setAccountType('volunteer')}
          >
            <span className="icon">👤</span> Volunteer
          </button>
          <button
            type="button"
            className={`selector-btn ${accountType === 'ngo' ? 'active' : ''}`}
            onClick={() => setAccountType('ngo')}
          >
            <span className="icon">🏢</span> NGO
          </button>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          {accountType === 'volunteer' ? (
            <>
              <div className="form-group">
                <label htmlFor="volunteerName">Full Name</label>
                <input
                  type="text"
                  id="volunteerName"
                  placeholder="Full Name"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="volunteerEmail">Email</label>
                <input
                  type="email"
                  id="volunteerEmail"
                  placeholder="your@example.com"
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="volunteerPassword">Password</label>
                <input
                  type="password"
                  id="volunteerPassword"
                  placeholder="********"
                  value={volunteerPassword}
                  onChange={(e) => setVolunteerPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="volunteerSkills">Skills (comma separated)</label>
                <input
                  type="text"
                  id="volunteerSkills"
                  placeholder="Web Development, Design, Marketing"
                  value={volunteerSkills}
                  onChange={(e) => setVolunteerSkills(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="volunteerLocation">Location</label>
                <input
                  type="text"
                  id="volunteerLocation"
                  placeholder="NEW DELHI, INDIA"
                  value={volunteerLocation}
                  onChange={(e) => setVolunteerLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="auth-button" disabled={busy}>
                {busy ? 'Creating account…' : 'Create Volunteer Account'}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="ngoName">Organization Name</label>
                <input
                  type="text"
                  id="ngoName"
                  placeholder="Your NGO Name"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngoEmail">Organization Email</label>
                <input
                  type="email"
                  id="ngoEmail"
                  placeholder="contact@ngo.org"
                  value={ngoEmail}
                  onChange={(e) => setNgoEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngoPassword">Password</label>
                <input
                  type="password"
                  id="ngoPassword"
                  placeholder="********"
                  value={ngoPassword}
                  onChange={(e) => setNgoPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngoWebsite">Website (optional)</label>
                <input
                  type="url"
                  id="ngoWebsite"
                  placeholder="https://yourngo.org"
                  value={ngoWebsite}
                  onChange={(e) => setNgoWebsite(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngoLocation">Location</label>
                <input
                  type="text"
                  id="ngoLocation"
                  placeholder="San Francisco, USA"
                  value={ngoLocation}
                  onChange={(e) => setNgoLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="auth-button" disabled={busy}>
                {busy ? 'Creating account…' : 'Create NGO Account'}
              </button>
            </>
          )}
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Register;
