import React from 'react';
import { Link } from '../router';

export default function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><Link to="/" className="footer-brand">SkillBridge</Link><p>Good work starts when the right skills meet the right cause.</p><nav aria-label="Footer"><Link to="/about">About</Link><Link to="/opportunities">Opportunities</Link><Link to="/contact">Contact</Link></nav><small>© {new Date().getFullYear()} SkillBridge</small></div></footer>;
}
