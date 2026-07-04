/**
 * Deterministic AI Lead Intelligence & CRM Automation Engine
 * Aperio Studio V2 - Phase 3
 */

export function analyzeLead(lead) {
  const details = (lead.projectDetails || lead.message || '').toLowerCase();
  const email = (lead.email || '').toLowerCase();
  const company = (lead.businessName || lead.company || '').trim();
  const userBudget = (lead.budget || '').toLowerCase();

  // 1. Lead Scoring (Baseline: 40)
  let score = 40;

  // Description richness
  if (details.length > 50) score += 10;
  if (details.length > 150) score += 15;

  // Budget validation
  if (userBudget.includes('$5,000+') || userBudget.includes('$5k')) score += 15;
  else if (userBudget.includes('$10,000+') || userBudget.includes('$10k')) score += 25;
  else if (userBudget.includes('$20,000+') || userBudget.includes('$20k')) score += 30;

  // Domain authority (Corporate email vs public provider)
  const isPublicEmail = email.includes('gmail.com') || email.includes('yahoo.com') || email.includes('hotmail.com') || email.includes('outlook.com') || email.includes('icloud.com');
  if (email && !isPublicEmail) score += 15;

  // Company presence
  if (company.length > 1) score += 10;

  // Cap lead score at 100
  const leadScore = Math.min(score, 100);

  // 2. Urgency level detection
  let urgency = 'medium';
  const urgentKeywords = ['asap', 'urgent', 'launch immediately', 'deadline', 'fast', 'soon', 'immediately', 'weeks', 'within a month'];
  const relaxedKeywords = ['flexible', 'no rush', 'someday', 'eventually', 'next year', 'future'];
  
  if (urgentKeywords.some(kw => details.includes(kw))) {
    urgency = 'high';
  } else if (relaxedKeywords.some(kw => details.includes(kw))) {
    urgency = 'low';
  }

  // 3. Project Complexity rating (30 - 95)
  let complexityScore = 40;
  if (details.includes('database') || details.includes('auth') || details.includes('dashboard') || details.includes('crm') || details.includes('custom admin')) {
    complexityScore += 25;
  }
  if (details.includes('ai') || details.includes('gpt') || details.includes('llm') || details.includes('automation') || details.includes('webhook')) {
    complexityScore += 20;
  }
  if (details.includes('three.js') || details.includes('3d') || details.includes('animation') || details.includes('shaders')) {
    complexityScore += 10;
  }
  complexityScore = Math.min(complexityScore, 95);

  // 4. Estimated timeline calculation
  let estimatedTimeline = '3-4 Weeks';
  if (complexityScore > 75) {
    estimatedTimeline = '6-8 Weeks';
  } else if (complexityScore > 55) {
    estimatedTimeline = '4-6 Weeks';
  }

  // 5. Next recommended follow-up action
  let recommendedAction = 'Schedule 15-minute Discovery Consultation';
  if (urgency === 'high') {
    recommendedAction = 'Send Priority Interactive Mockup & Calendar Invite';
  } else if (leadScore > 85) {
    recommendedAction = 'Dispatch Customized Proposal Deck & Case Studies';
  }

  // 6. Up-selling products recommend
  const upsells = ['Monthly Maintenance Care Plan'];
  if (details.includes('video') || details.includes('edit')) {
    upsells.push('Social Reels Cut Package (10 Clips)');
  }
  if (details.includes('website') || details.includes('funnel') || details.includes('landing')) {
    upsells.push('Core Technical SEO Audit & Backlink Strategy');
    upsells.push('Conversion Rate Optimization Retainer');
  }
  if (complexityScore > 70) {
    upsells.push('Scalable AWS Server Migration and CDN Setup');
  }

  // 7. Simulated suggested email responder
  const clientName = lead.name || 'Valued Partner';
  const companyPhrase = company ? ` for ${company}` : '';
  const suggestedResponse = `Hi ${clientName},\n\nThank you for reaching out to Aperio Studio. We read through your interest in developing a tailored digital solution${companyPhrase}.\n\nYour project details outline some fantastic parameters. I would love to arrange a quick 15-minute consultation to walk you through our recent case studies and sketch an interactive scope outline.\n\nPlease choose a convenient slot on our calendar: https://calendly.com/aperiostudio\n\nLooking forward to speaking,\n\nDigital Architect Team\nAperio Studio`;

  return {
    leadScore,
    urgency,
    complexityScore,
    estimatedTimeline,
    recommendedAction,
    potentialUpsells: upsells,
    suggestedResponse
  };
}

export function generateProposalWithAI(lead) {
  const clientName = lead.name || 'Client';
  const company = lead.businessName || lead.company || 'Your Brand';
  const details = lead.projectDetails || lead.message || 'Custom digital solutions development.';
  const budget = lead.budget || 'Custom Budget';

  // AI Proposal Markdown Template
  return `# PROPOSAL OF PARTNERSHIP
**Prepared for:** ${clientName} (${company})  
**Drafted by:** Aperio Studio  
**Date:** ${new Date().toLocaleDateString()}

---

## 1. Executive Summary
Aperio Studio builds high-converting digital products. Based on your project brief, we propose crafting a custom solution that addresses your functional requirements while maintaining a high-performance visual presence.

### Scope Brief:
"${details}"

---

## 2. Project Architecture & Deliverables
* **Modern Web Platform:** Fully responsive glassmorphism client application utilizing React, Vite, and tailwind/custom vanilla CSS layers.
* **Database & CMS Core:** Local fast cache indices backed by modular schema controllers for absolute scalability.
* **SEO & Meta Engineering:** 100/100 Lighthouse performance configurations, dynamic structured schemas, meta headers, and sitemaps.
* **Integrations:** Automated webhook notification layers and analytics dashboards mapping GTM/GA4 visitor trends.

---

## 3. Estimated Scope Timeline
* **Week 1-2:** Wireframes, interactive design prototype, and visual style approval.
* **Week 3-4:** Front-end engineering, database architecture integration, and animations.
* **Week 5:** Quality audits, accessibility testing, and SEO validation.
* **Week 6:** Launch, server indexing, and handoff files delivery.

---

## 4. Financial Investment
* **Total Estimated Budget:** ${budget}  
* **Terms:** 50% upfront retainer, 50% upon final production launch.

---

## 5. Next Steps
1. **Approve Draft:** Provide signature or feedback on this proposal document.
2. **Kickoff Discovery:** Schedule a kickoff call to map layout architectures.
3. **Milestone Review:** Approve visual mockups before code development starts.
`;
}

export function generateEmailWithAI(type, lead) {
  const name = lead.name || 'Valued Partner';
  const company = lead.businessName || lead.company || 'your business';
  const budget = lead.budget || 'your budget';

  switch (type) {
    case 'welcome':
      return `Subject: Welcome to Aperio Studio | Custom Design Blueprint

Hi ${name},

Thanks for reaching out to Aperio Studio! We've received your request and our design team is already reviewing your details. 

Our team specializes in premium web development, cinematic video editing, and AI automation. We will construct a custom project blueprint and send it over within 24 hours.

If you'd like to expedite the process, you can schedule a direct call with our architect here: https://calendly.com/aperiostudio

Best regards,
Aperio Studio Team`;

    case 'proposal':
      return `Subject: Interactive Proposal & Scope - Aperio Studio

Hi ${name},

We have completed analyzing your requirements for ${company}. 

Attached is our customized proposal outlining the project milestones, deliverables, tech stack, and financial investment options tailored to your target budget (${budget}).

Let us know if these guidelines align with your timeframe, and we can initiate our kickoff session this week.

Best regards,
Aperio Studio Team`;

    case 'followup':
      return `Subject: Re: Next Steps for ${company}

Hi ${name},

Just following up on the design scope proposal we sent over. 

We have some visual blueprints ready for the animations and particle layouts, and we'd love to get your feedback on them. 

Are you free for a brief 10-minute call this week?

Best regards,
Aperio Studio Team`;

    case 'reminder':
      return `Subject: Quick Follow-up: Aperio Studio Schedule

Hi ${name},

I hope you're doing well. Just checking if you had a chance to review our proposed terms and estimated timeline. 

Our production queue is booking up for the month, and we want to ensure we reserve a dedicated developer sprint for your project.

Let us know how you would like to proceed!

Best regards,
Aperio Studio Team`;

    case 'completion':
      return `Subject: Project Launch Complete! | Handoff Documentation

Hi ${name},

Congratulations! We have officially launched the platform for ${company}.

The site is fully responsive, optimized with 100/100 Lighthouse indicators, secure helmet filters, and indexed correctly on search engines.

Attached is your system handoff guide, admin passcode logins, and training documentation for editing services or portfolio cards.

Thank you for partnering with Aperio Studio!

Best regards,
Aperio Studio Team`;

    case 'thankyou':
      return `Subject: Thank You from Aperio Studio!

Hi ${name},

It was an absolute pleasure working with you to bring your digital vision to life. 

If you have a moment, we would love to get your feedback on our work to add to our verified testimonials gallery: https://aperiostudio.com#feedback

If you need any future maintenance packages or marketing analytics reviews, we are always here to help.

Best regards,
Aperio Studio Team`;

    default:
      return `Hi ${name},\n\nThank you for collaborating with Aperio Studio.\n\nBest regards,\nAperio Studio Team`;
  }
}
