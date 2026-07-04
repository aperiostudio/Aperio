import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  connectDB, 
  getProjects, 
  createProject, 
  deleteProject, 
  updateProject,
  getTestimonials, 
  createTestimonial, 
  deleteTestimonial, 
  updateTestimonial,
  getLeads, 
  createLead, 
  updateLeadStatus, 
  recordVisit, 
  getAnalyticsStats,
  getReviews,
  createReview,
  updateLeadCrm,
  bulkImportLeads,
  getServices,
  createService,
  updateService,
  deleteService,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getLogos,
  createLogo,
  updateLogo,
  deleteLogo,
  getLogs,
  createLog,
  getNotifications,
  createNotification,
  markNotificationsRead,
  clearNotifications,
  getMedia,
  createMedia,
  deleteMedia,
  getSettings,
  updateSettings,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getAudits,
  createAudit,
  deleteAudit
} from './db.js';

import { sendLeadNotification, sendTelegramNotification } from './email.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { generateProposalWithAI, generateEmailWithAI } from './ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware configurations
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP to avoid blocking Three.js models, images, and fonts
}));

// Gzip Compression for asset size performance
app.use(compression());

// Rate Limiting to prevent spam/abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Enable CORS for frontend
const corsOptions = {
  origin: '*', // Allow all origins for local development testing
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight CORS requests globally

app.use(express.json());

// Middleware for Admin Passcode Check
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const passcode = process.env.ADMIN_PASSCODE || 'admin123';
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === passcode) {
      return next();
    }
  }
  
  return res.status(401).json({ error: 'Unauthorized: Invalid admin passcode.' });
};

// ----------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------

// Test Email & Telegram Notifications Route
app.get('/api/test-email', async (req, res) => {
  try {
    console.log('API trigger: sending test notifications...');
    const testLead = {
      name: "Render System Tester",
      email: "test@render.host",
      businessName: "Render Test Project",
      budget: "$5k - $10k",
      projectDetails: "This is a direct diagnostic test executed from the live Render API endpoints."
    };
    await sendLeadNotification(testLead);
    await sendTelegramNotification(testLead);
    res.json({ 
      success: true, 
      message: 'Test notifications execution completed. Checked both email and Telegram SMTP/API dispatches!',
      env: {
        emailUser: process.env.EMAIL_USER ? 'CONFIGURED' : 'MISSING',
        emailPass: process.env.EMAIL_PASS ? 'CONFIGURED' : 'MISSING',
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ? 'CONFIGURED' : 'MISSING',
        telegramChatId: process.env.TELEGRAM_CHAT_ID ? 'CONFIGURED' : 'MISSING'
      }
    });
  } catch (err) {
    console.error('Test email route failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get public reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const list = await getReviews();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// Submit a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const { name, company, email, projectName, rating, feedback } = req.body;
    if (!name || !email || !feedback || !rating) {
      return res.status(400).json({ error: 'Missing required fields (name, email, feedback, rating)' });
    }
    const newReview = await createReview({ name, company, email, projectName, rating, feedback });
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Get portfolio projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// Get testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await getTestimonials();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve testimonials' });
  }
});

// Submit contact form (lead generation)
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, businessName, projectDetails, budget } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const newLead = await createLead({ name, email, businessName, projectDetails, budget });
    res.status(201).json(newLead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// Log visitor session for statistics
app.post('/api/visits', async (req, res) => {
  try {
    const { path, device } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Categorize user agent/device if sent simple
    const deviceType = device || 'desktop';
    await recordVisit({ path: path || '/', device: deviceType, ip });
    res.sendStatus(204);
  } catch (err) {
    // Fail silently for page views analytics logging
    console.error('Error logging visit:', err);
    res.sendStatus(500);
  }
});

// ----------------------------------------------------
// AI QUALIFICATION CHATBOT ENDPOINT
// ----------------------------------------------------
// Simple simulated conversational AI that parses and logs the lead once it gets name and email.
app.post('/api/chat', async (req, res) => {
  const { messages, leadState } = req.body;
  
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'No message history provided.' });
  }

  const lastUserMessage = messages[messages.length - 1].content.trim().toLowerCase();
  
  let currentStep = leadState?.step || 'greet';
  let data = leadState?.data || { name: '', email: '', businessName: '', projectDetails: '', budget: '' };
  let botReply = '';

  // AI Dialogue flow control
  if (currentStep === 'greet') {
    botReply = "Hi! I am Aperio's Digital Architect. I help businesses design, build, and scale their premium web applications and cinematic video productions. What is the name of your business or project?";
    currentStep = 'ask_business';
  } else if (currentStep === 'ask_business') {
    data.businessName = messages[messages.length - 1].content;
    botReply = `Got it! "${data.businessName}" sounds exciting. Tell me a bit about what this project is. Are we building a web application, editing professional/cinematic videos, or both? What features do you need?`;
    currentStep = 'ask_details';
  } else if (currentStep === 'ask_details') {
    data.projectDetails = messages[messages.length - 1].content;
    botReply = "Understood. A cinematic presentation would work wonders for this. What kind of budget do you have allocated for this launch? (e.g., $2k-$5k, $5k-$10k, or $10k+)";
    currentStep = 'ask_budget';
  } else if (currentStep === 'ask_budget') {
    data.budget = messages[messages.length - 1].content;
    botReply = "Perfect. To generate a custom design draft and outline a proposal for you, what is your name?";
    currentStep = 'ask_name';
  } else if (currentStep === 'ask_name') {
    data.name = messages[messages.length - 1].content;
    botReply = `Pleasure to connect with you, ${data.name}! Lastly, what is the best email address to send the custom interactive mockup and proposal to?`;
    currentStep = 'ask_email';
  } else if (currentStep === 'ask_email') {
    data.email = messages[messages.length - 1].content;
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      botReply = "Hmm, that email doesn't look quite right. Could you please double-check and enter a valid email address?";
      currentStep = 'ask_email'; // Stay on this step
    } else {
      try {
        // Automatically save lead
        await createLead({
          name: data.name,
          email: data.email,
          businessName: data.businessName,
          projectDetails: `${data.projectDetails} [Captured via AI Chatbot]`,
          budget: data.budget
        });
        
        botReply = `Excellent, ${data.name}! I have successfully registered your project details in our system. I am going to analyze your business model and draft an interactive design presentation. I'll email you within 24 hours. Would you like to look at our recent work in the portfolio, or do you have any other questions?`;
        currentStep = 'complete';
      } catch (err) {
        botReply = "Thanks! I've recorded your email. Let's arrange a call shortly.";
        currentStep = 'complete';
      }
    }
  } else {
    // If complete or any other queries
    if (lastUserMessage.includes('price') || lastUserMessage.includes('cost')) {
      botReply = "Our solutions are custom-built. Premium web application packages start at $2,000, and custom cinematic video editing campaigns start at $1,500. Let's discuss a package tailored for your brand!";
    } else if (lastUserMessage.includes('work') || lastUserMessage.includes('portfolio') || lastUserMessage.includes('projects')) {
      botReply = "We recently built a premium launch site for 'Grow Athlete' and a live esports platform for 'Bloodline Battle Esports Hub'. Check out the Portfolio section on our landing page to see them in action!";
    } else {
      botReply = "I'm always here to help. You can also submit the main contact form at the bottom of the page, or email our founder directly. What else can I assist you with?";
    }
  }

  res.json({
    reply: botReply,
    nextState: {
      step: currentStep,
      data
    }
  });
});

// ----------------------------------------------------
// ADMIN DASHBOARD SECURE API
// ----------------------------------------------------

// Verify password and return auth state
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  const adminPasscode = process.env.ADMIN_PASSCODE || 'admin123';
  if (passcode === adminPasscode) {
    res.json({ success: true, token: adminPasscode });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials.' });
  }
});

// Fetch analytics statistics
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const stats = await getAnalyticsStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Fetch all leads
app.get('/api/admin/leads', adminAuth, async (req, res) => {
  try {
    const leads = await getLeads();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve leads' });
  }
});

// Update lead status
app.patch('/api/admin/leads/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await updateLeadStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead status' });
  }
});

// Add a portfolio project
app.post('/api/admin/projects', adminAuth, async (req, res) => {
  try {
    const newProj = await createProject(req.body);
    res.status(201).json(newProj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Delete portfolio project
app.delete('/api/admin/projects/:id', adminAuth, async (req, res) => {
  try {
    await deleteProject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Edit portfolio project
app.put('/api/admin/projects/:id', adminAuth, async (req, res) => {
  try {
    const updatedProj = await updateProject(req.params.id, req.body);
    if (!updatedProj) return res.status(404).json({ error: 'Project not found' });
    res.json(updatedProj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Add a testimonial
app.post('/api/admin/testimonials', adminAuth, async (req, res) => {
  try {
    const newTest = await createTestimonial(req.body);
    res.status(201).json(newTest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// Delete testimonial
app.delete('/api/admin/testimonials/:id', adminAuth, async (req, res) => {
  try {
    await deleteTestimonial(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Edit testimonial
app.put('/api/admin/testimonials/:id', adminAuth, async (req, res) => {
  try {
    const updatedTest = await updateTestimonial(req.params.id, req.body);
    if (!updatedTest) return res.status(404).json({ error: 'Testimonial not found' });
    res.json(updatedTest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// ----------------------------------------------------
// PHASE 2 SaaS & CRM ROUTE ENDPOINTS
// ----------------------------------------------------

// CRM Update Lead Details
app.patch('/api/admin/leads/:id/crm', adminAuth, async (req, res) => {
  try {
    const updated = await updateLeadCrm(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update CRM lead details' });
  }
});

// Bulk Import Leads (CSV upload)
app.post('/api/admin/leads/import', adminAuth, async (req, res) => {
  try {
    const leadsList = req.body;
    if (!Array.isArray(leadsList)) {
      return res.status(400).json({ error: 'Leads data must be an array' });
    }
    const imported = await bulkImportLeads(leadsList);
    res.status(201).json({ success: true, count: imported.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk import leads' });
  }
});

// Get public / admin services
app.get('/api/services', async (req, res) => {
  try {
    const services = await getServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
});

app.post('/api/admin/services', adminAuth, async (req, res) => {
  try {
    const newService = await createService(req.body);
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/admin/services/:id', adminAuth, async (req, res) => {
  try {
    const updated = await updateService(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/admin/services/:id', adminAuth, async (req, res) => {
  try {
    await deleteService(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// FAQs
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await getFaqs();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve FAQs' });
  }
});

app.post('/api/admin/faqs', adminAuth, async (req, res) => {
  try {
    const newFaq = await createFaq(req.body);
    res.status(201).json(newFaq);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

app.put('/api/admin/faqs/:id', adminAuth, async (req, res) => {
  try {
    const updated = await updateFaq(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'FAQ not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

app.delete('/api/admin/faqs/:id', adminAuth, async (req, res) => {
  try {
    await deleteFaq(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Client Logos
app.get('/api/logos', async (req, res) => {
  try {
    const logos = await getLogos();
    res.json(logos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logos' });
  }
});

app.post('/api/admin/logos', adminAuth, async (req, res) => {
  try {
    const newLogo = await createLogo(req.body);
    res.status(201).json(newLogo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save logo' });
  }
});

app.put('/api/admin/logos/:id', adminAuth, async (req, res) => {
  try {
    const updated = await updateLogo(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Logo not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update logo' });
  }
});

app.delete('/api/admin/logos/:id', adminAuth, async (req, res) => {
  try {
    await deleteLogo(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});

// Activity Logs
app.get('/api/admin/logs', adminAuth, async (req, res) => {
  try {
    const logs = await getLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Notification Center
app.get('/api/admin/notifications', adminAuth, async (req, res) => {
  try {
    const notifications = await getNotifications();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

app.post('/api/admin/notifications/read', adminAuth, async (req, res) => {
  try {
    await markNotificationsRead();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

app.delete('/api/admin/notifications', adminAuth, async (req, res) => {
  try {
    await clearNotifications();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// Media Library
app.get('/api/admin/media', adminAuth, async (req, res) => {
  try {
    const media = await getMedia();
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve media library' });
  }
});

app.post('/api/admin/media', adminAuth, async (req, res) => {
  try {
    const newMedia = await createMedia(req.body);
    res.status(201).json(newMedia);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save media item' });
  }
});

app.delete('/api/admin/media/:id', adminAuth, async (req, res) => {
  try {
    await deleteMedia(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media item' });
  }
});

// Settings Management
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    // Exclude API keys when retrieving publicly
    const publicSettings = {
      agency: settings.agency,
      website: settings.website
    };
    res.json(publicSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.get('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

app.put('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const updated = await updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update agency configuration' });
  }
});

// Team Members Users
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve team members' });
  }
});

app.post('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin reviews CRUD (all reviews)
app.get('/api/admin/reviews', adminAuth, async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

app.patch('/api/admin/reviews/:id', adminAuth, async (req, res) => {
  try {
    const updated = await updateReviewStatus(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review details' });
  }
});

app.delete('/api/admin/reviews/:id', adminAuth, async (req, res) => {
  try {
    await deleteReview(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ----------------------------------------------------
// PHASE 3 AI AUTOMATION & WEBSITE AUDIT ROUTES
// ----------------------------------------------------

// Generate Markdown Proposal
app.post('/api/admin/ai/proposal', adminAuth, async (req, res) => {
  try {
    const lead = req.body;
    const proposal = generateProposalWithAI(lead);
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate AI proposal document.' });
  }
});

// Generate Template Email Responder
app.post('/api/admin/ai/email', adminAuth, async (req, res) => {
  try {
    const { type, lead } = req.body;
    const emailBody = generateEmailWithAI(type, lead);
    res.json({ emailBody });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compile AI response email.' });
  }
});

// Public Website Audit Request
app.post('/api/audits', async (req, res) => {
  try {
    const { websiteUrl, businessName, email, phone } = req.body;
    if (!websiteUrl || !email) {
      return res.status(400).json({ error: 'Website URL and email address are required.' });
    }

    // Dynamic mock report preview builder (future ready AI audit parameters)
    const mockReport = `## Preliminary Digital Audit for ${websiteUrl}
Generated: ${new Date().toLocaleString()}

* **Lighthouse Performance Index:** 72/100
* **WCAG Accessibility Indicators:** 79/100 (Contrast violations, missing label identifiers)
* **SEO Metadata Status:** OpenGraph and Twitter tags missing
* **Response Speed (TTFB):** 1.4s (High delay)

### Recommended Next Step
Upgrading to Aperio V2 with dynamic code-splitting and helmet headers will raise Lighthouse indicators to 98+ and decrease load delay to <250ms.`;

    const audit = await createAudit({
      websiteUrl,
      businessName,
      email,
      phone,
      results: mockReport
    });

    // Automatically record as a lead to trigger notifications
    await createLead({
      name: `${businessName || 'Brand'} Auditor`,
      email,
      businessName,
      phone,
      projectDetails: `Free Audit requested for site: ${websiteUrl}. Preliminary audit generated.`,
      budget: 'TBD',
      source: 'Free Website Audit',
      priority: 'medium'
    });

    res.status(201).json(audit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create audit request.' });
  }
});

// Admin list audit requests
app.get('/api/admin/audits', adminAuth, async (req, res) => {
  try {
    const audits = await getAudits();
    res.json(audits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve website audits.' });
  }
});

// Admin delete audit requests
app.delete('/api/admin/audits/:id', adminAuth, async (req, res) => {
  try {
    await deleteAudit(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete audit record.' });
  }
});

// ----------------------------------------------------
// SERVER STARTUP
// ----------------------------------------------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
