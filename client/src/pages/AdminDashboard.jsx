import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, FileText, TrendingUp, Laptop, Smartphone, Tablet, ChevronDown, Check, LogOut, Trash2, Plus, Calendar, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalLeads: 0,
    visitTrend: [],
    leadStatus: { new: 0, contacted: 0, converted: 0, archived: 0 },
    devices: { desktop: 0, mobile: 0, tablet: 0 }
  });
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // Forms states
  const [newProject, setNewProject] = useState({
    title: '', description: '', category: 'Web Development', client: '', impact: '', tags: '', link: '#', image: 'linear-gradient(135deg, #150030 0%, #3a0078 100%)'
  });
  const [newTestimonial, setNewTestimonial] = useState({
    name: '', role: '', company: '', content: '', rating: 5, avatar: ''
  });

  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'content'

  const getToken = () => localStorage.getItem('admin_token') || '';

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      fetchDashboardData(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        fetchDashboardData(data.token);
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Unable to connect to server API.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setPasscode('');
  };

  const fetchDashboardData = async (token) => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      if (statsRes.status === 401) return handleLogout();
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch leads
      const leadsRes = await fetch('http://localhost:5000/api/admin/leads', { headers });
      const leadsData = await leadsRes.json();
      setLeads(leadsData);

      // Fetch public items
      const projRes = await fetch('http://localhost:5000/api/projects');
      const projData = await projRes.json();
      setProjects(projData);

      const testRes = await fetch('http://localhost:5000/api/testimonials');
      const testData = await testRes.json();
      setTestimonials(testData);
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh local leads list and statistics
        fetchDashboardData(getToken());
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const formattedProj = {
        ...newProject,
        tags: newProject.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const res = await fetch('http://localhost:5000/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formattedProj)
      });

      if (res.ok) {
        setNewProject({
          title: '', description: '', category: 'Web Development', client: '', impact: '', tags: '', link: '#', image: 'linear-gradient(135deg, #150030 0%, #3a0078 100%)'
        });
        fetchDashboardData(getToken());
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) fetchDashboardData(getToken());
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    try {
      const avatarInitials = newTestimonial.avatar || newTestimonial.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const formattedTest = { ...newTestimonial, avatar: avatarInitials };

      const res = await fetch('http://localhost:5000/api/admin/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formattedTest)
      });

      if (res.ok) {
        setNewTestimonial({ name: '', role: '', company: '', content: '', rating: 5, avatar: '' });
        fetchDashboardData(getToken());
      }
    } catch (err) {
      console.error('Error creating testimonial:', err);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) fetchDashboardData(getToken());
    } catch (err) {
      console.error('Error deleting testimonial:', err);
    }
  };

  // Login Portal View
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at center, #11052c 0%, #05020c 100%)'
      }}>
        <div className="glass-panel" style={{ width: '420px', padding: '40px', border: '1px solid rgba(161, 79, 255, 0.25)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(161, 79, 255, 0.1)', color: 'var(--accent-purple)',
              display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 15px auto', border: '1px solid rgba(161, 79, 255, 0.3)'
            }}>
              <Shield size={28} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Security Portal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter administrative passcode to decrypt agency data.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode (default: admin123)"
                className="glass-input"
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '3px' }}
                required
              />
            </div>
            {authError && (
              <p style={{ color: '#ff4d4d', fontSize: '0.8rem', textAlign: 'center', fontWeight: '500' }}>
                {authError}
              </p>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Authenticate Key
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              ← Back to Client Landing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate conversion rates
  const conversionRate = stats.totalVisits > 0 
    ? ((stats.totalLeads / stats.totalVisits) * 100).toFixed(1) 
    : '0.0';

  // Sort trend to render graph
  const maxTrendCount = Math.max(...stats.visitTrend.map(t => t.count), 1);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        padding: '16px 5%',
        background: 'rgba(10, 4, 20, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1.3rem' }}>APERIO.</span>
            <span style={{ fontSize: '0.55rem', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>Control Center</span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: Decrypted</span>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', gap: '6px', fontSize: '0.8rem', height: '36px' }}>
            <LogOut size={14} /> Lock Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '40px 5%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Metric Overview Row */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0,242,254,0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justify: 'center', paddingLeft: '1px' }}>
              <Eye size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Visitor Sessions</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{stats.totalVisits}</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(161,79,255,0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justify: 'center', paddingLeft: '1px' }}>
              <FileText size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qualified Leads Captured</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{stats.totalLeads}</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,0,160,0.1)', color: 'var(--accent-magenta)', display: 'flex', alignItems: 'center', justify: 'center', paddingLeft: '1px' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Conversion Efficiency</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{conversionRate}%</h3>
            </div>
          </div>
        </section>

        {/* Analytics Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Traffic Trend Chart */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', fontWeight: '700' }}>Traffic Volume (Last 7 Days)</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingBottom: '10px' }}>
              {stats.visitTrend.map((item, index) => {
                const heightPercent = (item.count / maxTrendCount) * 100;
                return (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '10px' }}>
                    {/* Bar Tooltip */}
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>{item.count}</span>
                    {/* The Bar */}
                    <div style={{
                      width: '35px',
                      height: `${Math.max(heightPercent * 1.5, 4)}px`,
                      maxHeight: '150px',
                      background: 'linear-gradient(to top, var(--accent-purple), var(--accent-cyan))',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: '0 0 10px rgba(0, 242, 254, 0.15)',
                      transition: 'height 0.5s ease'
                    }} />
                    {/* Label */}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {item.date.substring(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Device Distribution</h3>
            
            {/* Compute device shares */}
            {(() => {
              const total = (stats.devices.desktop || 0) + (stats.devices.mobile || 0) + (stats.devices.tablet || 0) || 1;
              const dkShare = (((stats.devices.desktop || 0) / total) * 100).toFixed(0);
              const mbShare = (((stats.devices.mobile || 0) / total) * 100).toFixed(0);
              const tbShare = (((stats.devices.tablet || 0) / total) * 100).toFixed(0);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                  {/* Desktop */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-bright)' }}>
                        <Laptop size={14} style={{ color: 'var(--accent-cyan)' }} /> Desktop ({dkShare}%)
                      </span>
                      <span>{stats.devices.desktop || 0}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${dkShare}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-bright)' }}>
                        <Smartphone size={14} style={{ color: 'var(--accent-purple)' }} /> Mobile ({mbShare}%)
                      </span>
                      <span>{stats.devices.mobile || 0}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${mbShare}%`, height: '100%', background: 'var(--accent-purple)', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Tablet */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-bright)' }}>
                        <Tablet size={14} style={{ color: 'var(--accent-magenta)' }} /> Tablet ({tbShare}%)
                      </span>
                      <span>{stats.devices.tablet || 0}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${tbShare}%`, height: '100%', background: 'var(--accent-magenta)', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Navigation Tabs */}
        <section style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1px' }}>
          <button
            onClick={() => setActiveTab('leads')}
            style={{
              background: 'transparent', border: 'none', padding: '10px 20px', color: activeTab === 'leads' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '1rem', fontWeight: '700', cursor: 'pointer', borderBottom: activeTab === 'leads' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Leads Database
          </button>
          <button
            onClick={() => setActiveTab('content')}
            style={{
              background: 'transparent', border: 'none', padding: '10px 20px', color: activeTab === 'content' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '1rem', fontWeight: '700', cursor: 'pointer', borderBottom: activeTab === 'content' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Portfolio & Testimonials CRUD
          </button>
        </section>

        {/* Tab 1: Leads DB */}
        {activeTab === 'leads' && (
          <section className="glass-panel" style={{ padding: '30px', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Recent Inquiries</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 15px' }}>Date</th>
                  <th style={{ padding: '12px 15px' }}>Client Info</th>
                  <th style={{ padding: '12px 15px' }}>Budget</th>
                  <th style={{ padding: '12px 15px' }}>Project Scope Details</th>
                  <th style={{ padding: '12px 15px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No leads found. Use client page forms or chatbot to capture.</td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem', verticalAlign: 'top' }}>
                      <td style={{ padding: '16px 15px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '16px 15px' }}>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{lead.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lead.email}</div>
                        {lead.businessName && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>{lead.businessName}</div>
                        )}
                      </td>
                      <td style={{ padding: '16px 15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontWeight: '500' }}>
                          <DollarSign size={12} style={{ color: 'var(--accent-cyan)' }} />
                          {lead.budget || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 15px', maxWidth: '400px', whiteSpace: 'pre-wrap', color: 'var(--text-bright)' }}>
                        {lead.projectDetails}
                      </td>
                      <td style={{ padding: '16px 15px' }}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead._id, e.target.value)}
                          style={{
                            background: lead.status === 'new' ? 'rgba(0, 242, 254, 0.1)' : lead.status === 'contacted' ? 'rgba(161, 79, 255, 0.1)' : lead.status === 'converted' ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: lead.status === 'new' ? 'var(--accent-cyan)' : lead.status === 'contacted' ? 'var(--accent-purple)' : lead.status === 'converted' ? '#00ff64' : 'var(--text-muted)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="new" style={{ background: '#0a0414', color: '#fff' }}>New</option>
                          <option value="contacted" style={{ background: '#0a0414', color: '#fff' }}>Contacted</option>
                          <option value="converted" style={{ background: '#0a0414', color: '#fff' }}>Converted</option>
                          <option value="archived" style={{ background: '#0a0414', color: '#fff' }}>Archived</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* Tab 2: Content Management CRUD */}
        {activeTab === 'content' && (
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* PORTFOLIO CRUD */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Add Project Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} /> Add Portfolio Project
                </h3>
                <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Project Title *</label>
                      <input type="text" required value={newProject.title} onChange={e => setNewProject(p=>({...p, title: e.target.value}))} className="glass-input" placeholder="e.g. FitTrack App" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Client Name *</label>
                      <input type="text" required value={newProject.client} onChange={e => setNewProject(p=>({...p, client: e.target.value}))} className="glass-input" placeholder="e.g. FitLabs LLC" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Category *</label>
                      <select value={newProject.category} onChange={e => setNewProject(p=>({...p, category: e.target.value}))} className="glass-input" style={{ background: '#0a0414' }}>
                        <option value="Web Development">Web Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Custom SaaS">Custom SaaS</option>
                        <option value="Gaming & Esports">Gaming & Esports</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Impact Metrics</label>
                      <input type="text" value={newProject.impact} onChange={e => setNewProject(p=>({...p, impact: e.target.value}))} className="glass-input" placeholder="e.g. +140% Conversions" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Description *</label>
                    <textarea rows="3" required value={newProject.description} onChange={e => setNewProject(p=>({...p, description: e.target.value}))} className="glass-input" placeholder="Summarize features and digital solutions delivered..." style={{ resize: 'none' }}></textarea>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Tags (comma separated)</label>
                    <input type="text" value={newProject.tags} onChange={e => setNewProject(p=>({...p, tags: e.target.value}))} className="glass-input" placeholder="e.g. React, Redux, PostgreSQL" />
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                    Save Project Card
                  </button>
                </form>
              </div>

              {/* Projects List */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Portfolio List</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projects.map((proj) => (
                    <div key={proj._id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem' }}>{proj.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{proj.category}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(proj._id)}
                        style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* TESTIMONIALS CRUD */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Add Testimonial Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} /> Add Testimonial
                </h3>
                <form onSubmit={handleCreateTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Client Name *</label>
                      <input type="text" required value={newTestimonial.name} onChange={e => setNewTestimonial(t => ({ ...t, name: e.target.value }))} className="glass-input" placeholder="e.g. Clara Smith" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Role / Job Title *</label>
                      <input type="text" required value={newTestimonial.role} onChange={e => setNewTestimonial(t => ({ ...t, role: e.target.value }))} className="glass-input" placeholder="e.g. CMO" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Company Name *</label>
                      <input type="text" required value={newTestimonial.company} onChange={e => setNewTestimonial(t => ({ ...t, company: e.target.value }))} className="glass-input" placeholder="e.g. Zenith Tech" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Rating (1 - 5) *</label>
                      <input type="number" min="1" max="5" required value={newTestimonial.rating} onChange={e => setNewTestimonial(t => ({ ...t, rating: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Quote Content *</label>
                    <textarea rows="3" required value={newTestimonial.content} onChange={e => setNewTestimonial(t => ({ ...t, content: e.target.value }))} className="glass-input" placeholder="Add the client review content..." style={{ resize: 'none' }}></textarea>
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                    Save Testimonial Card
                  </button>
                </form>
              </div>

              {/* Testimonials List */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Testimonials List</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {testimonials.map((test) => (
                    <div key={test._id} style={{
                      display: 'flex', justify: 'space-between', alignItems: 'center', padding: '12px 16px',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem' }}>{test.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>{test.role}, {test.company}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteTestimonial(test._id)}
                        style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}
