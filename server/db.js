import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendLeadNotification, sendTelegramNotification } from './email.js';
import { analyzeLead } from './ai.js';

dotenv.config();

const __dirname = path.dirname(new URL(import.meta.url).pathname);
// Fix path for Windows environments
const dbFilePath = path.join(process.platform === 'win32' ? new URL(import.meta.url).pathname.substring(1) : new URL(import.meta.url).pathname, '../db.json');

// Connection mode
let isMongo = false;

// Connect to MongoDB if MONGO_URI is present, otherwise fallback to local JSON
export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      isMongo = true;
      console.log('MongoDB connected successfully!');
      await seedDefaults();
      return;
    } catch (err) {
      console.warn('MongoDB connection failed, falling back to local JSON database.', err.message);
    }
  }
  
  console.log('Using local JSON Database (db.json) for storage.');
  isMongo = false;
  initializeJsonDb();
  seedDefaults();
}

// ----------------------------------------------------
// LOCAL JSON DB SETUP & HELPERS
// ----------------------------------------------------
function initializeJsonDb() {
  if (!fs.existsSync(dbFilePath)) {
    const initialData = {
      leads: [],
      projects: [],
      testimonials: [],
      reviews: [],
      analytics: {
        visits: [],
        leadConversions: 0
      }
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
  } else {
    try {
      const data = fs.readFileSync(dbFilePath, 'utf-8');
      const db = JSON.parse(data);
      if (!db.reviews) {
        db.reviews = [];
        fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Error initializing reviews array in db.json:', e);
    }
  }
}

function readJsonDb() {
  initializeJsonDb();
  try {
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB, resetting:', err);
    return { leads: [], projects: [], testimonials: [], analytics: { visits: [], leadConversions: 0 } };
  }
}

function writeJsonDb(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to JSON DB:', err);
  }
}

// Generate unique ID for JSON fallback
const generateId = () => Math.random().toString(36).substring(2, 11);

// ----------------------------------------------------
// MONGOOSE SCHEMAS (If MongoDB is active)
// ----------------------------------------------------
const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  client: String,
  impact: String,
  tags: [String],
  link: String,
  image: String,
  slug: String,
  industry: String,
  techStack: [String],
  duration: String,
  completionDate: { type: Date, default: Date.now },
  problem: String,
  solution: String,
  results: String,
  gallery: [String],
  thumbnail: String,
  liveUrl: String,
  gitHubUrl: String,
  featuredProject: { type: Boolean, default: false },
  seoTitle: String,
  seoDescription: String,
  publishStatus: { type: String, default: 'published' },
  order: { type: Number, default: 0 }
});
const MongoProject = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const TestimonialSchema = new mongoose.Schema({
  name: String,
  role: String,
  company: String,
  content: String,
  rating: Number,
  avatar: String,
  position: String,
  image: String,
  country: { type: String, default: 'US' },
  project: String,
  date: { type: Date, default: Date.now },
  visibility: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});
const MongoTestimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);

const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  businessName: String,
  projectDetails: String,
  budget: String,
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now },
  company: String,
  phone: String,
  country: { type: String, default: 'US' },
  website: String,
  serviceInterested: String,
  projectTimeline: String,
  source: { type: String, default: 'Website Form' },
  message: String,
  priority: { type: String, default: 'medium' },
  assignedTo: { type: String, default: 'Admin' },
  lastContactDate: { type: Date, default: Date.now },
  nextFollowUpDate: Date,
  notes: { type: String, default: '' },
  conversations: { type: Array, default: [] },
  timeline: { type: Array, default: [] },
  proposalStatus: { type: String, default: 'None' },
  paymentStatus: { type: String, default: 'Unpaid' },
  aiLeadScore: { type: Number, default: 0 },
  aiUrgency: { type: String, default: 'medium' },
  aiComplexityScore: { type: Number, default: 0 },
  aiEstimatedTimeline: { type: String, default: '' },
  aiRecommendedAction: { type: String, default: '' },
  aiPotentialUpsells: { type: Array, default: [] },
  aiSuggestedResponse: { type: String, default: '' }
});
const MongoLead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

const VisitSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  path: String,
  device: String,
  ip: String
});
const MongoVisit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

const ReviewSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: String,
  projectName: String,
  rating: Number,
  feedback: String,
  status: { type: String, default: 'approved' },
  createdAt: { type: Date, default: Date.now }
});
const MongoReview = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  features: [String],
  order: { type: Number, default: 0 },
  visibility: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
});
const MongoService = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

const FAQSchema = new mongoose.Schema({
  question: String,
  answer: String,
  category: { type: String, default: 'General' },
  order: { type: Number, default: 0 },
  visibility: { type: Boolean, default: true }
});
const MongoFAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);

const LogoSchema = new mongoose.Schema({
  name: String,
  url: String,
  visibility: { type: Boolean, default: true },
  hoverColor: { type: String, default: '#00f2fe' },
  altText: String,
  order: { type: Number, default: 0 }
});
const MongoLogo = mongoose.models.Logo || mongoose.model('Logo', LogoSchema);

const LogSchema = new mongoose.Schema({
  admin: { type: String, default: 'Admin' },
  action: String,
  timestamp: { type: Date, default: Date.now }
});
const MongoLog = mongoose.models.Log || mongoose.model('Log', LogSchema);

const NotificationSchema = new mongoose.Schema({
  type: { type: String, default: 'system' },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const MongoNotification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'config' },
  agency: {
    companyName: { type: String, default: 'Aperio Studio' },
    email: { type: String, default: 'aperiostudio92@gmail.com' },
    phone: { type: String, default: '+1 (555) 000-0000' },
    whatsApp: { type: String, default: '1234567890' },
    address: { type: String, default: 'San Francisco, CA' },
    googleMaps: String,
    socialLinks: { type: Map, of: String },
    businessHours: { type: String, default: '9 AM - 6 PM EST' },
    logo: String,
    favicon: String
  },
  website: {
    heroText: { type: String, default: 'Reveal Hidden Potential' },
    stats: { type: Map, of: String },
    contactEmail: { type: String, default: 'aperiostudio92@gmail.com' },
    seo: {
      title: { type: String, default: 'Aperio Studio - Premium Digital Agency' },
      description: { type: String, default: 'We craft cyber-aesthetic platforms that convert.' }
    }
  },
  api: {
    telegramBotToken: String,
    telegramChatId: String,
    googleAnalyticsId: String,
    smtpUser: String,
    smtpPass: String
  }
});
const MongoSettings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

const MediaSchema = new mongoose.Schema({
  name: String,
  url: String,
  folder: { type: String, default: 'General' },
  type: { type: String, default: 'image' },
  size: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
});
const MongoMedia = mongoose.models.Media || mongoose.model('Media', MediaSchema);

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: { type: String, default: 'Admin' },
  profileImage: String,
  createdAt: { type: Date, default: Date.now }
});
const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);

const AuditSchema = new mongoose.Schema({
  websiteUrl: String,
  businessName: String,
  email: String,
  phone: String,
  status: { type: String, default: 'pending' }, // 'pending' | 'completed'
  results: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const MongoAudit = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);

// ----------------------------------------------------
// SEEDING DEFAULTS
// ----------------------------------------------------
async function seedDefaults() {
  const defaultProjects = [
    {
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

  const defaultTestimonials = [
    {
      name: "Marcus Vance",
      role: "CEO & Founder",
      company: "Grow Athlete",
      content: "Aperio Digital transformed our online presence completely. The user experience they designed for our platform was cinematic and converted leads better than any platform we've used in the past five years. Extremely professional team.",
      rating: 5,
      avatar: "MV"
    },
    {
      name: "Sarah 'Valkyrie' Chen",
      role: "Tournament Director",
      company: "Bloodline Battle Esports Hub",
      content: "Our tournament registrants were amazed by the fluid bracket updates and the dark-cyber dashboard. Working with them was an absolute pleasure; they understood the aesthetics of our gaming community perfectly.",
      rating: 5,
      avatar: "SC"
    }
  ];

  const defaultReviews = [
    {
      name: "Hemant Kumar",
      company: "Grow Athlete",
      email: "hemant@growathlete.com",
      projectName: "Grow Athlete Scale-up Funnel",
      rating: 5,
      feedback: "Aperio Studio built a world-class landing system for our startup accelerator. Our lead generation conversion rate increased by 180% within the first month. Their attention to animations and performance is lease to say, brilliant.",
      status: "approved"
    },
    {
      name: "Lucky Singh",
      company: "Bloodline Esports",
      email: "lucky@bloodline.gg",
      projectName: "Esports Tournament Hub",
      rating: 5,
      feedback: "The tournament portal is extremely fast, highly interactive, and handled thousands of concurrent registrations without a single hiccup. Our players loved the dark mode aesthetic and the tournament bracket layouts.",
      status: "approved"
    }
  ];

  if (isMongo) {
    const projectCount = await MongoProject.countDocuments();
    if (projectCount === 0) {
      await MongoProject.insertMany(defaultProjects);
      console.log('Seeded default projects into MongoDB.');
    }
    const testimonialCount = await MongoTestimonial.countDocuments();
    if (testimonialCount === 0) {
      await MongoTestimonial.insertMany(defaultTestimonials);
      console.log('Seeded default testimonials into MongoDB.');
    }
    const reviewCount = await MongoReview.countDocuments();
    if (reviewCount === 0) {
      await MongoReview.insertMany(defaultReviews);
      console.log('Seeded default reviews into MongoDB.');
    }
  } else {
    const db = readJsonDb();
    let updated = false;
    if (!db.projects || db.projects.length === 0) {
      db.projects = defaultProjects.map(p => ({ _id: generateId(), ...p }));
      updated = true;
    }
    if (!db.testimonials || db.testimonials.length === 0) {
      db.testimonials = defaultTestimonials.map(t => ({ _id: generateId(), ...t }));
      updated = true;
    }
    if (!db.reviews || db.reviews.length === 0) {
      db.reviews = defaultReviews.map(r => ({ _id: generateId(), ...r, createdAt: new Date().toISOString() }));
      updated = true;
    }
    if (updated) {
      writeJsonDb(db);
      console.log('Seeded default projects/testimonials/reviews into local JSON.');
    }
  }
}

// ----------------------------------------------------
// DATABASE API EXPORTS
// ----------------------------------------------------

// Projects
export async function getProjects() {
  if (isMongo) {
    return await MongoProject.find();
  } else {
    const db = readJsonDb();
    return db.projects || [];
  }
}

export async function createProject(data) {
  if (isMongo) {
    const newProj = new MongoProject(data);
    return await newProj.save();
  } else {
    const db = readJsonDb();
    const newProj = { _id: generateId(), ...data };
    db.projects.push(newProj);
    writeJsonDb(db);
    return newProj;
  }
}

export async function deleteProject(id) {
  if (isMongo) {
    return await MongoProject.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    db.projects = db.projects.filter(p => p._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

export async function updateProject(id, data) {
  if (isMongo) {
    return await MongoProject.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readJsonDb();
    const index = db.projects.findIndex(p => p._id === id);
    if (index !== -1) {
      db.projects[index] = { ...db.projects[index], ...data };
      writeJsonDb(db);
      return db.projects[index];
    }
    return null;
  }
}

// Testimonials
export async function getTestimonials() {
  if (isMongo) {
    return await MongoTestimonial.find();
  } else {
    const db = readJsonDb();
    return db.testimonials || [];
  }
}

export async function createTestimonial(data) {
  if (isMongo) {
    const newTest = new MongoTestimonial(data);
    return await newTest.save();
  } else {
    const db = readJsonDb();
    const newTest = { _id: generateId(), ...data };
    db.testimonials.push(newTest);
    writeJsonDb(db);
    return newTest;
  }
}

export async function deleteTestimonial(id) {
  if (isMongo) {
    return await MongoTestimonial.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    db.testimonials = db.testimonials.filter(t => t._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

export async function updateTestimonial(id, data) {
  if (isMongo) {
    return await MongoTestimonial.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readJsonDb();
    const index = db.testimonials.findIndex(t => t._id === id);
    if (index !== -1) {
      db.testimonials[index] = { ...db.testimonials[index], ...data };
      writeJsonDb(db);
      return db.testimonials[index];
    }
    return null;
  }
}

// Leads
export async function getLeads() {
  if (isMongo) {
    return await MongoLead.find().sort({ createdAt: -1 });
  } else {
    const db = readJsonDb();
    const list = db.leads || [];
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function createLead(data) {
  let newLead;
  const aiStats = analyzeLead(data);
  const leadPayload = {
    name: data.name,
    email: data.email,
    businessName: data.businessName || data.company || '',
    projectDetails: data.projectDetails || data.message || '',
    budget: data.budget || '',
    status: data.status || 'new',
    company: data.company || data.businessName || '',
    phone: data.phone || '',
    country: data.country || 'US',
    website: data.website || '',
    serviceInterested: data.serviceInterested || 'Premium Websites',
    projectTimeline: data.projectTimeline || '1-3 Weeks',
    source: data.source || 'Website Form',
    message: data.message || data.projectDetails || '',
    priority: data.priority || 'medium',
    assignedTo: data.assignedTo || 'Admin',
    lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : new Date(),
    nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
    notes: data.notes || '',
    conversations: data.conversations || [],
    timeline: data.timeline || [{ action: 'Lead Created', date: new Date().toISOString(), user: 'System' }],
    proposalStatus: data.proposalStatus || 'None',
    paymentStatus: data.paymentStatus || 'Unpaid',
    aiLeadScore: aiStats.leadScore,
    aiUrgency: aiStats.urgency,
    aiComplexityScore: aiStats.complexityScore,
    aiEstimatedTimeline: aiStats.estimatedTimeline,
    aiRecommendedAction: aiStats.recommendedAction,
    aiPotentialUpsells: aiStats.potentialUpsells,
    aiSuggestedResponse: aiStats.suggestedResponse
  };

  if (isMongo) {
    const mongoLead = new MongoLead(leadPayload);
    newLead = await mongoLead.save();
  } else {
    const db = readJsonDb();
    newLead = { 
      _id: generateId(), 
      ...leadPayload,
      createdAt: new Date().toISOString()
    };
    db.leads.push(newLead);
    writeJsonDb(db);
  }
  
  sendLeadNotification(newLead).catch(err => console.error('Error dispatching lead email:', err));
  sendTelegramNotification(newLead).catch(err => console.error('Error dispatching lead Telegram:', err));
  
  createLog({ admin: 'System', action: `Lead Created: ${newLead.name} (${newLead.company || 'Individual'})` }).catch(e => {});
  createNotification({ type: 'lead', title: 'New Lead Scoped', message: `${newLead.name} from ${newLead.company || 'Individual'} requested ${newLead.serviceInterested}` }).catch(e => {});

  return newLead;
}

export async function updateLeadStatus(id, status) {
  if (isMongo) {
    return await MongoLead.findByIdAndUpdate(id, { status }, { new: true });
  } else {
    const db = readJsonDb();
    const lead = db.leads.find(l => l._id === id);
    if (lead) {
      lead.status = status;
      writeJsonDb(db);
      return lead;
    }
    throw new Error('Lead not found');
  }
}

export async function updateLeadCrm(id, data) {
  if (isMongo) {
    return await MongoLead.findByIdAndUpdate(id, { $set: data }, { new: true });
  } else {
    const db = readJsonDb();
    const index = db.leads.findIndex(l => l._id === id);
    if (index !== -1) {
      db.leads[index] = { ...db.leads[index], ...data };
      writeJsonDb(db);
      return db.leads[index];
    }
    return null;
  }
}

export async function bulkImportLeads(leadsArray) {
  const importedLeads = [];
  for (const lead of leadsArray) {
    const newL = await createLead(lead);
    importedLeads.push(newL);
  }
  return importedLeads;
}

// Services CRUD
export async function getServices() {
  if (isMongo) {
    return await MongoService.find().sort({ order: 1 });
  } else {
    const db = readJsonDb();
    return (db.services || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function createService(data) {
  if (isMongo) {
    const newService = new MongoService(data);
    return await newService.save();
  } else {
    const db = readJsonDb();
    if (!db.services) db.services = [];
    const newService = { _id: generateId(), ...data };
    db.services.push(newService);
    writeJsonDb(db);
    return newService;
  }
}

export async function updateService(id, data) {
  if (isMongo) {
    return await MongoService.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readJsonDb();
    if (!db.services) db.services = [];
    const index = db.services.findIndex(s => s._id === id);
    if (index !== -1) {
      db.services[index] = { ...db.services[index], ...data };
      writeJsonDb(db);
      return db.services[index];
    }
    return null;
  }
}

export async function deleteService(id) {
  if (isMongo) {
    return await MongoService.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    if (!db.services) db.services = [];
    db.services = db.services.filter(s => s._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

// FAQs CRUD
export async function getFaqs() {
  if (isMongo) {
    return await MongoFAQ.find().sort({ order: 1 });
  } else {
    const db = readJsonDb();
    return (db.faqs || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function createFaq(data) {
  if (isMongo) {
    const newFaq = new MongoFAQ(data);
    return await newFaq.save();
  } else {
    const db = readJsonDb();
    if (!db.faqs) db.faqs = [];
    const newFaq = { _id: generateId(), ...data };
    db.faqs.push(newFaq);
    writeJsonDb(db);
    return newFaq;
  }
}

export async function updateFaq(id, data) {
  if (isMongo) {
    return await MongoFAQ.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readJsonDb();
    if (!db.faqs) db.faqs = [];
    const index = db.faqs.findIndex(f => f._id === id);
    if (index !== -1) {
      db.faqs[index] = { ...db.faqs[index], ...data };
      writeJsonDb(db);
      return db.faqs[index];
    }
    return null;
  }
}

export async function deleteFaq(id) {
  if (isMongo) {
    return await MongoFAQ.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    if (!db.faqs) db.faqs = [];
    db.faqs = db.faqs.filter(f => f._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

// Logos CRUD
export async function getLogos() {
  if (isMongo) {
    return await MongoLogo.find().sort({ order: 1 });
  } else {
    const db = readJsonDb();
    return (db.logos || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function createLogo(data) {
  if (isMongo) {
    const newLogo = new MongoLogo(data);
    return await newLogo.save();
  } else {
    const db = readJsonDb();
    if (!db.logos) db.logos = [];
    const newLogo = { _id: generateId(), ...data };
    db.logos.push(newLogo);
    writeJsonDb(db);
    return newLogo;
  }
}

export async function updateLogo(id, data) {
  if (isMongo) {
    return await MongoLogo.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readJsonDb();
    if (!db.logos) db.logos = [];
    const index = db.logos.findIndex(l => l._id === id);
    if (index !== -1) {
      db.logos[index] = { ...db.logos[index], ...data };
      writeJsonDb(db);
      return db.logos[index];
    }
    return null;
  }
}

export async function deleteLogo(id) {
  if (isMongo) {
    return await MongoLogo.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    if (!db.logos) db.logos = [];
    db.logos = db.logos.filter(l => l._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

// Logs CRUD
export async function getLogs() {
  if (isMongo) {
    return await MongoLog.find().sort({ timestamp: -1 }).limit(100);
  } else {
    const db = readJsonDb();
    const list = db.logs || [];
    return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
  }
}

export async function createLog(data) {
  if (isMongo) {
    const newLog = new MongoLog(data);
    return await newLog.save();
  } else {
    const db = readJsonDb();
    if (!db.logs) db.logs = [];
    const newLog = { 
      _id: generateId(), 
      admin: data.admin || 'Admin', 
      action: data.action, 
      timestamp: new Date().toISOString() 
    };
    db.logs.push(newLog);
    writeJsonDb(db);
    return newLog;
  }
}

// Notifications CRUD
export async function getNotifications() {
  if (isMongo) {
    return await MongoNotification.find().sort({ timestamp: -1 }).limit(50);
  } else {
    const db = readJsonDb();
    const list = db.notifications || [];
    return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
  }
}

export async function createNotification(data) {
  if (isMongo) {
    const newNotif = new MongoNotification(data);
    return await newNotif.save();
  } else {
    const db = readJsonDb();
    if (!db.notifications) db.notifications = [];
    const newNotif = { 
      _id: generateId(), 
      type: data.type || 'system',
      title: data.title, 
      message: data.message,
      read: false, 
      timestamp: new Date().toISOString() 
    };
    db.notifications.push(newNotif);
    writeJsonDb(db);
    return newNotif;
  }
}

export async function markNotificationsRead() {
  if (isMongo) {
    return await MongoNotification.updateMany({ read: false }, { $set: { read: true } });
  } else {
    const db = readJsonDb();
    if (!db.notifications) db.notifications = [];
    db.notifications = db.notifications.map(n => ({ ...n, read: true }));
    writeJsonDb(db);
    return { success: true };
  }
}

export async function clearNotifications() {
  if (isMongo) {
    return await MongoNotification.deleteMany({});
  } else {
    const db = readJsonDb();
    db.notifications = [];
    writeJsonDb(db);
    return { success: true };
  }
}

// Media CRUD
export async function getMedia() {
  if (isMongo) {
    return await MongoMedia.find().sort({ uploadedAt: -1 });
  } else {
    const db = readJsonDb();
    return db.media || [];
  }
}

export async function createMedia(data) {
  if (isMongo) {
    const newMedia = new MongoMedia(data);
    return await newMedia.save();
  } else {
    const db = readJsonDb();
    if (!db.media) db.media = [];
    const newMedia = { 
      _id: generateId(), 
      name: data.name, 
      url: data.url, 
      folder: data.folder || 'General', 
      type: data.type || 'image',
      size: data.size || 0,
      uploadedAt: new Date().toISOString()
    };
    db.media.push(newMedia);
    writeJsonDb(db);
    return newMedia;
  }
}

export async function deleteMedia(id) {
  if (isMongo) {
    return await MongoMedia.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    if (!db.media) db.media = [];
    db.media = db.media.filter(m => m._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

// Settings CRUD
export async function getSettings() {
  if (isMongo) {
    let settings = await MongoSettings.findOne({ key: 'config' });
    if (!settings) {
      settings = new MongoSettings({ key: 'config' });
      await settings.save();
    }
    return settings;
  } else {
    const db = readJsonDb();
    if (!db.settings) {
      db.settings = {
        key: 'config',
        agency: {
          companyName: 'Aperio Studio',
          email: 'aperiostudio92@gmail.com',
          phone: '+1 (555) 000-0000',
          whatsApp: '1234567890',
          address: 'San Francisco, CA',
          googleMaps: '',
          socialLinks: {},
          businessHours: '9 AM - 6 PM EST',
          logo: '',
          favicon: ''
        },
        website: {
          heroText: 'Reveal Hidden Potential',
          stats: {},
          contactEmail: 'aperiostudio92@gmail.com',
          seo: {
            title: 'Aperio Studio - Premium Digital Agency',
            description: 'We craft cyber-aesthetic platforms that convert.'
          }
        },
        api: {
          telegramBotToken: '',
          telegramChatId: '',
          googleAnalyticsId: '',
          smtpUser: '',
          smtpPass: ''
        }
      };
      writeJsonDb(db);
    }
    return db.settings;
  }
}

export async function updateSettings(data) {
  if (isMongo) {
    return await MongoSettings.findOneAndUpdate({ key: 'config' }, data, { new: true, upsert: true });
  } else {
    const db = readJsonDb();
    db.settings = { ...db.settings, ...data, key: 'config' };
    writeJsonDb(db);
    return db.settings;
  }
}

// Users CRUD
export async function getUsers() {
  if (isMongo) {
    return await MongoUser.find();
  } else {
    const db = readJsonDb();
    return db.users || [];
  }
}

export async function createUser(data) {
  if (isMongo) {
    const newUser = new MongoUser(data);
    return await newUser.save();
  } else {
    const db = readJsonDb();
    if (!db.users) db.users = [];
    const newUser = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
    db.users.push(newUser);
    writeJsonDb(db);
    return newUser;
  }
}

export async function updateUser(id, data) {
  if (isMongo) {
    return await MongoUser.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readJsonDb();
    if (!db.users) db.users = [];
    const index = db.users.findIndex(u => u._id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...data };
      writeJsonDb(db);
      return db.users[index];
    }
    return null;
  }
}

export async function deleteUser(id) {
  if (isMongo) {
    return await MongoUser.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    if (!db.users) db.users = [];
    db.users = db.users.filter(u => u._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

// Extended Review CRUD
export async function getAllReviews() {
  if (isMongo) {
    return await MongoReview.find().sort({ createdAt: -1 });
  } else {
    const db = readJsonDb();
    const list = db.reviews || [];
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function updateReviewStatus(id, data) {
  if (isMongo) {
    return await MongoReview.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readJsonDb();
    if (!db.reviews) db.reviews = [];
    const index = db.reviews.findIndex(r => r._id === id);
    if (index !== -1) {
      db.reviews[index] = { ...db.reviews[index], ...data };
      writeJsonDb(db);
      return db.reviews[index];
    }
    return null;
  }
}

export async function deleteReview(id) {
  if (isMongo) {
    return await MongoReview.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    if (!db.reviews) db.reviews = [];
    db.reviews = db.reviews.filter(r => r._id !== id);
    writeJsonDb(db);
    return { success: true };
  }
}

// Analytics
export async function recordVisit(data) {
  if (isMongo) {
    const newVisit = new MongoVisit({
      path: data.path,
      device: data.device,
      ip: data.ip
    });
    return await newVisit.save();
  } else {
    const db = readJsonDb();
    if (!db.analytics) {
      db.analytics = { visits: [], leadConversions: 0 };
    }
    const newVisit = {
      _id: generateId(),
      timestamp: new Date().toISOString(),
      path: data.path,
      device: data.device,
      ip: data.ip
    };
    db.analytics.visits.push(newVisit);
    writeJsonDb(db);
    return newVisit;
  }
}

export async function getAnalyticsStats() {
  if (isMongo) {
    const totalVisits = await MongoVisit.countDocuments();
    const totalLeads = await MongoLead.countDocuments();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const visitTrend = await MongoVisit.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const leadStatusCounts = await MongoLead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const deviceCounts = await MongoVisit.aggregate([
      { $group: { _id: "$device", count: { $sum: 1 } } }
    ]);

    return {
      totalVisits,
      totalLeads,
      visitTrend: visitTrend.map(item => ({ date: item._id, count: item.count })),
      leadStatus: leadStatusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, { new: 0, contacted: 0, converted: 0, archived: 0 }),
      devices: deviceCounts.reduce((acc, curr) => {
        acc[curr._id || 'unknown'] = curr.count;
        return acc;
      }, { desktop: 0, mobile: 0, tablet: 0 })
    };
  } else {
    const db = readJsonDb();
    const visits = db.analytics?.visits || [];
    const leads = db.leads || [];

    const totalVisits = visits.length;
    const totalLeads = leads.length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const visitTrend = last7Days.map(date => {
      const count = visits.filter(v => v.timestamp.split('T')[0] === date).length;
      return { date, count };
    });

    const leadStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, { new: 0, contacted: 0, converted: 0, archived: 0 });

    const devices = visits.reduce((acc, visit) => {
      const dev = visit.device || 'desktop';
      acc[dev] = (acc[dev] || 0) + 1;
      return acc;
    }, { desktop: 0, mobile: 0, tablet: 0 });

    return {
      totalVisits,
      totalLeads,
      visitTrend,
      leadStatus,
      devices
    };
  }
}

// Client Reviews approved list
export async function getReviews() {
  if (isMongo) {
    return await MongoReview.find({ status: 'approved' }).sort({ createdAt: -1 });
  } else {
    const db = readJsonDb();
    const list = db.reviews || [];
    return list
      .filter(r => r.status === 'approved')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function createReview(data) {
  if (isMongo) {
    const newReview = new MongoReview({
      name: data.name,
      company: data.company,
      email: data.email,
      projectName: data.projectName || '',
      rating: Number(data.rating) || 5,
      feedback: data.feedback,
      status: 'approved'
    });
    return await newReview.save();
  } else {
    const db = readJsonDb();
    if (!db.reviews) db.reviews = [];
    const newReview = {
      _id: generateId(),
      name: data.name,
      company: data.company,
      email: data.email,
      projectName: data.projectName || '',
      rating: Number(data.rating) || 5,
      feedback: data.feedback,
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    db.reviews.push(newReview);
    writeJsonDb(db);
    return newReview;
  }
}

export async function getAudits() {
  if (isMongo) {
    return await MongoAudit.find().sort({ createdAt: -1 });
  } else {
    const db = readJsonDb();
    const list = db.audits || [];
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function createAudit(data) {
  const auditPayload = {
    websiteUrl: data.websiteUrl,
    businessName: data.businessName || '',
    email: data.email,
    phone: data.phone || '',
    status: 'pending',
    results: data.results || ''
  };

  if (isMongo) {
    const mongoAudit = new MongoAudit(auditPayload);
    return await mongoAudit.save();
  } else {
    const db = readJsonDb();
    if (!db.audits) db.audits = [];
    const newAudit = {
      _id: generateId(),
      ...auditPayload,
      createdAt: new Date().toISOString()
    };
    db.audits.push(newAudit);
    writeJsonDb(db);
    return newAudit;
  }
}

export async function deleteAudit(id) {
  if (isMongo) {
    return await MongoAudit.findByIdAndDelete(id);
  } else {
    const db = readJsonDb();
    if (!db.audits) db.audits = [];
    db.audits = db.audits.filter(a => a._id !== id);
    writeJsonDb(db);
    return true;
  }
}
