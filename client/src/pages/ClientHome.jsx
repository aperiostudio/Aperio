import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Mail, Phone, MapPin, CheckCircle, Send, Cpu, Layout, Sparkles, Database, Shield, TrendingUp } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';

export default function ClientHome() {
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // 3D Cube mouse state
  const heroRef = useRef(null);
  const [cubeTransform, setCubeTransform] = useState({});
  const [gridTransform, setGridTransform] = useState({});
  const [isHoveredHero, setIsHoveredHero] = useState(false);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    projectDetails: '',
    budget: '$2k - $5k'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

  // Device detection for analytics logging
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
    return 'desktop';
  };

  useEffect(() => {
    // Log visit
    fetch('http://localhost:5000/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/', device: getDeviceType() })
    }).catch(err => console.log('Analytics connection error'));

    // Fetch projects
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Error fetching projects:', err));

    // Fetch testimonials
    fetch('http://localhost:5000/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(err => console.error('Error fetching testimonials:', err));
  }, []);

  // Global mouse coordinates listener for background spotlight
  useEffect(() => {
    const updateMouseCoordinates = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', updateMouseCoordinates);
    return () => window.removeEventListener('mousemove', updateMouseCoordinates);
  }, []);

  // Intersection Observer for scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.05 });

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, [projects, testimonials]);

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    // Mouse coords relative to Hero section center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Rotate cube by up to 55 degrees based on mouse offset
    const rotX = -(y / rect.height) * 55;
    const rotY = (x / rect.width) * 55;
    
    setCubeTransform({
      transform: `rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`,
      animation: 'none'
    });

    // Rotate/tilt grid floor overlay in parallax (rotateX base is 70deg)
    const gridRotX = 70 - (y / rect.height) * 15;
    const gridRotY = (x / rect.width) * 15;
    setGridTransform({
      transform: `perspective(600px) rotateX(${gridRotX.toFixed(1)}deg) rotateY(${gridRotY.toFixed(1)}deg) translateZ(-120px)`
    });

    setIsHoveredHero(true);
  };

  const handleHeroMouseLeave = () => {
    setCubeTransform({});
    setGridTransform({});
    setIsHoveredHero(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Lead submission failed');

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        businessName: '',
        projectDetails: '',
        budget: '$2k - $5k'
      });
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTestimonial = () => {
    setActiveTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Background radial glows */}
      <div className="radial-glow" style={{ top: '-10%', left: '-10%' }} />
      <div className="radial-glow-cyan" style={{ top: '40%', right: '-15%' }} />
      <div className="radial-glow" style={{ bottom: '10%', left: '5%' }} />

      {/* Navigation Header */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '20px 8%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(5, 2, 12, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="text-gradient" style={{
            fontFamily: 'var(--font-head)',
            fontSize: '1.6rem',
            fontWeight: '800',
            letterSpacing: '1px'
          }}>
            APERIO
          </span>
          <span style={{ fontSize: '0.6rem', background: 'var(--accent-purple)', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Studio</span>
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <a href="#services" style={{ color: 'var(--text-normal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Services</a>
          <a href="#portfolio" style={{ color: 'var(--text-normal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Portfolio</a>
          <a href="#testimonials" style={{ color: 'var(--text-normal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Testimonials</a>
          <a href="#contact" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Get in Touch</a>
          <Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '20px' }} onMouseEnter={e => e.target.style.color = 'var(--accent-purple)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Admin Access</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="fade-in" 
        style={{
          minHeight: '90vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '80px 8%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Receding 3D Wireframe Parallax Grid Floor */}
        <div className="grid-overlay" style={gridTransform} />
        
        <div className="hero-grid">
          {/* Left Column: Headline Copy */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(161, 79, 255, 0.08)',
              border: '1px solid rgba(161, 79, 255, 0.2)',
              borderRadius: '30px',
              padding: '8px 18px',
              marginBottom: '25px',
              fontSize: '0.85rem',
              color: 'var(--text-bright)',
              fontWeight: '500'
            }}>
              <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span>Revealing Your Business to the Digital Era</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.6rem, 5vw, 4.8rem)',
              lineHeight: '1.15',
              fontWeight: '800',
              marginBottom: '25px',
              letterSpacing: '-1.5px'
            }}>
              We Engineer <span className="text-gradient-purple">Cinematic</span> Digital Presence.
            </h1>

            <p style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              color: 'var(--text-normal)',
              marginBottom: '40px',
              lineHeight: '1.7',
              fontWeight: '300'
            }}>
              Stunning 3D animations, custom web architectures, and smart lead-generation solutions designed to make businesses trust and scale.
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#contact" className="btn-primary shimmer-btn">
                Begin Ascent <ArrowRight size={18} />
              </a>
              <a href="#portfolio" className="btn-secondary">
                View Solutions
              </a>
            </div>
          </div>

          {/* Right Column: 3D Interactive Core Widget */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div className="cube-glow-ring" />
            <div className="cube-container">
              <div 
                className="cube"
                style={cubeTransform}
              >
                {/* 6 Cube Faces */}
                <div className="cube-face face-front">
                  <Sparkles style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }} size={26} />
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Aperio</span>
                </div>
                <div className="cube-face face-back">
                  <TrendingUp style={{ color: '#00ff64', marginBottom: '12px' }} size={26} />
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Scale</span>
                </div>
                <div className="cube-face face-right">
                  <Cpu style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} size={26} />
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>AI Build</span>
                </div>
                <div className="cube-face face-left">
                  <Database style={{ color: 'var(--accent-magenta)', marginBottom: '12px' }} size={26} />
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Mern</span>
                </div>
                <div className="cube-face face-top">
                  <Shield style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }} size={26} />
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Trust</span>
                </div>
                <div className="cube-face face-bottom">
                  <Layout style={{ color: 'var(--accent-purple)', marginBottom: '12px' }} size={26} />
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>3D UX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Horizontal Marquee Ribbon */}
      <div className="marquee-container scroll-reveal">
        <div className="marquee-track">
          <div className="marquee-item">
            <span className="marquee-text">React Engine</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">Cinematic UX</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text">Full-Stack MERN</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">AI Automation</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text">Lead Generators</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">3D Parallax</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text">Premium Brand</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">Executive Mockups</span>
            <span className="marquee-separator">✦</span>
          </div>
          <div className="marquee-item">
            <span className="marquee-text">React Engine</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">Cinematic UX</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text">Full-Stack MERN</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">AI Automation</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text">Lead Generators</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">3D Parallax</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text">Premium Brand</span>
            <span className="marquee-separator">✦</span>
            <span className="marquee-text highlight">Executive Mockups</span>
            <span className="marquee-separator">✦</span>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="scroll-reveal" style={{ padding: '120px 8%', borderTop: '1px solid var(--glass-border)', background: 'rgba(5,2,12,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Core Capabilities</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            We design high-converting visual systems built with elite engineering protocols.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '30px'
        }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '40px 30px' }}>
            <div style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center', marginBottom: '25px', paddingLeft: '13px' }}>
              <Layout size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '15px' }}>Web Architectures</h3>
            <p style={{ color: 'var(--text-normal)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Cinematic, fast, responsive interfaces using React, animations, and high-performance WebGL backdrops.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '40px 30px' }}>
            <div style={{ background: 'rgba(161, 79, 255, 0.1)', color: 'var(--accent-purple)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center', marginBottom: '25px', paddingLeft: '13px' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '15px' }}>AI Integrations</h3>
            <p style={{ color: 'var(--text-normal)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Conversational chatbots, automatic qualification pipelines, and intelligent search hubs matching business goals.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '40px 30px' }}>
            <div style={{ background: 'rgba(255, 0, 160, 0.1)', color: 'var(--accent-magenta)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center', marginBottom: '25px', paddingLeft: '13px' }}>
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '15px' }}>Full-Stack Ecosystems</h3>
            <p style={{ color: 'var(--text-normal)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              MERN stack servers, lead trackers, admin control panels, and custom database APIs designed for analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <hr className="section-divider" />
      <section id="portfolio" className="scroll-reveal" style={{ padding: '120px 8%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Recent Work</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Proof of concept case studies delivering digital value.</p>
          </div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: '600' }}>
            Scroll to explore
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px'
        }}>
          {projects.map((project) => (
            <div key={project._id} className="perspective-container">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <hr className="section-divider" />
      {testimonials.length > 0 && (
        <section id="testimonials" className="scroll-reveal" style={{ padding: '120px 8%', background: 'rgba(16, 8, 30, 0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Partnership Audits</h2>
            <p style={{ color: 'var(--text-muted)' }}>What our startup founders and corporate partners say.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
            <button onClick={prevTestimonial} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.borderColor = 'var(--accent-purple)'} onMouseLeave={e => e.target.style.borderColor = 'var(--glass-border)'}>
              <ChevronLeft size={20} />
            </button>

            <div className="glass-panel" style={{
              width: '600px',
              padding: '40px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Star Rating */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '25px' }}>
                {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                  <span key={i} style={{ color: '#ffd700', fontSize: '1.2rem' }}>★</span>
                ))}
              </div>

              {/* Quote Content */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.15rem',
                lineHeight: '1.7',
                fontStyle: 'italic',
                color: 'var(--text-bright)',
                marginBottom: '30px'
              }}>
                "{testimonials[activeTestimonial].content}"
              </p>

              {/* Avatar and Identity */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: 'rgba(161, 79, 255, 0.15)',
                  border: '1px solid rgba(161, 79, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: 'var(--accent-purple)',
                  fontSize: '0.9rem'
                }}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{testimonials[activeTestimonial].name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={nextTestimonial} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.borderColor = 'var(--accent-purple)'} onMouseLeave={e => e.target.style.borderColor = 'var(--glass-border)'}>
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <hr className="section-divider" />
      <section id="contact" className="scroll-reveal" style={{ padding: '120px 8%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '60px'
        }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '25px' }}>Initialize Ascent</h2>
            <p style={{ color: 'var(--text-normal)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '40px' }}>
              Submit your project scope, and our digital architect will perform an audit and draft a cinematic 3D mockup proposal for your business.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(161, 79, 255, 0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justify: 'center', paddingLeft: '11px' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Communications</span>
                  <p style={{ fontSize: '0.92rem', color: '#fff' }}>ascent@aperio.studio</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justify: 'center', paddingLeft: '11px' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct Hotline</span>
                  <p style={{ fontSize: '0.92rem', color: '#fff' }}>+1 (800) 900-APEX</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '40px' }}>
            {submitStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={55} style={{ color: 'var(--accent-cyan)', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>Ascent Initialized</h3>
                <p style={{ color: 'var(--text-normal)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Your submission has been captured in MongoDB. Our studio lead will analyze your business model and deliver your custom proposal within 24 hours.
                </p>
                <button onClick={() => setSubmitStatus(null)} className="btn-secondary" style={{ marginTop: '25px', padding: '10px 24px', fontSize: '0.85rem' }}>
                  Submit Another Scope
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="glass-input" placeholder="e.g. John Doe" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Corporate Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="glass-input" placeholder="e.g. john@business.com" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Business Name</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="glass-input" placeholder="e.g. Acme Corp" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Project Requirements</label>
                  <textarea name="projectDetails" rows="4" value={formData.projectDetails} onChange={handleInputChange} className="glass-input" placeholder="What are we building? Tell us about features, timelines, or your business goal..." style={{ resize: 'none' }}></textarea>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Allocated Budget</label>
                  <select name="budget" value={formData.budget} onChange={handleInputChange} className="glass-input" style={{ background: 'rgba(10, 5, 20, 0.95)' }}>
                    <option value="$2k - $5k">$2,000 - $5,000</option>
                    <option value="$5k - $10k">$5,000 - $10,000</option>
                    <option value="$10k+">$10,000+ (Enterprise)</option>
                  </select>
                </div>

                {submitStatus === 'error' && (
                  <p style={{ color: '#ff4d4d', fontSize: '0.85rem', fontWeight: '500' }}>
                    Transmission error. Could not connect to API server. Please retry.
                  </p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary shimmer-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                  {isSubmitting ? 'Submitting Scope...' : 'Submit Project Scope'} <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <hr className="section-divider" />
      <footer style={{
        padding: '60px 8% 40px 8%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <span className="text-gradient" style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: '800' }}>APERIO</span>
              <span style={{ fontSize: '0.5rem', background: 'var(--accent-purple)', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>Digital</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
              Revealing hidden potential, creating premium digital experiences, and scaling conversions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '80px' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#fff' }}>Company</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <li><a href="#services" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Services</a></li>
                <li><a href="#portfolio" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Portfolio</a></li>
                <li><a href="#testimonials" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#fff' }}>Security</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <li><Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin Dashboard</Link></li>
                <li><span style={{ color: 'var(--text-muted)' }}>Secure Portal</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          paddingTop: '30px',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>© {new Date().getFullYear()} Aperio Digital. All rights reserved.</span>
          <span>Crafted with Antigravity 3D principles.</span>
        </div>
      </footer>
    </div>
  );
}
