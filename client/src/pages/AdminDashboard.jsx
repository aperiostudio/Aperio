import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Eye, FileText, TrendingUp, Laptop, Smartphone, Tablet, 
  ChevronDown, Check, LogOut, Trash2, Plus, Calendar, DollarSign, Edit, 
  X, Search, Bell, Folder, User, Settings, Activity, Grid, ExternalLink, 
  ChevronLeft, ChevronRight, Upload, Download, HelpCircle, Briefcase, 
  Lock, PlusCircle, Filter, CheckCircle, AlertCircle, Inbox, UserPlus, 
  Menu, Users, MessageSquare, Clipboard, Image, ShieldAlert, CheckSquare, 
  Heart, Sliders, Volume2, Globe, Clock, Layers
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Navigation
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'crm' | 'leads' | 'services' | 'portfolio' | 'testimonials' | 'feedback' | 'logos' | 'faq' | 'media' | 'logs' | 'team' | 'settings'
  
  // Filters & Global Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterBudget, setFilterBudget] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'

  // CRM Kanban states
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  // Detail side-drawer state
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  
  // Core lists state
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
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [logos, setLogos] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [reviews, setReviews] = useState([]); // all feedback
  
  // Configurations state
  const [agencySettings, setAgencySettings] = useState({
    companyName: 'Aperio Studio',
    email: 'aperiostudio92@gmail.com',
    phone: '+1 (555) 000-0000',
    whatsApp: '1234567890',
    address: 'San Francisco, CA',
    businessHours: '9 AM - 6 PM EST',
    socialLinks: { twitter: '', linkedin: '', github: '' }
  });
  
  // Notification center
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // CRUD active items
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '', slug: '', category: 'Web Development', client: '', industry: 'Technology',
    techStack: '', duration: '3-4 Weeks', description: '', problem: '', solution: '',
    results: '', thumbnail: '', liveUrl: '', gitHubUrl: '', featuredProject: false,
    seoTitle: '', seoDescription: '', publishStatus: 'published', order: 0
  });

  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '', role: '', company: '', content: '', rating: 5, avatar: '',
    position: '', image: '', country: 'US', project: '', visibility: true, featured: false
  });

  const [editingFaqId, setEditingFaqId] = useState(null);
  const [newFaq, setNewFaq] = useState({
    question: '', answer: '', category: 'General', order: 0, visibility: true
  });

  const [editingServiceId, setEditingServiceId] = useState(null);
  const [newService, setNewService] = useState({
    title: '', description: '', icon: 'Layers', features: '', order: 0, visibility: true, featured: false
  });

  const [editingLogoId, setEditingLogoId] = useState(null);
  const [newLogo, setNewLogo] = useState({
    name: '', url: 'https://cdn.logo.com/placeholder.png', visibility: true, hoverColor: '#00f2fe', altText: '', order: 0
  });

  const [newMedia, setNewMedia] = useState({
    name: '', url: '', folder: 'General', type: 'image', size: 1024
  });

  const [newTeamMember, setNewTeamMember] = useState({
    username: '', email: '', role: 'Admin', profileImage: ''
  });

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

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
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
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
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      // stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
      if (statsRes.status === 401) {
        setDashboardLoading(false);
        return handleLogout();
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // leads
      const leadsRes = await fetch(`${API_BASE_URL}/api/admin/leads`, { headers });
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData);
      }

      // projects
      const projRes = await fetch(`${API_BASE_URL}/api/projects`);
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
      }

      // testimonials
      const testRes = await fetch(`${API_BASE_URL}/api/testimonials`);
      if (testRes.ok) {
        const testData = await testRes.json();
        setTestimonials(testData);
      }

      // services
      const servRes = await fetch(`${API_BASE_URL}/api/services`);
      if (servRes.ok) {
        const servData = await servRes.json();
        setServices(servData);
      }

      // faqs
      const faqRes = await fetch(`${API_BASE_URL}/api/faqs`);
      if (faqRes.ok) {
        const faqData = await faqRes.json();
        setFaqs(faqData);
      }

      // logos
      const logoRes = await fetch(`${API_BASE_URL}/api/logos`);
      if (logoRes.ok) {
        const logoData = await logoRes.json();
        setLogos(logoData);
      }

      // activity logs
      const logsRes = await fetch(`${API_BASE_URL}/api/admin/logs`, { headers });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setActivityLogs(logsData);
      }

      // notifications
      const notRes = await fetch(`${API_BASE_URL}/api/admin/notifications`, { headers });
      if (notRes.ok) {
        const notData = await notRes.json();
        setNotifications(notData);
      }

      // media library
      const mediaRes = await fetch(`${API_BASE_URL}/api/admin/media`, { headers });
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaList(mediaData);
      }

      // team
      const teamRes = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData);
      }

      // all reviews
      const reviewsRes = await fetch(`${API_BASE_URL}/api/admin/reviews`, { headers });
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      }

      // configurations
      const configRes = await fetch(`${API_BASE_URL}/api/admin/settings`, { headers });
      if (configRes.ok) {
        const configData = await configRes.json();
        setAgencySettings(configData.agency || agencySettings);
      }

      setDashboardLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
      setDashboardError('Connection timeout: Render database spin-up in progress or network issue.');
      setDashboardLoading(false);
    }
  };

  // CRM Update details & Notes entry
  const handleUpdateLeadCrm = async (leadId, updateData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/leads/${leadId}/crm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l._id === leadId ? updated : l));
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(updated);
        }
      }
    } catch (err) {
      console.error('Error updating CRM details:', err);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedLead) return;
    const noteObj = {
      sender: 'Admin',
      text: newNote,
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [...(selectedLead.conversations || []), noteObj];
    const timelineEntry = {
      action: `Note added: "${newNote.substring(0, 30)}..."`,
      date: new Date().toISOString(),
      user: 'Admin'
    };
    const updatedTimeline = [...(selectedLead.timeline || []), timelineEntry];

    handleUpdateLeadCrm(selectedLead._id, {
      conversations: updatedHistory,
      timeline: updatedTimeline
    });
    setNewNote('');
  };

  // Drag and Drop handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDraggedOverColumn(column);
  };

  const handleDropLead = async (e, column) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const leadObj = leads.find(l => l._id === leadId);
    if (!leadObj || leadObj.status === column) return;

    const timelineEntry = {
      action: `Stage transitioned from '${leadObj.status}' to '${column}'`,
      date: new Date().toISOString(),
      user: 'Admin'
    };
    const updatedTimeline = [...(leadObj.timeline || []), timelineEntry];

    await handleUpdateLeadCrm(leadId, { 
      status: column,
      timeline: updatedTimeline
    });

    // Notify activity
    fetch(`${API_BASE_URL}/api/admin/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ action: `Lead '${leadObj.name}' transitioned to '${column}'` })
    }).catch(e => {});
  };

  // File Exporter
  const handleExportData = (dataList, format, filename) => {
    let content = '';
    let mimeType = 'text/csv';
    
    if (format === 'json') {
      content = JSON.stringify(dataList, null, 2);
      mimeType = 'application/json';
    } else {
      if (dataList.length > 0) {
        const headers = Object.keys(dataList[0]).join(',');
        const rows = dataList.map(row => 
          Object.values(row).map(v => 
            typeof v === 'object' 
              ? `"${JSON.stringify(v).replace(/"/g, '""')}"` 
              : `"${String(v).replace(/"/g, '""')}"`
          ).join(',')
        );
        content = [headers, ...rows].join('\n');
      }
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_export.${format}`;
    link.click();
  };

  // CSV Bulk Importer
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(Boolean);
        if (lines.length <= 1) return;
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const lead = {};
          headers.forEach((h, idx) => {
            lead[h] = values[idx] || '';
          });
          parsed.push(lead);
        }
        
        const res = await fetch(`${API_BASE_URL}/api/admin/leads/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(parsed)
        });
        
        if (res.ok) {
          alert('CSV leads sheet imported successfully!');
          fetchDashboardData(getToken());
        }
      } catch (err) {
        alert('Failed parsing CSV fields.');
      }
    };
    reader.readAsText(file);
  };

  // Project CRUD execution
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const stackArr = typeof newProject.techStack === 'string'
        ? newProject.techStack.split(',').map(t => t.trim()).filter(Boolean)
        : newProject.techStack;

      const payload = {
        ...newProject,
        tags: stackArr,
        techStack: stackArr
      };

      const url = editingProjectId 
        ? `${API_BASE_URL}/api/admin/projects/${editingProjectId}`
        : `${API_BASE_URL}/api/admin/projects`;
      const method = editingProjectId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewProject({
          title: '', slug: '', category: 'Web Development', client: '', industry: 'Technology',
          techStack: '', duration: '3-4 Weeks', description: '', problem: '', solution: '',
          results: '', thumbnail: '', liveUrl: '', gitHubUrl: '', featuredProject: false,
          seoTitle: '', seoDescription: '', publishStatus: 'published', order: 0
        });
        setEditingProjectId(null);
        fetchDashboardData(getToken());
      }
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const handleStartEditProject = (p) => {
    setEditingProjectId(p._id);
    setNewProject({
      title: p.title || '',
      slug: p.slug || '',
      category: p.category || 'Web Development',
      client: p.client || '',
      industry: p.industry || 'Technology',
      techStack: Array.isArray(p.techStack) ? p.techStack.join(', ') : p.tags ? p.tags.join(', ') : '',
      duration: p.duration || '3-4 Weeks',
      description: p.description || '',
      problem: p.problem || '',
      solution: p.solution || '',
      results: p.results || '',
      thumbnail: p.thumbnail || p.image || '',
      liveUrl: p.liveUrl || p.link || '',
      gitHubUrl: p.gitHubUrl || '',
      featuredProject: !!p.featuredProject,
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      publishStatus: p.publishStatus || 'published',
      order: p.order || 0
    });
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Testimonial CRUD
  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    try {
      const url = editingTestimonialId
        ? `${API_BASE_URL}/api/admin/testimonials/${editingTestimonialId}`
        : `${API_BASE_URL}/api/admin/testimonials`;
      const method = editingTestimonialId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(newTestimonial)
      });
      if (res.ok) {
        setNewTestimonial({
          name: '', role: '', company: '', content: '', rating: 5, avatar: '',
          position: '', image: '', country: 'US', project: '', visibility: true, featured: false
        });
        setEditingTestimonialId(null);
        fetchDashboardData(getToken());
      }
    } catch (e) {}
  };

  const handleStartEditTestimonial = (t) => {
    setEditingTestimonialId(t._id);
    setNewTestimonial({
      name: t.name || '',
      role: t.role || '',
      company: t.company || '',
      content: t.content || '',
      rating: t.rating || 5,
      avatar: t.avatar || '',
      position: t.position || t.role || '',
      image: t.image || t.avatar || '',
      country: t.country || 'US',
      project: t.project || '',
      visibility: t.visibility !== false,
      featured: !!t.featured
    });
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Delete testimonial?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // FAQs CRUD
  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      const url = editingFaqId 
        ? `${API_BASE_URL}/api/admin/faqs/${editingFaqId}`
        : `${API_BASE_URL}/api/admin/faqs`;
      const method = editingFaqId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(newFaq)
      });
      if (res.ok) {
        setNewFaq({ question: '', answer: '', category: 'General', order: 0, visibility: true });
        setEditingFaqId(null);
        fetchDashboardData(getToken());
      }
    } catch (e) {}
  };

  const handleDeleteFaq = async (id) => {
    if (!confirm('Delete FAQ?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Services CRUD
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const featuresArr = typeof newService.features === 'string'
        ? newService.features.split(',').map(f => f.trim()).filter(Boolean)
        : newService.features;

      const payload = { ...newService, features: featuresArr };

      const url = editingServiceId
        ? `${API_BASE_URL}/api/admin/services/${editingServiceId}`
        : `${API_BASE_URL}/api/admin/services`;
      const method = editingServiceId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewService({ title: '', description: '', icon: 'Layers', features: '', order: 0, visibility: true, featured: false });
        setEditingServiceId(null);
        fetchDashboardData(getToken());
      }
    } catch (e) {}
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Delete Service?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Client Logos CRUD
  const handleCreateLogo = async (e) => {
    e.preventDefault();
    try {
      const url = editingLogoId
        ? `${API_BASE_URL}/api/admin/logos/${editingLogoId}`
        : `${API_BASE_URL}/api/admin/logos`;
      const method = editingLogoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(newLogo)
      });
      if (res.ok) {
        setNewLogo({ name: '', url: 'https://cdn.logo.com/placeholder.png', visibility: true, hoverColor: '#00f2fe', altText: '', order: 0 });
        setEditingLogoId(null);
        fetchDashboardData(getToken());
      }
    } catch (e) {}
  };

  const handleDeleteLogo = async (id) => {
    if (!confirm('Delete Logo?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/logos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Reviews CRUD (Approve, Reject, Reply)
  const handleUpdateReview = async (id, updateData) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(updateData)
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Delete Review?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Media Library CRUD
  const handleCreateMedia = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(newMedia)
      });
      if (res.ok) {
        setNewMedia({ name: '', url: '', folder: 'General', type: 'image', size: 1024 });
        fetchDashboardData(getToken());
      }
    } catch (e) {}
  };

  const handleDeleteMedia = async (id) => {
    if (!confirm('Delete media file?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Team CRUD
  const handleCreateTeamMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(newTeamMember)
      });
      if (res.ok) {
        setNewTeamMember({ username: '', email: '', role: 'Admin', profileImage: '' });
        fetchDashboardData(getToken());
      }
    } catch (e) {}
  };

  const handleDeleteTeamMember = async (id) => {
    if (!confirm('Remove team member?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Configurations settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ agency: agencySettings })
      });
      alert('Settings updated successfully!');
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Notifications bell actions
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/notifications/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  const handleClearNotifications = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/notifications`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      fetchDashboardData(getToken());
    } catch (e) {}
  };

  // Decrypt check loading views
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', border: '1px solid rgba(161, 79, 255, 0.3)'
            }}>
              <Shield size={28} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontFamily: 'var(--font-head)' }}>Security Decryption</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter administrative key passcode to unlock AMS CRM dashboard.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Secure passcode"
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
              Decrypt Key
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
              ← Return to Client Landing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05020c',
        gap: '20px',
        padding: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(161, 79, 255, 0.1)',
          borderTopColor: 'var(--accent-purple)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} className="animate-spin" />
        <h3 style={{ fontSize: '1.4rem', color: '#fff', textAlign: 'center', fontFamily: 'var(--font-head)' }}>
          Syncing Server API Data...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', maxWidth: '450px', lineHeight: '1.6' }}>
          Render spins down free web hosts after 15 minutes of inactivity. Booting database layers can take up to 40 seconds.
        </p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05020c',
        gap: '30px',
        padding: '20px 8%',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ff4d4d', fontSize: '1.15rem', maxWidth: '600px', lineHeight: '1.7', background: 'rgba(255, 77, 77, 0.05)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
          {dashboardError}
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => fetchDashboardData(getToken())} className="btn-primary shimmer-btn" style={{ padding: '12px 30px' }}>
            Retry Connection
          </button>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '12px 30px' }}>
            Logout Portal
          </button>
        </div>
      </div>
    );
  }

  // CRM Pipeline columns
  const PIPELINE_COLUMNS = [
    { key: 'new', label: 'New', color: 'var(--accent-cyan)' },
    { key: 'contacted', label: 'Contacted', color: '#00d2ff' },
    { key: 'meeting', label: 'Meeting Scheduled', color: '#ffe600' },
    { key: 'proposal', label: 'Proposal Sent', color: '#ff8800' },
    { key: 'negotiation', label: 'Negotiation', color: '#ff00c8' },
    { key: 'won', label: 'Won', color: '#00ff64' },
    { key: 'lost', label: 'Lost', color: '#ff3333' }
  ];

  // Lead filtering logic
  const filteredLeadsList = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.message && lead.message.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesBudget = filterBudget === 'all' || lead.budget === filterBudget;
    
    let matchesService = true;
    if (filterService !== 'all') {
      const leadService = lead.serviceInterested || lead.projectDetails || '';
      matchesService = leadService.toLowerCase().includes(filterService.toLowerCase());
    }
    
    return matchesSearch && matchesPriority && matchesBudget && matchesService;
  });

  const activeFollowups = leads.filter(l => l.nextFollowUpDate && l.status !== 'won' && l.status !== 'lost');
  const overdueFollowups = activeFollowups.filter(l => new Date(l.nextFollowUpDate) < new Date());
  const todayFollowups = activeFollowups.filter(l => new Date(l.nextFollowUpDate).toDateString() === new Date().toDateString());
  const newLeadsToday = leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#05020c', color: '#fff' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--glass-border)',
        background: 'rgba(10, 4, 20, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        padding: '30px 20px',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: '900', fontSize: '1.4rem', letterSpacing: '1px' }}>APERIO.</span>
          <span style={{ fontSize: '0.55rem', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.2)', textTransform: 'uppercase' }}>AMS V2</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => setActiveTab('home')} className={`dashboard-sidebar-item ${activeTab === 'home' ? 'active' : ''}`}>
            <Grid size={16} /> Dashboard Home
          </button>
          <button onClick={() => setActiveTab('crm')} className={`dashboard-sidebar-item ${activeTab === 'crm' ? 'active' : ''}`}>
            <Layers size={16} /> CRM Pipeline
          </button>
          <button onClick={() => setActiveTab('leads')} className={`dashboard-sidebar-item ${activeTab === 'leads' ? 'active' : ''}`}>
            <Inbox size={16} /> Leads Database
          </button>
          <button onClick={() => setActiveTab('services')} className={`dashboard-sidebar-item ${activeTab === 'services' ? 'active' : ''}`}>
            <Sliders size={16} /> Services CRUD
          </button>
          <button onClick={() => setActiveTab('portfolio')} className={`dashboard-sidebar-item ${activeTab === 'portfolio' ? 'active' : ''}`}>
            <Briefcase size={16} /> Portfolio CRUD
          </button>
          <button onClick={() => setActiveTab('testimonials')} className={`dashboard-sidebar-item ${activeTab === 'testimonials' ? 'active' : ''}`}>
            <Heart size={16} /> Testimonials CRUD
          </button>
          <button onClick={() => setActiveTab('feedback')} className={`dashboard-sidebar-item ${activeTab === 'feedback' ? 'active' : ''}`}>
            <MessageSquare size={16} /> Client Feedback
          </button>
          <button onClick={() => setActiveTab('logos')} className={`dashboard-sidebar-item ${activeTab === 'logos' ? 'active' : ''}`}>
            <Globe size={16} /> Client Logos
          </button>
          <button onClick={() => setActiveTab('faq')} className={`dashboard-sidebar-item ${activeTab === 'faq' ? 'active' : ''}`}>
            <HelpCircle size={16} /> FAQ CRUD
          </button>
          <button onClick={() => setActiveTab('media')} className={`dashboard-sidebar-item ${activeTab === 'media' ? 'active' : ''}`}>
            <Folder size={16} /> Media Library
          </button>
          <button onClick={() => setActiveTab('logs')} className={`dashboard-sidebar-item ${activeTab === 'logs' ? 'active' : ''}`}>
            <Activity size={16} /> Activity Log
          </button>
          <button onClick={() => setActiveTab('team')} className={`dashboard-sidebar-item ${activeTab === 'team' ? 'active' : ''}`}>
            <Users size={16} /> Team & Roles
          </button>
          <button onClick={() => setActiveTab('settings')} className={`dashboard-sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <Settings size={16} /> CRM Settings
          </button>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '20px' }}>
          <button onClick={handleLogout} className="dashboard-sidebar-item" style={{ color: '#ff4d4d' }}>
            <Lock size={15} /> Lock Control Panel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header Bar */}
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(10, 4, 20, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
          zIndex: 40
        }}>
          
          {/* Global Search Input */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search leads, projects, resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '38px', height: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            
            {/* Notification Bell Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowNotificationCenter(!showNotificationCenter);
                  if (!showNotificationCenter) handleMarkNotificationsRead();
                }}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative' }}
              >
                <Bell size={20} />
                {unreadNotifCount > 0 && <span className="bell-pulse-ring" />}
              </button>

              {/* Notification Center slideout drawer */}
              {showNotificationCenter && (
                <div className="glass-panel" style={{
                  position: 'absolute', right: 0, top: '40px', width: '360px', maxHeight: '420px', overflowY: 'auto',
                  background: 'rgba(10, 4, 20, 0.98)', border: '1px solid var(--glass-border)', zIndex: 90, padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>AMS Notification Tray</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={handleClearNotifications} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer' }}>Clear</button>
                      <button onClick={() => setShowNotificationCenter(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={14} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>No unread alerts captured.</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif._id} style={{
                          padding: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)',
                          fontSize: '0.82rem'
                        }}>
                          <div style={{ fontWeight: '700', marginBottom: '3px', color: notif.type === 'lead' ? 'var(--accent-cyan)' : 'var(--accent-purple)' }}>{notif.title}</div>
                          <p style={{ color: 'var(--text-normal)' }}>{notif.message}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>A</div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-bright)' }}>Owner Portal</span>
            </div>

          </div>
        </header>

        {/* Dynamic Inner Panel Viewport */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          
          {/* TAB 1: EXECUTIVE HOME */}
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* Header block */}
              <div>
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', fontWeight: '800', marginBottom: '8px' }}>Performance Desk</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time business conversion rates and statistics overview.</p>
              </div>

              {/* Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {/* Leads */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.08)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Total CRM Leads</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '3px' }}>{stats.totalLeads}</h3>
                  </div>
                </div>

                {/* New Leads Today */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'rgba(161, 79, 255, 0.08)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusCircle size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>New Leads Today</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '3px' }}>{newLeadsToday}</h3>
                  </div>
                </div>

                {/* Projects completed */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'rgba(0, 255, 100, 0.08)', color: '#00ff64', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Projects Complete</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '3px' }}>{projects.length}</h3>
                  </div>
                </div>

                {/* Active Projects */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'rgba(255, 0, 160, 0.08)', color: 'var(--accent-magenta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Active Projects</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '3px' }}>{leads.filter(l => l.status === 'won').length}</h3>
                  </div>
                </div>

                {/* Pending Follow-ups */}
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: 'rgba(255, 230, 0, 0.08)', color: '#ffe600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Follow-ups Due</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '3px' }}>{activeFollowups.length}</h3>
                  </div>
                </div>
              </div>

              {/* Follow-up Alerts section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                
                {/* SVG Visual Charts */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Leads Volume Trend</h4>
                    <select 
                      value={analyticsTimeframe} 
                      onChange={e => setAnalyticsTimeframe(e.target.value)}
                      className="glass-input" 
                      style={{ width: '120px', height: '32px', background: '#0a0414', fontSize: '0.8rem' }}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {/* SVG Line Chart */}
                  <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                    <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      
                      {/* Line points */}
                      <path 
                        d="M 10 160 Q 100 120 180 140 T 320 80 T 420 100 T 500 30" 
                        fill="none" 
                        stroke="var(--accent-cyan)" 
                        strokeWidth="3.5" 
                        filter="drop-shadow(0 0 6px var(--accent-cyan))"
                      />
                      <path 
                        d="M 10 160 Q 100 120 180 140 T 320 80 T 420 100 T 500 30 L 500 200 L 10 200 Z" 
                        fill="url(#neonGlow)" 
                      />

                      {/* Dots */}
                      <circle cx="180" cy="140" r="4.5" fill="#fff" stroke="var(--accent-cyan)" strokeWidth="2" />
                      <circle cx="320" cy="80" r="4.5" fill="#fff" stroke="var(--accent-cyan)" strokeWidth="2" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '10px' }}>
                    <span>{analyticsTimeframe === 'weekly' ? 'Mon' : analyticsTimeframe === 'yearly' ? 'Q1' : 'Jan'}</span>
                    <span>{analyticsTimeframe === 'weekly' ? 'Wed' : analyticsTimeframe === 'yearly' ? 'Q2' : 'Jun'}</span>
                    <span>{analyticsTimeframe === 'weekly' ? 'Fri' : analyticsTimeframe === 'yearly' ? 'Q3' : 'Sep'}</span>
                    <span>{analyticsTimeframe === 'weekly' ? 'Sun' : analyticsTimeframe === 'yearly' ? 'Q4' : 'Dec'}</span>
                  </div>
                </div>

                {/* Follow-up reminder panel */}
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '5px' }}>CRM Follow-up Desk</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Action items requiring owner review today.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '220px' }}>
                    {todayFollowups.length === 0 && overdueFollowups.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        ✓ All follow-up dates cleared! Excellent responsiveness.
                      </div>
                    ) : (
                      <>
                        {/* Overdue */}
                        {overdueFollowups.map(l => (
                          <div key={`overdue-${l._id}`} onClick={() => setSelectedLead(l)} style={{
                            padding: '12px', border: '1px solid rgba(255, 51, 51, 0.2)', background: 'rgba(255, 51, 51, 0.03)', borderRadius: '6px',
                            cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem', display: 'block', color: '#fff' }}>{l.name}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.company || 'Individual'} • Overdue</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', background: '#ff3333', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>OVERDUE</span>
                          </div>
                        ))}
                        {/* Today */}
                        {todayFollowups.map(l => (
                          <div key={`today-${l._id}`} onClick={() => setSelectedLead(l)} style={{
                            padding: '12px', border: '1px solid rgba(255, 230, 0, 0.2)', background: 'rgba(255, 230, 0, 0.03)', borderRadius: '6px',
                            cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem', display: 'block', color: '#fff' }}>{l.name}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.company || 'Individual'} • Follow-up Today</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', background: '#ffe600', color: '#05020c', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>TODAY</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CRM KANBAN BOARD */}
          {activeTab === 'crm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', height: '100%' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-head)', fontWeight: '800', marginBottom: '8px' }}>CRM Pipeline</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drag and drop leads to transition stages. Changes save automatically.</p>
                </div>
              </div>

              {/* Kanban Columns viewport */}
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px' }}>
                {PIPELINE_COLUMNS.map(col => {
                  const columnLeads = leads.filter(l => l.status === col.key);
                  return (
                    <div 
                      key={col.key}
                      onDragOver={(e) => handleDragOver(e, col.key)}
                      onDrop={(e) => handleDropLead(e, col.key)}
                      className={`crm-pipeline-column ${draggedOverColumn === col.key ? 'drag-over' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: col.color }}>●</span>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{col.label}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px' }}>
                          {columnLeads.length}
                        </span>
                      </div>

                      {/* Lead Cards list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                        {columnLeads.map(lead => (
                          <div 
                            key={lead._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead._id)}
                            onClick={() => setSelectedLead(lead)}
                            className="crm-lead-card"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <strong style={{ fontSize: '0.82rem', color: '#fff' }}>{lead.name}</strong>
                              <span style={{ 
                                fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', fontWeight: '700',
                                background: lead.priority === 'high' ? 'rgba(255,51,51,0.15)' : lead.priority === 'low' ? 'rgba(255,255,255,0.05)' : 'rgba(0,242,254,0.1)',
                                color: lead.priority === 'high' ? '#ff3333' : lead.priority === 'low' ? 'var(--text-muted)' : 'var(--accent-cyan)'
                              }}>
                                {lead.priority || 'medium'}
                              </span>
                            </div>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lead.company || 'Individual'}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#fff', marginTop: '6px', fontWeight: '600' }}>{lead.budget || 'N/A'}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: LEADS TABLE DATABASE */}
          {activeTab === 'leads' && (
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Leads CRM Archive</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Search and filter your corporate leads. Import spreadsheets or export archives.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer', height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} /> Import Leads
                    <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                  </label>
                  <button onClick={() => handleExportData(leads, 'csv', 'leads_archive')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', height: '36px' }}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Advanced Filtering desk */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Priority</label>
                  <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="glass-input" style={{ background: '#0a0414', fontSize: '0.8rem' }}>
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Budget</label>
                  <select value={filterBudget} onChange={e => setFilterBudget(e.target.value)} className="glass-input" style={{ background: '#0a0414', fontSize: '0.8rem' }}>
                    <option value="all">All Budgets</option>
                    <option value="$2,000+">$2,000+</option>
                    <option value="$5,000+">$5,000+</option>
                    <option value="$10,000+">$10,000+</option>
                    <option value="$20,000+">$20,000+</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Service Type</label>
                  <select value={filterService} onChange={e => setFilterService(e.target.value)} className="glass-input" style={{ background: '#0a0414', fontSize: '0.8rem' }}>
                    <option value="all">All Services</option>
                    <option value="Website">Websites</option>
                    <option value="Application">Applications</option>
                    <option value="Video">Video Editing</option>
                    <option value="Automation">AI Automation</option>
                  </select>
                </div>
              </div>

              {/* Table list */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px 15px' }}>Date</th>
                      <th style={{ padding: '12px 15px' }}>Client Info</th>
                      <th style={{ padding: '12px 15px' }}>Budget</th>
                      <th style={{ padding: '12px 15px' }}>Interested In</th>
                      <th style={{ padding: '12px 15px' }}>Priority</th>
                      <th style={{ padding: '12px 15px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeadsList.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No leads matched the filtering parameters.</td>
                      </tr>
                    ) : (
                      filteredLeadsList.map(lead => (
                        <tr key={lead._id} onClick={() => setSelectedLead(lead)} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.88rem', verticalAlign: 'top', cursor: 'pointer', hover: { background: 'rgba(255,255,255,0.02)' } }}>
                          <td style={{ padding: '16px 15px', color: 'var(--text-muted)' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '16px 15px' }}>
                            <div style={{ fontWeight: '700', color: '#fff' }}>{lead.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lead.email} • {lead.phone || 'No Phone'}</div>
                            {lead.company && <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>{lead.company}</div>}
                          </td>
                          <td style={{ padding: '16px 15px', color: '#fff', fontWeight: '600' }}>{lead.budget || 'N/A'}</td>
                          <td style={{ padding: '16px 15px', color: 'var(--text-normal)' }}>{lead.serviceInterested || 'General Development'}</td>
                          <td style={{ padding: '16px 15px' }}>
                            <span style={{ 
                              fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '700',
                              background: lead.priority === 'high' ? 'rgba(255,51,51,0.15)' : lead.priority === 'low' ? 'rgba(255,255,255,0.05)' : 'rgba(0,242,254,0.1)',
                              color: lead.priority === 'high' ? '#ff3333' : lead.priority === 'low' ? 'var(--text-muted)' : 'var(--accent-cyan)',
                              textTransform: 'uppercase'
                            }}>{lead.priority || 'medium'}</span>
                          </td>
                          <td style={{ padding: '16px 15px' }}>
                            <span style={{ 
                              fontSize: '0.75rem', fontWeight: '700', padding: '3px 9px', borderRadius: '4px', textTransform: 'uppercase',
                              background: lead.status === 'won' ? 'rgba(0,255,100,0.1)' : lead.status === 'lost' ? 'rgba(255,51,51,0.1)' : 'rgba(0,242,254,0.1)',
                              color: lead.status === 'won' ? '#00ff64' : lead.status === 'lost' ? '#ff3333' : 'var(--accent-cyan)'
                            }}>{lead.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: SERVICES CRUD */}
          {activeTab === 'services' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
              {/* Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>
                  {editingServiceId ? 'Edit Service Parameter' : 'Create Agency Service'}
                </h3>
                <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Service Title *</label>
                    <input type="text" required value={newService.title} onChange={e => setNewService(s => ({ ...s, title: e.target.value }))} className="glass-input" placeholder="e.g. AI Integrations" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Description *</label>
                    <textarea rows="3" required value={newService.description} onChange={e => setNewService(s => ({ ...s, description: e.target.value }))} className="glass-input" placeholder="Service capabilities summary..." style={{ resize: 'none' }}></textarea>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Features (comma separated)</label>
                    <input type="text" value={newService.features} onChange={e => setNewService(s => ({ ...s, features: e.target.value }))} className="glass-input" placeholder="e.g. Custom LLMs, Webhooks" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Icon Class Name</label>
                      <input type="text" value={newService.icon} onChange={e => setNewService(s => ({ ...s, icon: e.target.value }))} className="glass-input" placeholder="e.g. Layers, Globe, Code" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Order</label>
                      <input type="number" value={newService.order} onChange={e => setNewService(s => ({ ...s, order: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newService.visibility} onChange={e => setNewService(s => ({ ...s, visibility: e.target.checked }))} /> Visibility
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newService.featured} onChange={e => setNewService(s => ({ ...s, featured: e.target.checked }))} /> Featured
                    </label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Save Service</button>
                </form>
              </div>

              {/* Services List */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Active Services</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {services.map(s => (
                    <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{s.title}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Order: {s.order || 0} • {s.visibility ? 'Visible' : 'Hidden'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => { setEditingServiceId(s._id); setNewService({ ...s, features: Array.isArray(s.features) ? s.features.join(', ') : s.features || '' }); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}><Edit size={15} /></button>
                        <button onClick={() => handleDeleteService(s._id)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer' }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: PORTFOLIO CRUD */}
          {activeTab === 'portfolio' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
              
              {/* Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>
                  {editingProjectId ? 'Edit Project Specifications' : 'Add Project Case Study'}
                </h3>
                <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Title *</label>
                      <input type="text" required value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} className="glass-input" style={{ height: '34px', fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Slug *</label>
                      <input type="text" required value={newProject.slug} onChange={e => setNewProject(p => ({ ...p, slug: e.target.value }))} className="glass-input" style={{ height: '34px', fontSize: '0.8rem' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Client *</label>
                      <input type="text" required value={newProject.client} onChange={e => setNewProject(p => ({ ...p, client: e.target.value }))} className="glass-input" style={{ height: '34px', fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Industry</label>
                      <input type="text" value={newProject.industry} onChange={e => setNewProject(p => ({ ...p, industry: e.target.value }))} className="glass-input" style={{ height: '34px', fontSize: '0.8rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Description *</label>
                    <textarea rows="2" required value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} className="glass-input" style={{ fontSize: '0.8rem', resize: 'none' }}></textarea>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Problem</label>
                      <textarea rows="2" value={newProject.problem} onChange={e => setNewProject(p => ({ ...p, problem: e.target.value }))} className="glass-input" style={{ fontSize: '0.8rem', resize: 'none' }}></textarea>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Solution</label>
                      <textarea rows="2" value={newProject.solution} onChange={e => setNewProject(p => ({ ...p, solution: e.target.value }))} className="glass-input" style={{ fontSize: '0.8rem', resize: 'none' }}></textarea>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Tech Stack</label>
                      <input type="text" value={newProject.techStack} onChange={e => setNewProject(p => ({ ...p, techStack: e.target.value }))} className="glass-input" style={{ height: '34px', fontSize: '0.8rem' }} placeholder="React, Node" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Impact Outcome</label>
                      <input type="text" value={newProject.impact} onChange={e => setNewProject(p => ({ ...p, impact: e.target.value }))} className="glass-input" style={{ height: '34px', fontSize: '0.8rem' }} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Save Project Case Study</button>
                </form>
              </div>

              {/* Projects List */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Portfolio Archive</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projects.map(p => (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{p.title}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{p.category} • Client: {p.client}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => handleStartEditProject(p)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}><Edit size={15} /></button>
                        <button onClick={() => handleDeleteProject(p._id)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer' }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: TESTIMONIALS CRUD */}
          {activeTab === 'testimonials' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
              
              {/* Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>
                  {editingTestimonialId ? 'Edit Testimonial card' : 'Create Client Testimonial'}
                </h3>
                <form onSubmit={handleCreateTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Client Name *</label>
                      <input type="text" required value={newTestimonial.name} onChange={e => setNewTestimonial(t => ({ ...t, name: e.target.value }))} className="glass-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Company Name *</label>
                      <input type="text" required value={newTestimonial.company} onChange={e => setNewTestimonial(t => ({ ...t, company: e.target.value }))} className="glass-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Content Quote *</label>
                    <textarea rows="3" required value={newTestimonial.content} onChange={e => setNewTestimonial(t => ({ ...t, content: e.target.value }))} className="glass-input" placeholder="Testimonial review quote..." style={{ resize: 'none' }}></textarea>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Job Role / Title</label>
                      <input type="text" value={newTestimonial.role} onChange={e => setNewTestimonial(t => ({ ...t, role: e.target.value, position: e.target.value }))} className="glass-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Rating (1-5)</label>
                      <input type="number" min="1" max="5" value={newTestimonial.rating} onChange={e => setNewTestimonial(t => ({ ...t, rating: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Save Testimonial</button>
                </form>
              </div>

              {/* Testimonials List */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Active Testimonials</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {testimonials.map(t => (
                    <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{t.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--accent-purple)' }}>{t.role} at {t.company}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => handleStartEditTestimonial(t)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer' }}><Edit size={15} /></button>
                        <button onClick={() => handleDeleteTestimonial(t._id)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer' }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: CLIENT FEEDBACK (REVIEWS WALL) */}
          {activeTab === 'feedback' && (
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Feedback & Verified Reviews Management</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Approve, reject, reply, or delete feedback entries captured from the client home portal.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No client feedback logs recorded.</p>
                ) : (
                  reviews.map(rev => (
                    <div key={rev._id} style={{
                      padding: '20px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '30px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{rev.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.company} • {rev.email}</span>
                          <span style={{
                            fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase',
                            background: rev.status === 'approved' ? 'rgba(0,255,100,0.1)' : rev.status === 'rejected' ? 'rgba(255,51,51,0.1)' : 'rgba(255,230,0,0.1)',
                            color: rev.status === 'approved' ? '#00ff64' : rev.status === 'rejected' ? '#ff3333' : '#ffe600'
                          }}>{rev.status}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-normal)', lineHeight: '1.5' }}>"{rev.feedback}"</p>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>Rating: {rev.rating}★ • Captured: {new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', shrink: 0 }}>
                        {rev.status !== 'approved' && (
                          <button onClick={() => handleUpdateReview(rev._id, { status: 'approved' })} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>Approve</button>
                        )}
                        {rev.status !== 'rejected' && (
                          <button onClick={() => handleUpdateReview(rev._id, { status: 'rejected' })} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.75rem', color: '#ff3333' }}>Reject</button>
                        )}
                        <button onClick={() => handleDeleteReview(rev._id)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer', padding: '5px' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 8: CLIENT LOGOS */}
          {activeTab === 'logos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
              {/* Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Add Partner Brand Logo</h3>
                <form onSubmit={handleCreateLogo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Brand / Partner Name *</label>
                    <input type="text" required value={newLogo.name} onChange={e => setNewLogo(l => ({ ...l, name: e.target.value }))} className="glass-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Logo Image url *</label>
                    <input type="text" required value={newLogo.url} onChange={e => setNewLogo(l => ({ ...l, url: e.target.value }))} className="glass-input" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Hover Cyan/Purple Glow</label>
                      <input type="text" value={newLogo.hoverColor} onChange={e => setNewLogo(l => ({ ...l, hoverColor: e.target.value }))} className="glass-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Display Order</label>
                      <input type="number" value={newLogo.order} onChange={e => setNewLogo(l => ({ ...l, order: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Save Logo</button>
                </form>
              </div>

              {/* Logos list */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Active Partners</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {logos.map(l => (
                    <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🌐</span>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{l.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Glow: {l.hoverColor} • Order: {l.order || 0}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLogo(l._id)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer' }}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 9: FAQ CRUD */}
          {activeTab === 'faq' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
              
              {/* Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Create FAQ accordion Item</h3>
                <form onSubmit={handleCreateFaq} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Question *</label>
                    <input type="text" required value={newFaq.question} onChange={e => setNewFaq(f => ({ ...f, question: e.target.value }))} className="glass-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Answer *</label>
                    <textarea rows="4" required value={newFaq.answer} onChange={e => setNewFaq(f => ({ ...f, answer: e.target.value }))} className="glass-input" style={{ resize: 'none' }}></textarea>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Category</label>
                      <input type="text" value={newFaq.category} onChange={e => setNewFaq(f => ({ ...f, category: e.target.value }))} className="glass-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Order</label>
                      <input type="number" value={newFaq.order} onChange={e => setNewFaq(f => ({ ...f, order: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Save FAQ Item</button>
                </form>
              </div>

              {/* FAQ list */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>FAQ Index</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {faqs.map(f => (
                    <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                      <div style={{ flex: 1, marginRight: '20px' }}>
                        <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{f.question}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>{f.category} • Order: {f.order || 0}</span>
                      </div>
                      <button onClick={() => handleDeleteFaq(f._id)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer', shrink: 0 }}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 10: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              
              {/* Upload panel */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Register Media Asset</h3>
                <form onSubmit={handleCreateMedia} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Asset Name *</label>
                    <input type="text" required value={newMedia.name} onChange={e => setNewMedia(m => ({ ...m, name: e.target.value }))} className="glass-input" placeholder="e.g. Case Study PDF" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>External Asset URL *</label>
                    <input type="text" required value={newMedia.url} onChange={e => setNewMedia(m => ({ ...m, url: e.target.value }))} className="glass-input" placeholder="https://..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Folder Category</label>
                      <input type="text" value={newMedia.folder} onChange={e => setNewMedia(m => ({ ...m, folder: e.target.value }))} className="glass-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Asset Type</label>
                      <select value={newMedia.type} onChange={e => setNewMedia(m => ({ ...m, type: e.target.value }))} className="glass-input" style={{ background: '#0a0414', fontSize: '0.85rem' }}>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF File</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Upload Asset Reference</button>
                </form>
              </div>

              {/* Grid panel */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Folders & File Indexes</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                  {mediaList.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No media assets uploaded. Use form to register files.</p>
                  ) : (
                    mediaList.map(m => (
                      <div key={m._id} style={{
                        padding: '15px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
                        textAlign: 'center', position: 'relative'
                      }}>
                        <button 
                          onClick={() => handleDeleteMedia(m._id)}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                        <Folder size={32} style={{ color: 'var(--accent-purple)', margin: '0 auto 10px auto' }} />
                        <strong style={{ fontSize: '0.82rem', display: 'block', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{m.folder} • {m.type}</span>
                        <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'block', marginTop: '6px' }}>View File →</a>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 11: ACTIVITY LOG */}
          {activeTab === 'logs' && (
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>System Activity Audit Trail</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Automatic logging records for agency edits, lead additions, and crm status changes.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activityLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No activity records logged.</p>
                ) : (
                  activityLogs.map(log => (
                    <div key={log._id} style={{
                      padding: '12px 20px', borderRadius: '6px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem'
                    }}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>●</span>
                        <span style={{ color: '#fff', fontWeight: '600' }}>{log.action}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 12: TEAM MANAGEMENT */}
          {activeTab === 'team' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
              
              {/* Form */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Add Team Member</h3>
                <form onSubmit={handleCreateTeamMember} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Username / Nickname *</label>
                    <input type="text" required value={newTeamMember.username} onChange={e => setNewTeamMember(u => ({ ...u, username: e.target.value }))} className="glass-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Email Address *</label>
                    <input type="email" required value={newTeamMember.email} onChange={e => setNewTeamMember(u => ({ ...u, email: e.target.value }))} className="glass-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Role Permission</label>
                    <select value={newTeamMember.role} onChange={e => setNewTeamMember(u => ({ ...u, role: e.target.value }))} className="glass-input" style={{ background: '#0a0414', fontSize: '0.85rem' }}>
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Content Manager">Content Manager</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Add Member</button>
                </form>
              </div>

              {/* List */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: '700' }}>Team Members Directory</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {teamMembers.length === 0 ? (
                    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>Admin Founder</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Role: Owner</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Root Member</span>
                    </div>
                  ) : (
                    teamMembers.map(m => (
                      <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{m.username}</strong>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Role: {m.role} • {m.email}</span>
                        </div>
                        <button onClick={() => handleDeleteTeamMember(m._id)} style={{ background: 'transparent', border: 'none', color: '#ff3333', cursor: 'pointer' }}><Trash2 size={15} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 13: SETTINGS PANEL */}
          {activeTab === 'settings' && (
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '750px' }}>
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Agency & API Core Settings</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>Modify SMTP triggers, Telegram channel webhooks, and agency profile contacts.</p>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Agency Name</label>
                    <input type="text" value={agencySettings.companyName} onChange={e => setAgencySettings(s => ({ ...s, companyName: e.target.value }))} className="glass-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Notification Recipient Email</label>
                    <input type="email" value={agencySettings.email} onChange={e => setAgencySettings(s => ({ ...s, email: e.target.value }))} className="glass-input" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>WhatsApp Number</label>
                    <input type="text" value={agencySettings.whatsApp} onChange={e => setAgencySettings(s => ({ ...s, whatsApp: e.target.value }))} className="glass-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Office Address</label>
                    <input type="text" value={agencySettings.address} onChange={e => setAgencySettings(s => ({ ...s, address: e.target.value }))} className="glass-input" />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>Save Agency Configuration</button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* LEAD PROFILE SLIDING DETAILED DRAWER */}
      {selectedLead && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedLead(null)} />
          <div className="drawer-container">
            <div style={{ padding: '35px', position: 'relative' }}>
              
              <button 
                onClick={() => setSelectedLead(null)}
                style={{ position: 'absolute', top: '25px', right: '25px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>

              <div style={{ marginBottom: '30px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Lead Profile</span>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-head)', fontWeight: '800', marginTop: '5px', color: '#fff' }}>{selectedLead.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedLead.email} • {selectedLead.phone || 'No Phone'}</span>
              </div>

              {/* Status and Priority selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Priority Level</label>
                  <select 
                    value={selectedLead.priority || 'medium'} 
                    onChange={e => {
                      const timelineEntry = {
                        action: `Priority updated to '${e.target.value}'`,
                        date: new Date().toISOString(),
                        user: 'Admin'
                      };
                      handleUpdateLeadCrm(selectedLead._id, { 
                        priority: e.target.value,
                        timeline: [...(selectedLead.timeline || []), timelineEntry]
                      });
                    }}
                    className="glass-input" 
                    style={{ background: '#0a0414', fontSize: '0.8rem' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Pipeline Stage</label>
                  <select 
                    value={selectedLead.status} 
                    onChange={e => {
                      const timelineEntry = {
                        action: `Stage transitioned to '${e.target.value}'`,
                        date: new Date().toISOString(),
                        user: 'Admin'
                      };
                      handleUpdateLeadCrm(selectedLead._id, { 
                        status: e.target.value,
                        timeline: [...(selectedLead.timeline || []), timelineEntry]
                      });
                    }}
                    className="glass-input" 
                    style={{ background: '#0a0414', fontSize: '0.8rem' }}
                  >
                    {PIPELINE_COLUMNS.map(col => (
                      <option key={col.key} value={col.key}>{col.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lead Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Corporate/Company</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>{selectedLead.company || 'Individual Client'}</span>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Scope Budget</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>{selectedLead.budget || 'N/A'}</span>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Scoping specifications</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-normal)', whiteSpace: 'pre-wrap', marginTop: '4px' }}>{selectedLead.projectDetails}</p>
                </div>
              </div>

              {/* Next follow up scheduler */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Schedule Next Follow-Up</label>
                <input 
                  type="date" 
                  value={selectedLead.nextFollowUpDate ? new Date(selectedLead.nextFollowUpDate).toISOString().substring(0, 10) : ''}
                  onChange={e => {
                    const timelineEntry = {
                      action: `Next follow-up scheduled for: ${e.target.value}`,
                      date: new Date().toISOString(),
                      user: 'Admin'
                    };
                    handleUpdateLeadCrm(selectedLead._id, { 
                      nextFollowUpDate: e.target.value,
                      timeline: [...(selectedLead.timeline || []), timelineEntry]
                    });
                  }}
                  className="glass-input"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Conversation log & Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Client Interaction Notes</h4>
                
                {/* Notes thread */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                  {(selectedLead.conversations || []).map((note, idx) => (
                    <div key={idx} style={{ padding: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '3px' }}>
                        <strong>{note.sender}</strong>
                        <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p style={{ color: 'var(--text-normal)' }}>{note.text}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter interaction note..." 
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="glass-input"
                    style={{ fontSize: '0.82rem', height: '36px' }}
                  />
                  <button onClick={handleAddNote} className="btn-primary" style={{ height: '36px', padding: '0 15px', fontSize: '0.8rem' }}>Add</button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
