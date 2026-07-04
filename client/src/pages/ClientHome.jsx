import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Mail, Phone, MapPin, CheckCircle, Send, Cpu, Layout, Sparkles, Database, Shield, TrendingUp, Video, Star, Award, Check, Calendar, ExternalLink, X, Clock, HelpCircle, User } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { API_BASE_URL } from '../config';

const BACKUP_PROJECTS = [
  {
    _id: "backup-proj-1",
    title: "Grow Athlete",
    description: "A scale-up landing platform built for an executive startup accelerator. Includes a multi-step pricing funnel, real-time consultation scheduler, and interactive marketing ROI calculators. Reduced lead friction by 40% within the first month of deployment.",
    category: "Web Development",
    client: "Hemant",
    impact: "+180% Lead Rate",
    tags: ["React", "Fastify", "ROI Engine", "Aesthetic Funnels"],
    link: "#",
    image: "linear-gradient(135deg, #150030 0%, #3a0078 100%)"
  },
  {
    _id: "backup-proj-2",
    title: "Bloodline Battle Esports Hub",
    description: "An immersive e-sports tournament dashboard and community portal. Built with live match statistics, dynamic brackets, discord notification webhook triggers, and player registration modules. Configured to support up to 5,000 concurrent tournament participants.",
    category: "Web Development",
    client: "Lucky",
    impact: "5.2k Active Registrants",
    tags: ["React", "Real-time Brackets", "WebSockets", "Glassmorphic UI"],
    link: "#",
    image: "linear-gradient(135deg, #0b1e36 0%, #00d2ff 100%)"
  },
  {
    _id: "backup-proj-3",
    title: "Cinematic Brand Campaign",
    description: "A high-impact promotional video campaign directed and edited for a premium athletic apparel line. Features rapid pacing sync, custom color grading, layered sound design, and custom 3D VFX transitions. Reached 1.2M views on social channels.",
    category: "Video Editing",
    client: "Aero Athletic",
    impact: "1.2M Social Views",
    tags: ["Cinematic Cuts", "Color Grading", "Sound Design", "VFX Dynamics"],
    link: "#",
    image: "linear-gradient(135deg, #800020 0%, #b30000 100%)"
  }
];

const BACKUP_TESTIMONIALS = [
  {
    _id: "backup-test-1",
    name: "Marcus Vance",
    role: "CEO & Founder",
    company: "Grow Athlete",
    content: "Aperio Studio transformed our online presence completely. The user experience they designed for our platform was cinematic and converted leads better than any platform we've used in the past five years. Extremely professional team.",
    rating: 5,
    avatar: "MV"
  },
  {
    _id: "backup-test-2",
    name: "Sarah 'Valkyrie' Chen",
    role: "Tournament Director",
    company: "Bloodline Battle Esports Hub",
    content: "Our tournament registrants were amazed by the fluid bracket updates and the dark-cyber dashboard. Working with them was an absolute pleasure; they understood the aesthetics of our gaming community perfectly.",
    rating: 5,
    avatar: "SC"
  }
];

const BACKUP_REVIEWS = [
  {
    _id: "backup-rev-1",
    name: "Hemant Kumar",
    company: "Grow Athlete",
    projectName: "Grow Athlete Scale-up Funnel",
    rating: 5,
    feedback: "Aperio Studio built a world-class landing system for our startup accelerator. Our lead generation conversion rate increased by 180% within the first month. Their attention to animations and performance is lease to say, brilliant.",
    createdAt: "2026-07-03T18:00:00.000Z"
  },
  {
    _id: "backup-rev-2",
    name: "Lucky Singh",
    company: "Bloodline Esports",
    projectName: "Esports Tournament Hub",
    rating: 5,
    feedback: "The tournament portal is extremely fast, highly interactive, and handled thousands of concurrent registrations without a single hiccup. Our players loved the dark mode aesthetic and the tournament bracket layouts.",
    createdAt: "2026-07-03T19:00:00.000Z"
  }
];

export default function ClientHome() {
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [reviews, setReviews] = useState(BACKUP_REVIEWS);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Interactive modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  
  // Website Audit form states
  const [auditForm, setAuditForm] = useState({ websiteUrl: '', businessName: '', email: '', phone: '' });
  const [auditStatus, setAuditStatus] = useState(null); // 'success' | 'error' | 'submitting'
  const [auditErrorMsg, setAuditErrorMsg] = useState('');
  
  // Reviews submit form states
  const [newReview, setNewReview] = useState({ name: '', company: '', email: '', projectName: '', rating: 5, feedback: '' });
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState(null); // 'success' | 'error' | 'submitting'

  // Results Section Stats Counters
  const [projectsCounter, setProjectsCounter] = useState(0);
  const [satisfactionCounter, setSatisfactionCounter] = useState(0);
  const [ratingCounter, setRatingCounter] = useState(0);
  const [responseCounter, setResponseCounter] = useState(0);
  const [resultsSectionActive, setResultsSectionActive] = useState(false);
  
  const [trustBarStats, setTrustBarStats] = useState([
    { id: "stat-1", label: "Trusted by Businesses", value: "⭐⭐⭐⭐⭐" },
    { id: "stat-2", label: "Projects Delivered", value: "20+ Built" },
    { id: "stat-3", label: "Device Responsiveness", value: "100% Fluid" },
    { id: "stat-4", label: "SEO Audited Core", value: "Optimized" },
    { id: "stat-5", label: "Tech Stack Integration", value: "Modern MERN" },
    { id: "stat-6", label: "Client Launches", value: "Fast Track" }
  ]);

  const [clientLogos, setClientLogos] = useState([
    { name: "AERO ATHLETIC" },
    { name: "GROW ATHLETE" },
    { name: "BLOODLINE BATTLE" },
    { name: "VITALIS HEALTH" },
    { name: "NEXUS MEDIA" }
  ]);
  
  // 3D Cube mouse state
  const heroRef = useRef(null);
  const [cubeTransform, setCubeTransform] = useState({});
  const [gridTransform, setGridTransform] = useState({});
  const [isHoveredHero, setIsHoveredHero] = useState(false);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    budget: '$2,000+',
    service: 'Premium Websites',
    timeline: '1-3 Weeks',
    message: '',
    privacy: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(false);


  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);
  const faqData = [
    {
      q: "How long does a premium web platform build take?",
      a: "Typically, landing pages and boutique startup launch packages take 2-3 weeks. Complex full-stack SaaS architectures or tournament portals with real-time tournament brackets take 4-6 weeks from initial scope approval to deployment."
    },
    {
      q: "Do you offer post-deployment maintenance?",
      a: "Yes. All web solutions include 30 days of complimentary hyper-care coverage (security patches, hosting config adjustments). We also offer customized retainer plans for continuous features build and server optimization."
    },
    {
      q: "Can I manage the website content myself?",
      a: "Absolutely. We construct a secure administrative dashboard customized for your platform, allowing you to update projects, manage client testimonials, track incoming qualified leads, and view visitor statistics without typing a single line of code."
    },
    {
      q: "Will my website be optimized for Google Search (SEO)?",
      a: "Yes, SEO optimization is baked into our core engineering protocol. We implement semantic HTML5 styling, configure search meta tags, generate robot descriptors, and build high-performance speed metrics that search engines reward."
    }
  ];

  // Floating Trust Activity Alerts State
  const [activityAlert, setActivityAlert] = useState(null);
  const alerts = [
    "✧ Activity: Grow Elite accelerator platform deployed successfully 4 hours ago.",
    "✦ Trust: E-sports Hub live matches dashboard optimized to 60fps latency.",
    "✧ Deal: Mockup draft prepared for regional boutique manufacturer accelerator.",
    "✦ Metric: Grow Elite ROI calculator reduced lead friction by 40%."
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Device detection for analytics logging
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
    return 'desktop';
  };

  useEffect(() => {
    // Log visit
    fetch(`${API_BASE_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/', device: getDeviceType() })
    }).catch(err => console.log('Analytics connection error'));

    // Fetch projects
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(BACKUP_PROJECTS);
        }
      })
      .catch(err => {
        console.error('Error fetching projects, loading fallbacks:', err);
        setProjects(BACKUP_PROJECTS);
      });

    // Fetch testimonials
    fetch(`${API_BASE_URL}/api/testimonials`)
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(BACKUP_TESTIMONIALS);
        }
      })
      .catch(err => {
        console.error('Error fetching testimonials, loading fallbacks:', err);
        setTestimonials(BACKUP_TESTIMONIALS);
      });

    // Fetch public reviews
    fetch(`${API_BASE_URL}/api/reviews`)
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(BACKUP_REVIEWS);
        }
      })
      .catch(err => {
        console.error('Error fetching reviews, loading fallbacks:', err);
        setReviews(BACKUP_REVIEWS);
      });
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

  // Intersection Observer for results counter trigger
  const resultsRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setResultsSectionActive(true);
        }
      });
    }, { threshold: 0.1 });

    const el = resultsRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  // Animate count-up stats
  useEffect(() => {
    if (!resultsSectionActive) return;

    let startTime = null;
    const duration = 2000; // 2 seconds

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress * (2 - progress);

      setProjectsCounter(Math.floor(ease * 20));
      setSatisfactionCounter(Math.floor(ease * 98));
      setRatingCounter(Number((ease * 5).toFixed(1)));
      setResponseCounter(Math.floor(ease * 48));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setProjectsCounter(20);
        setSatisfactionCounter(98);
        setRatingCounter(5);
        setResponseCounter(48);
      }
    };

    requestAnimationFrame(animateCount);
  }, [resultsSectionActive]);

  // Scroll listener for the Process Timeline progress line
  const timelineRef = useRef(null);
  const [timelineProgress, setTimelineProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = timelineRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const elementHeight = rect.height;
      const elementTop = rect.top;

      const start = windowHeight / 2;
      const currentScroll = start - elementTop;
      
      let progress = 0;
      if (currentScroll > 0) {
        progress = Math.min(currentScroll / (elementHeight - 120), 1);
      }
      setTimelineProgress(progress * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle client feedback form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitStatus('submitting');
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        const savedReview = await res.json();
        setReviews(prev => [savedReview, ...prev]);
        setReviewSubmitStatus('success');
        setNewReview({ name: '', company: '', email: '', projectName: '', rating: 5, feedback: '' });
      } else {
        setReviewSubmitStatus('error');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewSubmitStatus('error');
    }
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    setAuditStatus('submitting');
    setAuditErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditForm)
      });
      if (res.ok) {
        setAuditStatus('success');
        setAuditForm({ websiteUrl: '', businessName: '', email: '', phone: '' });
      } else {
        const data = await res.json();
        setAuditStatus('error');
        setAuditErrorMsg(data.error || 'Failed to submit audit request.');
      }
    } catch (err) {
      setAuditStatus('error');
      setAuditErrorMsg('Connection timeout or network error.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAuditModalOpen(false);
        setIsBookingOpen(false);
        setIsProjectModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cycle project modal previous/next project
  const handlePrevProject = (currentProjId) => {
    const idx = projects.findIndex(p => p._id === currentProjId);
    if (idx !== -1) {
      const prevIdx = (idx - 1 + projects.length) % projects.length;
      setSelectedProject(projects[prevIdx]);
    }
  };

  const handleNextProject = (currentProjId) => {
    const idx = projects.findIndex(p => p._id === currentProjId);
    if (idx !== -1) {
      const nextIdx = (idx + 1) % projects.length;
      setSelectedProject(projects[nextIdx]);
    }
  };

  // Cycle floating trust alerts
  useEffect(() => {
    let alertIndex = 0;
    const showNextAlert = () => {
      setActivityAlert(alerts[alertIndex]);
      alertIndex = (alertIndex + 1) % alerts.length;
      
      // Auto hide alert after 6 seconds
      setTimeout(() => {
        setActivityAlert(null);
      }, 6000);
    };

    // Trigger first alert after 4 seconds
    const initialTimeout = setTimeout(showNextAlert, 4000);
    
    // Cycle alerts every 14 seconds
    const interval = setInterval(showNextAlert, 14000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    if (!formData.privacy) {
      alert('Please check the Privacy Policy verification box to continue.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Map expanded form fields cleanly into the database schema format
    const dbPayload = {
      name: formData.name,
      email: formData.email,
      businessName: formData.company || '',
      projectDetails: `Service Requested: ${formData.service}\nTarget Timeline: ${formData.timeline}\nDirect Phone: ${formData.phone || 'N/A'}\nProject Description: ${formData.message}`,
      budget: formData.budget
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });

      if (!res.ok) throw new Error('Lead submission failed');

      setSubmitStatus('success');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        budget: '$2,000+',
        service: 'Premium Websites',
        timeline: '1-3 Weeks',
        message: '',
        privacy: false
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
      {/* Keyboard Skip Navigation Link */}
      <a 
        href="#main-content" 
        style={{
          position: 'absolute',
          top: '-100px',
          left: '20px',
          background: 'var(--accent-purple)',
          color: '#fff',
          padding: '10px 20px',
          zIndex: 1000,
          borderRadius: '4px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          fontWeight: '600',
          transition: 'top 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          boxShadow: '0 10px 25px rgba(161, 79, 255, 0.3)'
        }}
        onFocus={e => e.target.style.top = '15px'}
        onBlur={e => e.target.style.top = '-100px'}
      >
        Skip to main content
      </a>

      {/* Background radial glows */}
      <div className="radial-glow" style={{ top: '-10%', left: '-10%' }} />
      <div className="radial-glow-cyan" style={{ top: '40%', right: '-15%' }} />
      <div className="radial-glow" style={{ bottom: '10%', left: '5%' }} />

      {/* Navigation Header */}
      <header role="banner" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <nav style={{
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

          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="#services" style={{ color: 'var(--text-normal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Services</a>
            <a href="#portfolio" style={{ color: 'var(--text-normal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Portfolio</a>
            <a href="#testimonials" style={{ color: 'var(--text-normal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Testimonials</a>
            <button onClick={() => setIsAuditModalOpen(true)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', background: 'transparent' }} aria-label="Open free website audit form">Free Audit</button>
            <a href="#contact" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Get in Touch</a>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content">

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
        
        {/* Ambient Shifting Aurora Glow */}
        <div className="cinematic-aurora" />
        
        <div className="hero-grid">
          {/* Left Column: Headline Copy */}
          <div>
            <div className="cinematic-reveal" style={{
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

            <h1 className="cinematic-reveal" style={{
              fontSize: 'clamp(2.6rem, 5vw, 4.8rem)',
              lineHeight: '1.15',
              fontWeight: '800',
              marginBottom: '25px',
              letterSpacing: '-1.5px',
              animationDelay: '0.15s'
            }}>
              We Craft <span className="text-gradient-purple">Premium Platforms</span> & Cinematic Visuals.
            </h1>

            <p className="cinematic-reveal" style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              color: 'var(--text-normal)',
              marginBottom: '40px',
              lineHeight: '1.7',
              fontWeight: '300',
              animationDelay: '0.35s'
            }}>
              We build premium websites and cinematic content that help businesses generate more leads, increase trust, and grow online.
            </p>

            <div className="cinematic-reveal" style={{ display: 'flex', gap: '20px', animationDelay: '0.55s' }}>
              <button onClick={() => setIsBookingOpen(true)} className="btn-primary shimmer-btn">
                Book Free Consultation <ArrowRight size={18} />
              </button>
              <a href="#portfolio" className="btn-secondary">
                View Portfolio
              </a>
            </div>

            <div className="cinematic-reveal" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px 20px',
              marginTop: '35px',
              animationDelay: '0.75s'
            }}>
              {['✓ SEO Optimized', '✓ Fast Delivery', '✓ Mobile Responsive', '✓ Secure Development', '✓ Modern Technology'].map((badge, idx) => (
                <span key={idx} style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: '500',
                  letterSpacing: '0.5px'
                }}>
                  {badge}
                </span>
              ))}
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
                  <Video style={{ color: 'var(--accent-magenta)', marginBottom: '12px' }} size={26} />
                  <span style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Video Edit</span>
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

      {/* Trust Bar (NEW) */}
      <div className="scroll-reveal" style={{ padding: '0 8%', marginTop: '-35px', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
        <div className="glass-panel" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '20px 10px',
          padding: '25px 35px',
          alignItems: 'center',
          textAlign: 'center',
          background: 'rgba(10, 4, 20, 0.65)',
          borderColor: 'rgba(161, 79, 255, 0.18)',
          boxShadow: '0 8px 32px 0 rgba(161, 79, 255, 0.05)'
        }}>
          {trustBarStats.map((stat) => (
            <div key={stat.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="text-gradient" style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '0.5px' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

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
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-head)', fontWeight: '800' }}>Core Capabilities</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            We design high-converting visual systems built with elite engineering protocols.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {[
            {
              title: "Premium Websites",
              description: "High-end corporate and portfolio sites featuring immersive 3D parallax effects, custom typography, and bespoke digital graphics.",
              benefits: "Increases brand authority, showcases elite positioning, and hooks high-ticket clients.",
              icon: <Layout size={20} />,
              color: "var(--accent-cyan)",
              bg: "rgba(0, 242, 254, 0.08)"
            },
            {
              title: "Web Applications",
              description: "Interactive SaaS solutions, customer portals, and dynamic dashboards engineered with React and robust MERN/Fastify backends.",
              benefits: "Streamlines business operations, automates user management, and scales customer utility.",
              icon: <Cpu size={20} />,
              color: "var(--accent-purple)",
              bg: "rgba(161, 79, 255, 0.08)"
            },
            {
              title: "Landing Pages",
              description: "Conversion-optimized scale-up funnels featuring rapid load speeds, interactive ROI engines, and frictionless lead forms.",
              benefits: "Reduces user acquisition costs, maximizes advertising ROI, and boosts email captures.",
              icon: <TrendingUp size={20} />,
              color: "var(--accent-magenta)",
              bg: "rgba(255, 0, 160, 0.08)"
            },
            {
              title: "Video Editing",
              description: "Elite commercial editing sync, precise color grading, layered sound design, and custom 3D VFX transitions.",
              benefits: "Increases social engagement, commands audience retention, and drives organic brand affinity.",
              icon: <Video size={20} />,
              color: "var(--accent-cyan)",
              bg: "rgba(0, 242, 254, 0.08)"
            },
            {
              title: "AI Automation",
              description: "Smart qualified lead chatbots, automated database synchronization, and automated custom email response pipelines.",
              benefits: "Saves hours of support time, qualifies prospects automatically, and converts traffic 24/7.",
              icon: <Sparkles size={20} />,
              color: "var(--accent-purple)",
              bg: "rgba(161, 79, 255, 0.08)"
            },
            {
              title: "SEO Optimization",
              description: "Semantic coding architecture, metadata schema markup, page speed auditing, and Google Search Console optimization.",
              benefits: "Generates free organic search traffic, improves keyword rankings, and establishes search authority.",
              icon: <CheckCircle size={20} />,
              color: "var(--accent-magenta)",
              bg: "rgba(255, 0, 160, 0.08)"
            },
            {
              title: "Brand Identity",
              description: "Custom corporate logo design, vector guidelines, design systems, and digital asset templates tailored for modern platforms.",
              benefits: "Ensures visual consistency, builds professional legitimacy, and creates a memorable brand.",
              icon: <Shield size={20} />,
              color: "var(--accent-cyan)",
              bg: "rgba(0, 242, 254, 0.08)"
            },
            {
              title: "Business Consultation",
              description: "Strategic audit calls, conversion audits, feature mapping worksheets, and technical architecture planning.",
              benefits: "Clarifies technical roadmaps, avoids costly design choices, and defines high-leverage growth paths.",
              icon: <Phone size={20} />,
              color: "var(--accent-purple)",
              bg: "rgba(161, 79, 255, 0.08)"
            }
          ].map((service, idx) => (
            <div key={idx} className="glass-panel scroll-reveal" style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                background: service.bg,
                color: service.color,
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '25px',
                boxShadow: `0 0 15px ${service.color}15`
              }}>
                {service.icon}
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '15px', fontFamily: 'var(--font-head)', fontWeight: '700', color: '#fff' }}>
                {service.title}
              </h3>
              <p style={{ color: 'var(--text-normal)', fontSize: '0.9rem', lineHeight: '1.65', marginBottom: '20px', flexGrow: 1 }}>
                {service.description}
              </p>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '15px', marginTop: 'auto' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px', fontWeight: '700' }}>
                  Business Benefit
                </span>
                <span style={{ fontSize: '0.82rem', color: service.color, fontWeight: '500', lineHeight: '1.4' }}>
                  {service.benefits}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scroll-Reveal Dual Engine Graphic Section (Aperio Engine) */}
      <hr className="section-divider" />
      <section className="scroll-reveal" style={{ padding: '120px 8%', background: 'rgba(10, 4, 20, 0.25)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '50px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }} className="engine-grid-responsive">
          
          {/* Left card: Cinematic Code */}
          <div className="glass-panel reveal-left" style={{ padding: '40px 30px', minHeight: '220px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layout size={20} style={{ color: 'var(--accent-cyan)' }} /> Cinematic Code
            </h3>
            <p style={{ color: 'var(--text-normal)', fontSize: '0.92rem', lineHeight: '1.65' }}>
              High-performance React architectures designed with custom 3D canvas backgrounds, interactive WebGL physics, and silky-smooth micro-animations.
            </p>
          </div>

          {/* Center Graphic: Orbiting Neon Coin */}
          <div className="reveal-scale" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="orbit-container">
              <div className="orbit-ring">
                <div className="orbit-bead" />
                <div className="orbit-bead-secondary" />
              </div>
              <div className="cinematic-coin">
                <div className="coin-shimmer" />
                <div className="cinematic-coin-inner">
                  <span className="coin-symbol">A</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right card: High-Value Visuals */}
          <div className="glass-panel reveal-right" style={{ padding: '40px 30px', minHeight: '220px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video size={20} style={{ color: 'var(--accent-purple)' }} /> High-Value Visuals
            </h3>
            <p style={{ color: 'var(--text-normal)', fontSize: '0.92rem', lineHeight: '1.65' }}>
              Elite commercial editing, custom color grading, dynamic sound design, and pacing optimized to capture attention and convert prospects.
            </p>
          </div>

        </div>
      </section>

      {/* Why Choose Us Section (NEW) */}
      <hr className="section-divider" />
      <section id="why-choose-us" className="scroll-reveal" style={{ padding: '120px 8%', background: 'rgba(5, 2, 12, 0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-head)', fontWeight: '800' }}>Why Choose Us</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
            We combine elite engineering with business logic to maximize your conversion rates and organic visibility.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '30px'
        }}>
          {[
            { title: "Fast Delivery", desc: "Deploy your premium web system in weeks, not months, using our rapid sprint architecture frameworks.", icon: <Sparkles size={20} style={{ color: 'var(--accent-cyan)' }} /> },
            { title: "Business-Focused Strategy", desc: "Every button, interaction, and headline is engineered to solve specific operational bottlenecks and capture leads.", icon: <TrendingUp size={20} style={{ color: 'var(--accent-purple)' }} /> },
            { title: "Conversion Optimized", desc: "Interactive lead calculators, qualifying bots, and sticky CTAs are customized to capture high-ticket prospects.", icon: <CheckCircle size={20} style={{ color: 'var(--accent-magenta)' }} /> },
            { title: "Modern UI/UX", desc: "Immersive glassmorphism styling, clean animations, and fluid transitions that feel premium on every interaction.", icon: <Layout size={20} style={{ color: 'var(--accent-cyan)' }} /> },
            { title: "SEO Friendly", desc: "Search console metadata markup, semantic tagging, and blazing speed performance built into our core codebase.", icon: <Check size={20} style={{ color: 'var(--accent-purple)' }} /> },
            { title: "Responsive Design", desc: "Silky-smooth layouts that scale gracefully from ultra-wide display portals down to mobile devices.", icon: <Layout size={20} style={{ color: 'var(--accent-magenta)' }} /> },
            { title: "Dedicated Support", desc: "30 days of post-launch hyper-care with available customized maintenance SLA contracts.", icon: <Shield size={20} style={{ color: 'var(--accent-cyan)' }} /> },
            { title: "Scalable Architecture", desc: "Clean modular MERN/Fastify codes prepared to expand seamlessly as your userbase scales.", icon: <Cpu size={20} style={{ color: 'var(--accent-purple)' }} /> }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel scroll-reveal" style={{ padding: '35px 25px', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', color: '#fff', fontFamily: 'var(--font-head)', fontWeight: '700' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-normal)', fontSize: '0.88rem', lineHeight: '1.55' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Process Section (NEW) */}
      <hr className="section-divider" />
      <section id="our-process" className="scroll-reveal" style={{ padding: '120px 8%', background: 'rgba(10, 4, 20, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-head)', fontWeight: '800' }}>Our Process</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
            A structured, collaborative roadmap designed to take your digital presence from strategy to high-performing deployment.
          </p>
        </div>

        <div ref={timelineRef} className="process-timeline">
          {/* Scroll progress glowing bar */}
          <div className="timeline-progress-line" style={{ height: `${timelineProgress}%` }} />

          {[
            { num: "01", title: "Discovery Call", desc: "A 30-minute scoping workshop where we dissect your business objectives, conversion bottlenecks, and project timeline requirements." },
            { num: "02", title: "Requirement Analysis", desc: "We draft a comprehensive features spec worksheet, outline backend endpoints, and align on target KPIs." },
            { num: "03", title: "UI/UX Planning", desc: "We construct high-fidelity interactive wireframes outlining animations and responsive styling, giving you a clear preview before code begins." },
            { num: "04", title: "Development Phase", desc: "We build your platform using modular React engines, semantic styling codes, custom animations, and clean server routes." },
            { num: "05", title: "Testing & QA", desc: "Rigorous diagnostic audits covering responsive layouts, load times, database security, and forms validation." },
            { num: "06", title: "Deployment Launch", desc: "Deploying your site to robust cloud hosting, setting up domain names, configuring SSL parameters, and verifying webhook emails." },
            { num: "07", title: "Support & Maintenance", desc: "30 days of hyper-care followed by retainers covering feature updates, SEO audits, and server optimization calls." }
          ].map((step, idx) => {
            const isActive = timelineProgress >= ((idx / 6) * 100) - 5;
            return (
              <div key={idx} className={`timeline-item ${isActive ? 'active' : ''} scroll-reveal`}>
                <div className="timeline-dot" />
                <div className="glass-panel timeline-content-card" style={{
                  background: isActive ? 'rgba(16, 8, 30, 0.65)' : 'var(--bg-card)',
                  borderColor: isActive ? 'rgba(0, 242, 254, 0.25)' : 'var(--glass-border)'
                }}>
                  <div className="timeline-number">{step.num}</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', fontFamily: 'var(--font-head)', fontWeight: '700', color: '#fff' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-normal)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Results Section (NEW) */}
      <hr className="section-divider" />
      <section ref={resultsRef} id="results" className="scroll-reveal" style={{ padding: '120px 8%', background: 'rgba(5, 2, 12, 0.4)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-head)', fontWeight: '800' }}>Proven Milestones</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
            Metrics and performance indicators that demonstrate our commitment to high-converting user experiences.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { value: `${projectsCounter}+`, label: "Projects Completed", desc: "Elite platforms delivered across accelerators, hubs, and video suites." },
            { value: `${satisfactionCounter}%`, label: "Client Satisfaction", desc: "Verified score reflecting project outcomes and support communication." },
            { value: `${ratingCounter}★`, label: "Average Rating", desc: "Top-tier rating based on client portal and video editing feedback." },
            { value: `${responseCounter} Hours`, label: "Avg Response Time", desc: "Our commitment to high-priority client support dispatch loops." }
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel" style={{
              padding: '40px 30px',
              textAlign: 'center',
              background: 'rgba(10, 4, 20, 0.55)',
              borderColor: 'rgba(161, 79, 255, 0.12)'
            }}>
              <span className="text-gradient" style={{
                fontSize: '2.8rem',
                fontWeight: '900',
                fontFamily: 'var(--font-head)',
                display: 'block',
                marginBottom: '10px',
                lineHeight: 1
              }}>
                {stat.value}
              </span>
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '10px', fontFamily: 'var(--font-head)', fontWeight: '700' }}>
                {stat.label}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                {stat.desc}
              </p>
            </div>
          ))}
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
              <ProjectCard project={project} onClick={() => { setSelectedProject(project); setIsProjectModalOpen(true); }} />
            </div>
          ))}
        </div>
      </section>

      {/* Client Logos Section (NEW) */}
      <hr className="section-divider" />
      <section id="client-logos" className="scroll-reveal" style={{ padding: '80px 8%', background: 'rgba(5, 2, 12, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', display: 'block', marginBottom: '10px' }}>
            Trusted Collaborations
          </span>
          <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-head)', fontWeight: '800', color: '#fff' }}>
            Powering Hyper-Growth Startups & Brands
          </h3>
        </div>

        <div className="logos-marquee">
          <div className="logos-track">
            {/* First Set */}
            {clientLogos.map((logo, i) => (
              <div key={`logo-1-${i}`} className="logo-item">
                {logo.name}
              </div>
            ))}
            {/* Duplicate set for infinite scroll marquee loop */}
            {clientLogos.map((logo, i) => (
              <div key={`logo-2-${i}`} className="logo-item">
                {logo.name}
              </div>
            ))}
          </div>
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
              {/* Star Rating & Verified Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <Star key={i} size={15} fill="#ffd700" color="#ffd700" />
                  ))}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '2px 10px', borderRadius: '15px', fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Award size={10} /> Verified Partner Audit
                </div>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(161, 79, 255, 0.15)',
                  border: '1px solid rgba(161, 79, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: 'var(--accent-purple)',
                  fontSize: '0.95rem'
                }}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: '700', color: '#fff' }}>{testimonials[activeTestimonial].name}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>{testimonials[activeTestimonial].role} at <strong>{testimonials[activeTestimonial].company}</strong></span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>USA • Verified Project Audit</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={nextTestimonial} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.borderColor = 'var(--accent-purple)'} onMouseLeave={e => e.target.style.borderColor = 'var(--glass-border)'}>
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      )}

      {/* Client Feedback Section (NEW) */}
      <hr className="section-divider" />
      <section id="feedback" className="scroll-reveal" style={{ padding: '120px 8%', background: 'rgba(10, 4, 20, 0.15)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '60px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Left Column: Average metrics and Form */}
          <div>
            <div style={{ marginBottom: '40px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-magenta)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', display: 'block', marginBottom: '10px' }}>
                Share Your Experience
              </span>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-head)', fontWeight: '800' }}>Client Feedback</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                We're committed to continuous improvements. Submit your verified audit review and rating below.
              </p>

              {/* Stats Card */}
              <div className="glass-panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '20px', padding: '15px 25px', marginTop: '25px', background: 'rgba(255, 0, 160, 0.03)', borderColor: 'rgba(255, 0, 160, 0.15)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'var(--font-head)' }}>
                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0"}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                    Average Rating
                  </span>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <div>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '5px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="#ffd700" color="#ffd700" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-normal)' }}>
                    Based on {reviews.length} verified reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleReviewSubmit} className="glass-panel" style={{ padding: '35px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-normal)', marginBottom: '8px', fontWeight: '500' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hemant Kumar"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-normal)', marginBottom: '8px', fontWeight: '500' }}>Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grow Athlete"
                    value={newReview.company}
                    onChange={(e) => setNewReview({ ...newReview, company: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-normal)', marginBottom: '8px', fontWeight: '500' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@company.com"
                    value={newReview.email}
                    onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-normal)', marginBottom: '8px', fontWeight: '500' }}>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Funnel Optimization"
                  value={newReview.projectName}
                  onChange={(e) => setNewReview({ ...newReview, projectName: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-normal)', marginBottom: '8px', fontWeight: '500' }}>Your Rating *</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={20}
                        fill={star <= newReview.rating ? "#ffd700" : "none"}
                        color={star <= newReview.rating ? "#ffd700" : "rgba(255, 255, 255, 0.2)"}
                        style={{ transition: 'all 0.2s' }}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                    {newReview.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-normal)', marginBottom: '8px', fontWeight: '500' }}>Review Feedback *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details of your experience working with Aperio Studio..."
                  value={newReview.feedback}
                  onChange={(e) => setNewReview({ ...newReview, feedback: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitStatus === 'submitting'}
                className="btn-primary shimmer-btn"
                style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: '700' }}
              >
                {reviewSubmitStatus === 'submitting' ? 'Submitting...' : 'Submit Verified Review'}
              </button>

              {reviewSubmitStatus === 'success' && (
                <div style={{ padding: '12px', background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '6px', color: 'var(--accent-cyan)', fontSize: '0.85rem', textAlign: 'center' }}>
                  Thank you! Your verified review has been submitted and auto-published.
                </div>
              )}
              {reviewSubmitStatus === 'error' && (
                <div style={{ padding: '12px', background: 'rgba(255, 0, 160, 0.08)', border: '1px solid rgba(255, 0, 160, 0.3)', borderRadius: '6px', color: 'var(--accent-magenta)', fontSize: '0.85rem', textAlign: 'center' }}>
                  Failed to submit review. Please try again.
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Dynamic Feedback Grid Wall */}
          <div style={{ maxHeight: '720px', overflowY: 'auto', paddingRight: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', display: 'block', marginBottom: '20px' }}>
              Verified Review Wall
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((rev) => (
                <div key={rev._id} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{rev.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {rev.company} {rev.projectName && `• ${rev.projectName}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={11} fill="#ffd700" color="#ffd700" />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-normal)', fontSize: '0.85rem', lineHeight: '1.55', fontStyle: 'italic' }}>
                    "{rev.feedback}"
                  </p>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.2)', alignSelf: 'flex-end', marginTop: '5px' }}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <hr className="section-divider" />
      <section id="faq" className="scroll-reveal" style={{ padding: '120px 8%', background: 'rgba(5, 2, 12, 0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Frequently Asked Inquiries</h2>
          <p style={{ color: 'var(--text-muted)' }}>Addressing architecture, process models, and project deliverables.</p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {faqData.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ 
                  padding: '24px 30px', 
                  cursor: 'pointer',
                  border: isOpen ? '1px solid rgba(161, 79, 255, 0.4)' : '1px solid var(--glass-border)',
                  boxShadow: isOpen ? '0 10px 30px rgba(161, 79, 255, 0.08)' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => toggleFaq(index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ 
                    fontSize: '1.02rem', 
                    fontWeight: '700',
                    color: isOpen ? 'var(--accent-cyan)' : 'var(--text-bright)',
                    transition: 'color 0.3s'
                  }}>
                    {faq.q}
                  </h4>
                  <ChevronRight size={18} style={{ 
                    color: isOpen ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </div>
                
                <div style={{ 
                  maxHeight: isOpen ? '200px' : '0', 
                  overflow: 'hidden', 
                  transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.4s',
                  marginTop: isOpen ? '15px' : '0'
                }}>
                  <p style={{ 
                    color: 'var(--text-normal)', 
                    fontSize: '0.92rem', 
                    lineHeight: '1.6', 
                    margin: 0,
                    textAlign: 'left'
                  }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
                  <p style={{ fontSize: '0.92rem', color: '#fff' }}>aperiostudio92@gmail.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justify: 'center', paddingLeft: '11px' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct Hotline</span>
                  <p style={{ fontSize: '0.92rem', color: '#fff' }}>+91 9849836092</p>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="glass-input" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Company Name</label>
                    <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="glass-input" placeholder="e.g. Acme Corp" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Corporate Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="glass-input" placeholder="e.g. john@business.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="glass-input" placeholder="e.g. +1 (555) 000-0000" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Service Required</label>
                    <select name="service" value={formData.service} onChange={handleInputChange} className="glass-input" style={{ background: 'rgba(10, 5, 20, 0.95)' }}>
                      <option value="Premium Websites">Premium Websites</option>
                      <option value="Web Applications">Web Applications</option>
                      <option value="Landing Pages">Landing Pages</option>
                      <option value="Video Editing">Video Editing</option>
                      <option value="AI Automation">AI Automation</option>
                      <option value="SEO Optimization">SEO Optimization</option>
                      <option value="Brand Identity">Brand Identity</option>
                      <option value="Business Consultation">Business Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Allocated Budget</label>
                    <select name="budget" value={formData.budget} onChange={handleInputChange} className="glass-input" style={{ background: 'rgba(10, 5, 20, 0.95)' }}>
                      <option value="$2,000+">$2,000+</option>
                      <option value="$5,000+">$5,000+</option>
                      <option value="$10,000+">$10,000+ (Enterprise)</option>
                      <option value="$20,000+">$20,000+ (Custom)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Target Timeline</label>
                    <select name="timeline" value={formData.timeline} onChange={handleInputChange} className="glass-input" style={{ background: 'rgba(10, 5, 20, 0.95)' }}>
                      <option value="1-3 Weeks">1-3 Weeks</option>
                      <option value="4-6 Weeks">4-6 Weeks</option>
                      <option value="2-3 Months">2-3 Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>Project Requirements</label>
                  <textarea name="message" rows="3" value={formData.message} onChange={handleInputChange} className="glass-input" placeholder="What are we building? Tell us about features, user roles, or key business goals..." style={{ resize: 'none' }}></textarea>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '5px' }}>
                  <input
                    type="checkbox"
                    name="privacy"
                    id="privacy-checkbox"
                    checked={formData.privacy}
                    onChange={handleInputChange}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="privacy-checkbox" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4', cursor: 'pointer' }}>
                    I agree to the privacy policy, and authorize Aperio Studio to contact me via email/phone regarding my web build scope audit.
                  </label>
                </div>

                {submitStatus === 'error' && (
                  <p style={{ color: '#ff4d4d', fontSize: '0.85rem', fontWeight: '500' }}>
                    Transmission error. Could not connect to API server. Please retry.
                  </p>
                )}

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button type="submit" disabled={isSubmitting} className="btn-primary shimmer-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {isSubmitting ? 'Submitting Scope...' : 'Submit Project Scope'} <Send size={15} />
                  </button>
                  <button type="button" onClick={() => setIsBookingOpen(true)} className="btn-secondary" style={{ flex: 1 }}>
                    Book Consultation
                  </button>
                </div>
                {isSubmitting && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '5px' }}>
                    Note: If the server is sleeping, spin-up can take up to 40 seconds. Thank you for your patience.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
      </main>

      {/* Free Website Audit Modal */}
      {isAuditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAuditModalOpen(false)}>
          <div className="modal-content-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '40px', position: 'relative' }}>
              
              {/* Close Button */}
              <button 
                onClick={() => setIsAuditModalOpen(false)}
                style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                aria-label="Close website audit form"
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Cpu size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '15px' }} />
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>
                  Free Website Audit
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  Submit your business website URL, and our heuristic analysis parser will score your technical performance, SEO headers, and WCAG accessibility indicators.
                </p>
              </div>

              {auditStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle size={48} style={{ color: '#00ff64', marginBottom: '15px' }} />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>Request Submitted!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                    We have successfully captured your website parameters. Our team will review the score logs and email you the full audit details shortly.
                  </p>
                  <button onClick={() => setIsAuditModalOpen(false)} className="btn-primary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label htmlFor="audit-web" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--text-bright)' }}>Website URL *</label>
                    <input 
                      id="audit-web"
                      type="url" 
                      required 
                      value={auditForm.websiteUrl} 
                      onChange={e => setAuditForm(f => ({ ...f, websiteUrl: e.target.value }))}
                      className="glass-input" 
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="audit-biz" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--text-bright)' }}>Business Name</label>
                    <input 
                      id="audit-biz"
                      type="text" 
                      value={auditForm.businessName} 
                      onChange={e => setAuditForm(f => ({ ...f, businessName: e.target.value }))}
                      className="glass-input" 
                      placeholder="My Business LLC"
                    />
                  </div>
                  <div>
                    <label htmlFor="audit-email" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--text-bright)' }}>Email Address *</label>
                    <input 
                      id="audit-email"
                      type="email" 
                      required 
                      value={auditForm.email} 
                      onChange={e => setAuditForm(f => ({ ...f, email: e.target.value }))}
                      className="glass-input" 
                      placeholder="contact@mycompany.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="audit-phone" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--text-bright)' }}>Phone Number</label>
                    <input 
                      id="audit-phone"
                      type="tel" 
                      value={auditForm.phone} 
                      onChange={e => setAuditForm(f => ({ ...f, phone: e.target.value }))}
                      className="glass-input" 
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {auditStatus === 'error' && (
                    <p style={{ color: '#ff3333', fontSize: '0.8rem', textAlign: 'center' }}>{auditErrorMsg}</p>
                  )}
                  <button type="submit" disabled={auditStatus === 'submitting'} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                    {auditStatus === 'submitting' ? 'Analyzing Site Headers...' : 'Generate Heuristic Score'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <hr className="section-divider" />
      <footer style={{
        padding: '80px 8% 40px 8%',
        background: 'rgba(5, 2, 12, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '60px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px' }}>
          
          {/* Col 1: Brand details */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <span className="text-gradient" style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: '800' }}>APERIO</span>
              <span style={{ fontSize: '0.55rem', background: 'var(--accent-purple)', color: '#fff', padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Studio</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '25px', maxWidth: '280px' }}>
              We build premium web platforms and cinematic visual content that optimize conversions, build corporate trust, and scale brands.
            </p>
            
            {/* Newsletter input */}
            <form onSubmit={(e) => { e.preventDefault(); setNewsletterStatus(true); setNewsletterEmail(''); setTimeout(() => setNewsletterStatus(false), 5000); }} style={{ display: 'flex', gap: '10px', maxWidth: '300px' }}>
              <input
                type="email"
                required
                placeholder="Join our newsletter..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Join
              </button>
            </form>
            {newsletterStatus && (
              <span style={{ display: 'block', color: 'var(--accent-cyan)', fontSize: '0.75rem', marginTop: '8px' }}>
                ✓ Subscribed! Welcome to Aperio Insights.
              </span>
            )}
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 style={{ fontSize: '0.88rem', marginBottom: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-head)', fontWeight: '700' }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><a href="#services" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Premium Websites</a></li>
              <li><a href="#services" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Web Applications</a></li>
              <li><a href="#services" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Landing Pages</a></li>
              <li><a href="#services" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Video Editing</a></li>
              <li><a href="#services" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>AI Automation</a></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 style={{ fontSize: '0.88rem', marginBottom: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-head)', fontWeight: '700' }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><a href="#why-choose-us" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Why Us</a></li>
              <li><a href="#portfolio" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Portfolio</a></li>
              <li><a href="#testimonials" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Testimonials</a></li>
              <li><a href="#faq" style={{ color: 'var(--text-normal)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>FAQ</a></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <h4 style={{ fontSize: '0.88rem', marginBottom: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-head)', fontWeight: '700' }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><span style={{ color: 'var(--text-normal)' }}>Brand Kit</span></li>
              <li><span style={{ color: 'var(--text-normal)' }}>ROI Calculator</span></li>
              <li><span style={{ color: 'var(--text-normal)' }}>MERN Boilerplate</span></li>
              <li><span style={{ color: 'var(--text-normal)' }}>Design System</span></li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div>
            <h4 style={{ fontSize: '0.88rem', marginBottom: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-head)', fontWeight: '700' }}>
              Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <li><button onClick={() => alert('Privacy Policy: Aperio Studio does not share client contact information or data scope details.')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-normal)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Privacy Policy</button></li>
              <li><button onClick={() => alert('Terms of Service: Audit scapes are delivered in 24 hours. Code deployment includes 30 days support retainers.')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-normal)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Terms & Conditions</button></li>
              <li><button onClick={() => alert('Refund Policy: Custom engineering sprints include detailed milestones. Completed milestone builds are non-refundable.')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-normal)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Refund Policy</button></li>
              <li><button onClick={() => alert('Cookie Policy: We use local cookies for web analytics visits mapping and admin authorization states.')} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-normal)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-normal)'}>Cookie Policy</button></li>
            </ul>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          paddingTop: '35px',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>© {new Date().getFullYear()} Aperio Studio. All rights reserved.</span>
          <span>Crafted with Antigravity 3D principles & MERN Architecture.</span>
        </div>
      </footer>

      {/* Floating Activity/Trust Alert Toast */}
      {activityAlert && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '25px',
            left: '25px',
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 242, 254, 0.1)',
            zIndex: 90,
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--text-bright)',
            maxWidth: '325px',
            animation: 'slideUpAlert 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/919849836092"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Message us on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.13-1.343a9.921 9.921 0 004.881 1.28c5.508 0 9.99-4.479 9.991-9.985.001-2.67-1.036-5.18-2.92-7.065A9.925 9.925 0 0012.012 2zm5.748 13.917c-.316.892-1.544 1.636-2.13 1.696-.583.06-1.168.281-3.73-1.055-3.27-1.71-5.32-5.011-5.483-5.231-.163-.22-1.3-1.745-1.3-3.327 0-1.583.815-2.36 1.107-2.66.292-.3.639-.374.85-.374.212 0 .424.001.606.01.189.008.442-.072.693.535.252.612.862 2.112.936 2.265.074.15.123.324.024.524-.099.2-.148.324-.296.499-.149.175-.313.39-.447.524-.148.15-.304.314-.132.612.172.297.765 1.272 1.642 2.057.943.844 1.737 1.107 2.032 1.254.296.147.468.123.638-.074.172-.198.742-.863.94-1.155.197-.292.395-.247.667-.147.272.099 1.728.815 2.025.962.296.148.494.22.568.347.075.123.075.717-.242 1.61z" />
        </svg>
      </a>

      {/* Booking Consultation Popup Modal */}
      {isBookingOpen && (
        <div className="modal-overlay" onClick={() => setIsBookingOpen(false)}>
          <div className="modal-content-container" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '40px', position: 'relative' }}>
              
              {/* Close Button */}
              <button 
                onClick={() => setIsBookingOpen(false)}
                style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Calendar size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '15px' }} />
                <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>
                  Book Free Consultation
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  Select an available date below for our technical scoping call. We'll audit your business model, map features, and discuss integrations.
                </p>
              </div>

              {/* Calendly Integration Placeholder / Mock Widget */}
              <div className="glass-panel" style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.04)',
                padding: '30px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Calendar Mock UI */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', maxWidth: '350px', width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <span key={day + idx} style={{ fontWeight: '700', color: 'var(--accent-purple)' }}>{day}</span>
                    ))}
                    {Array.from({ length: 28 }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const isAvailable = dayNum % 3 !== 0;
                      return (
                        <button
                          key={`mock-day-${idx}`}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            alert(`Selected Slot: July ${dayNum}, 2026 for scoping call. Slotted successfully!`);
                            setIsBookingOpen(false);
                          }}
                          style={{
                            background: isAvailable ? 'rgba(0, 242, 254, 0.05)' : 'transparent',
                            border: isAvailable ? '1px solid rgba(0, 242, 254, 0.2)' : 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            color: isAvailable ? '#fff' : 'rgba(255,255,255,0.1)',
                            cursor: isAvailable ? 'pointer' : 'default',
                            fontWeight: '600',
                            outline: 'none'
                          }}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', width: '100%' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-normal)', marginBottom: '15px' }}>
                      Or click below to view our live scheduling parameters directly.
                    </p>
                    <button 
                      type="button"
                      onClick={() => {
                        window.open('https://calendly.com', '_blank');
                        setIsBookingOpen(false);
                      }}
                      className="btn-primary shimmer-btn"
                      style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                    >
                      Open Live Calendly <ExternalLink size={13} style={{ marginLeft: '6px' }} />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Portfolio Project Detail Modal */}
      {isProjectModalOpen && selectedProject && (
        <div className="modal-overlay" onClick={() => setIsProjectModalOpen(false)}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            
            {/* Project Hero Header */}
            <div style={{
              background: selectedProject.image.includes('linear-gradient') ? selectedProject.image : `url(${selectedProject.image}) center/cover no-repeat`,
              height: '320px',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '40px'
            }}>
              {/* Image dark overlay gradient */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(5,2,12,0.2) 0%, rgba(5,2,12,0.9) 100%)', zIndex: 1 }} />
              
              {/* Close Button */}
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(5,2,12,0.6)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={e => e.target.style.borderColor = 'var(--glass-border)'}
              >
                <X size={20} />
              </button>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                  {selectedProject.category}
                </span>
                <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-head)', fontWeight: '800', color: '#fff', marginBottom: '5px' }}>
                  {selectedProject.title}
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Client: <strong>{selectedProject.client || 'Aperio Studio Partner'}</strong>
                </span>
              </div>
            </div>

            {/* Modal Body Contents */}
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '35px' }}>
              
              {/* Key Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0, 242, 254, 0.03)', borderColor: 'rgba(0, 242, 254, 0.15)' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Business Outcome</span>
                  <span className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-head)' }}>{selectedProject.impact || 'N/A'}</span>
                </div>
                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(161, 79, 255, 0.03)', borderColor: 'rgba(161, 79, 255, 0.15)' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Dev Timeline</span>
                  <span style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '700' }}>3-4 Weeks</span>
                </div>
                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 0, 160, 0.03)', borderColor: 'rgba(255, 0, 160, 0.15)' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>Target Audience</span>
                  <span style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '700' }}>B2B / Consumer</span>
                </div>
              </div>

              {/* Case Study Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }} className="modal-grid-responsive">
                
                {/* Left: Overview, Problem & Solution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Project Overview</h4>
                    <p style={{ color: 'var(--text-normal)', fontSize: '0.94rem', lineHeight: '1.75' }}>
                      {selectedProject.description}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>The Problem</h4>
                    <p style={{ color: 'var(--text-normal)', fontSize: '0.94rem', lineHeight: '1.75' }}>
                      The client was experiencing drop-offs on their legacy booking funnel. Latent asset load speeds and non-intuitive layouts resulted in lost prospects and high user acquisition friction.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-head)', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>The Solution</h4>
                    <p style={{ color: 'var(--text-normal)', fontSize: '0.94rem', lineHeight: '1.75' }}>
                      We engineered a fluid React front-end utilizing radial spotlight layers and custom Three.js canvas widget animations. We simplified the scoping form, added instant connection metrics loaders, and established async notifications qualifying leads instantly.
                    </p>
                  </div>
                </div>

                {/* Right: Stack, Features & Deliverables */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Technology Stack</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(selectedProject.tags && (Array.isArray(selectedProject.tags) ? selectedProject.tags : typeof selectedProject.tags === 'string' ? selectedProject.tags.split(',') : [])).map((tag, idx) => (
                        <span key={`tag-${idx}`} style={{
                          background: 'rgba(0, 242, 254, 0.05)',
                          border: '1px solid rgba(0, 242, 254, 0.15)',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          color: '#fff'
                        }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-head)', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Key Deliverables</h4>
                    <ul style={{ paddingLeft: '18px', color: 'var(--text-normal)', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
                      <li>Bespoke Interactive 3D Canvas Widget</li>
                      <li>High-Speed React Router Front-end</li>
                      <li>Async Email & Telegram Notifications</li>
                      <li>Mongoose / MongoDB Analytics Suite</li>
                      <li>Mobile Layout Optimization Audit</li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Bottom: Next/Prev controls and Live link */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '30px',
                marginTop: '15px'
              }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    type="button"
                    onClick={() => handlePrevProject(selectedProject._id)}
                    style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', outline: 'none' }}
                    onMouseEnter={e => e.target.style.borderColor = 'var(--accent-cyan)'}
                    onMouseLeave={e => e.target.style.borderColor = 'var(--glass-border)'}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleNextProject(selectedProject._id)}
                    style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', outline: 'none' }}
                    onMouseEnter={e => e.target.style.borderColor = 'var(--accent-cyan)'}
                    onMouseLeave={e => e.target.style.borderColor = 'var(--glass-border)'}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>

                <a 
                  href={selectedProject.link || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary shimmer-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '0.85rem' }}
                >
                  Visit Website <ExternalLink size={13} />
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
