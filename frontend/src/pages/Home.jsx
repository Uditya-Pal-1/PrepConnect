import React from 'react';
import { Link } from '../router';
import Navbar from '../components/Navbar';
import collaborationImage from './assets/hero-collaboration-B4C9SJks.jpg';

const steps = [
  ['01', 'Tell us what you do', 'Build a profile around your experience, interests, and the kind of change you want to support.'],
  ['02', 'Find the right fit', 'Explore real projects by skill, cause, and time commitment.'],
  ['03', 'Work together', 'Apply, meet the organization, and make a practical contribution with a clear purpose.'],
];

export default function Home() {
  return <><Navbar/><main>
    <section className="home-hero"><div className="home-hero-copy"><span className="eyebrow"><span className="eyebrow-mark">✳</span> SKILLS WITH PURPOSE</span><h1>Put your skills to work for <em>good.</em></h1><p>SkillBridge brings skilled volunteers and community organizations together to move important work forward.</p><div className="hero-actions"><Link to="/opportunities" className="btn btn-primary">Explore opportunities <span aria-hidden="true">→</span></Link><Link to="/register" className="btn btn-secondary">Join the community</Link></div><div className="trust-note"><span className="trust-dots"><i/><i/><i/></span><span>One project. A meaningful difference.</span></div></div><div className="home-hero-visual"><img src={collaborationImage} alt="Volunteers and nonprofit teams collaborating on a community project"/><div className="floating-note"><span className="floating-note-icon">↗</span><span><strong>Skills meet mission</strong><small>Make your time count</small></span></div></div><span className="hero-orb" aria-hidden="true"/></section>
    <section className="home-intro"><div><span className="eyebrow">A BETTER WAY TO VOLUNTEER</span><h2>Good intentions are a start.<br/><em>Useful skills move work forward.</em></h2></div><p>From design and technology to teaching and research, your experience can help local organizations spend less time searching and more time making progress.</p></section>
    <section className="home-pillars"><article><span className="pillar-number">01</span><span className="pillar-icon">⌕</span><h3>Find work that fits</h3><p>Search by the skills you have, the causes you care about, and the time you can give.</p><Link to="/opportunities">Browse projects <span aria-hidden="true">→</span></Link></article><article className="pillar-feature"><span className="pillar-number">02</span><span className="pillar-icon">↗</span><h3>Make your contribution count</h3><p>Clear project briefs help you understand the need, the people you’ll work with, and the impact you can make.</p><Link to="/about">How SkillBridge works <span aria-hidden="true">→</span></Link></article><article><span className="pillar-number">03</span><span className="pillar-icon">◎</span><h3>Build lasting connections</h3><p>Meet people who share your drive, work together, and turn one good project into the next.</p><Link to="/register">Join the community <span aria-hidden="true">→</span></Link></article></section>
    <section className="home-how"><div className="how-heading"><span className="eyebrow">THOUGHTFUL WORK, MADE SIMPLE</span><h2>From first hello to <em>real impact.</em></h2><p>A small, clear path from the skills you have to work that needs doing.</p></div><div className="how-steps">{steps.map(([number,title,description])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></section>
    <section className="home-cta"><div><span className="eyebrow">START WHERE YOU ARE</span><h2>There’s good work<br/>waiting for <em>your skills.</em></h2><p>Join SkillBridge as a volunteer or nonprofit partner.</p></div><div className="cta-actions"><Link to="/register" className="btn btn-primary">Create your account <span aria-hidden="true">→</span></Link><Link to="/contact" className="cta-text-link">Questions? Talk to us</Link></div><span className="cta-pattern" aria-hidden="true">✳</span></section>
  </main></>;
}
