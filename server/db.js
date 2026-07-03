import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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
      analytics: {
        visits: [],
        leadConversions: 0
      }
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
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
  image: String
});
const MongoProject = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const TestimonialSchema = new mongoose.Schema({
  name: String,
  role: String,
  company: String,
  content: String,
  rating: Number,
  avatar: String
});
const MongoTestimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);

const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  businessName: String,
  projectDetails: String,
  budget: String,
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});
const MongoLead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

const VisitSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  path: String,
  device: String,
  ip: String
});
const MongoVisit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);

// ----------------------------------------------------
// SEEDING DEFAULTS
// ----------------------------------------------------
async function seedDefaults() {
  const defaultProjects = [
    {
      title: "Grow Elite",
      description: "A scale-up landing platform built for an executive startup accelerator. Includes a multi-step pricing funnel, real-time consultation scheduler, and interactive marketing ROI calculators. Reduced lead friction by 40% within the first month of deployment.",
      category: "Web App / Startup Launch",
      client: "Grow Elite Inc.",
      impact: "+180% Lead Rate",
      tags: ["React", "Fastify", "ROI Engine", "Aesthetic Funnels"],
      link: "#",
      image: "linear-gradient(135deg, #150030 0%, #3a0078 100%)"
    },
    {
      title: "E-sports Hub",
      description: "An immersive e-sports tournament dashboard and community portal. Built with live match statistics, dynamic brackets, discord notification webhook triggers, and player registration modules. Configured to support up to 5,000 concurrent tournament participants.",
      category: "Gaming & Web3",
      client: "Elite Esports Tournament",
      impact: "5.2k Active Registrants",
      tags: ["React", "Real-time Brackets", "WebSockets", "Glassmorphic UI"],
      link: "#",
      image: "linear-gradient(135deg, #0b1e36 0%, #00d2ff 100%)"
    }
  ];

  const defaultTestimonials = [
    {
      name: "Marcus Vance",
      role: "CEO & Founder",
      company: "Grow Elite",
      content: "Aperio Digital transformed our online presence completely. The user experience they designed for our platform was cinematic and converted leads better than any platform we've used in the past five years. Extremely professional team.",
      rating: 5,
      avatar: "MV"
    },
    {
      name: "Sarah 'Valkyrie' Chen",
      role: "Tournament Director",
      company: "E-sports Hub",
      content: "Our tournament registrants were amazed by the fluid bracket updates and the dark-cyber dashboard. Working with them was an absolute pleasure; they understood the aesthetics of our gaming community perfectly.",
      rating: 5,
      avatar: "SC"
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
    if (updated) {
      writeJsonDb(db);
      console.log('Seeded default projects/testimonials into local JSON.');
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
  if (isMongo) {
    const newLead = new MongoLead(data);
    return await newLead.save();
  } else {
    const db = readJsonDb();
    const newLead = { 
      _id: generateId(), 
      name: data.name,
      email: data.email,
      businessName: data.businessName || '',
      projectDetails: data.projectDetails || '',
      budget: data.budget || '',
      status: 'new', 
      createdAt: new Date().toISOString() 
    };
    db.leads.push(newLead);
    writeJsonDb(db);
    return newLead;
  }
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
    
    // Group visits by day for last 7 days
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

    // Group leads by status
    const leadStatusCounts = await MongoLead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Group devices
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

    // Last 7 days
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
