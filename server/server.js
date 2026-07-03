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
  getAnalyticsStats 
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*', // Allow all origins for local development testing
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
// ----------------------------------------------------

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
    botReply = "Hi! I am Aperio's Digital Architect. I help businesses design, structure, and scale their premium web presences. What is the name of your business or project?";
    currentStep = 'ask_business';
  } else if (currentStep === 'ask_business') {
    data.businessName = messages[messages.length - 1].content;
    botReply = `Got it! "${data.businessName}" sounds exciting. Tell me a bit about what this project is. Are we building a brand-new website, launching a product, or revamping an old one? What features do you need?`;
    currentStep = 'ask_details';
  } else if (currentStep === 'ask_details') {
    data.projectDetails = messages[messages.length - 1].content;
    botReply = "Understood. A cinematic web presence would work wonders for this. What kind of budget do you have allocated for this launch? (e.g., $2k-$5k, $5k-$10k, or $10k+)";
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
      botReply = "Our solutions are custom-built to match your brand requirements. Typically, simple premium websites start at $2,000, and complex web applications/e-commerce hubs start around $5,000. Let's discuss a package tailored for you!";
    } else if (lastUserMessage.includes('work') || lastUserMessage.includes('portfolio') || lastUserMessage.includes('projects')) {
      botReply = "We recently built a premium startup launch site for 'Grow Elite' and a live tournament e-sports platform. Check out the Portfolio section on our landing page to see them in action!";
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
// SERVER STARTUP
// ----------------------------------------------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
