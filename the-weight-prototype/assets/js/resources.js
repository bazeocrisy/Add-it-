/* ─────────────────────────────────────────────────────────────
   THE WEIGHT — RESOURCE & JOURNEY CONFIGURATION
   This is the ONLY file the owner needs to edit to change where
   the wizard sends people. Every page reads from it.

   HOW IT FITS TOGETHER
     RESOURCES  every phone line, text line, and website we link to
     TOOLS      The Weight's own pages (Unload, Talk It Through)
     TOPICS     Step 1 cards: "What's weighing on you?"
     NEEDS      Step 2 cards: "What would help right now?"
     RESULTS    the next step shown for each topic + need

   VERIFICATION RULES
     verified: "owner"     → already listed on theweightmen.com with a
                             lastVerified date. Shown as "Checked by The Weight".
     verified: "prototype" → added for this prototype only. Shown as
                             "Suggested addition — not yet checked by The Weight".
                             The owner should confirm or delete these before launch.

   Nothing in this file is ever sent anywhere, and the site does not
   store which cards a visitor picks.
   ───────────────────────────────────────────────────────────── */

window.TW = window.TW || {};

TW.SITE = {
  name: "The Weight",
  tagline: "You don’t have to carry it by yourself.",
  originalUrl: "https://theweightmen.com/",
  contactEmail: "theweightmen@gmail.com",
  mission:
    "The Weight is a welcoming, practical place for adult men to set down some of what they’re carrying: veterans and service members, men without stable housing, divorced dads, caregivers, and men facing work, money, housing, or relationship problems.",
  disclaimer:
    "The Weight is a peer-support and resource project. It is not a therapy provider, medical care, or an emergency service, and nobody is monitoring what you write here.",
};

/* kind decides which group a resource is shown in:
     emergency    → 911
     crisis       → 24/7 crisis lines
     professional → counseling / treatment referral
     practical    → housing, food, work, legal, family services
     info         → reading material (scam checks, benefits info)          */
TW.RESOURCES = {
  "911": {
    name: "911",
    kind: "emergency",
    offers: "If you or someone else is in immediate physical danger.",
    phone: "911", call: "tel:911",
    verified: "owner", lastVerified: "2026-11-23",
  },
  "988": {
    name: "988 Suicide & Crisis Lifeline",
    kind: "crisis",
    offers: "Free, 24/7. Talk, text, or chat with a trained crisis counselor about emotional distress, suicidal thoughts, or worry about someone else.",
    phone: "988", call: "tel:988", text: "sms:988", textLabel: "Text 988",
    chat: "https://chat.988lifeline.org/",
    url: "https://988lifeline.org/get-help/",
    verified: "owner", lastVerified: "2026-11-23",
  },
  vcl: {
    name: "Veterans Crisis Line",
    kind: "crisis",
    offers: "Free, confidential, 24/7 for veterans, service members, and their families. Call 988 and press 1, or text 838255. VA enrollment is not required.",
    phone: "988, then press 1", call: "tel:988", text: "sms:838255", textLabel: "Text 838255",
    chat: "https://www.veteranscrisisline.net/get-help-now/chat/",
    url: "https://www.va.gov/health-care/health-needs-conditions/mental-health/suicide-prevention/",
    verified: "owner", lastVerified: "2026-11-23",
  },
  nchv: {
    name: "National Call Center for Homeless Veterans (VA)",
    kind: "practical",
    offers: "Free, confidential, 24/7 for veterans who are homeless or at risk of losing housing. Connects you with VA staff near you. Family, friends, and providers can call too.",
    phone: "1-877-424-3838", call: "tel:18774243838",
    url: "https://department.va.gov/homeless/nationalcallcenter/",
    verified: "owner", lastVerified: "2026-11-23",
  },
  "211": {
    name: "211",
    kind: "practical",
    offers: "Connects you with local help for housing and utility costs, food programs, healthcare costs, caregiver resources, and more. What’s offered depends on where you live.",
    phone: "211", call: "tel:211",
    url: "https://www.211.org/",
    verified: "owner", lastVerified: "2026-11-23",
  },
  food: {
    name: "Feeding America: Find Your Local Food Bank",
    kind: "practical",
    offers: "Search by ZIP code to find a food bank, then partner pantries and meal programs with hours and locations.",
    url: "https://www.feedingamerica.org/find-your-local-foodbank",
    verified: "owner", lastVerified: "2026-11-23",
  },
  ajc: {
    name: "American Job Centers (U.S. Department of Labor)",
    kind: "practical",
    offers: "Free job search help: computers, resume help, workshops, training, and benefits information. Services vary by location.",
    phone: "1-877-872-5627", call: "tel:18778725627",
    url: "https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx",
    verified: "owner", lastVerified: "2026-11-23",
  },
  ftcJobs: {
    name: "FTC: How to spot job scams",
    kind: "info",
    offers: "Plain-language warning signs before you say yes to a job offer. Report scams at ReportFraud.ftc.gov.",
    url: "https://consumer.ftc.gov/articles/job-scams",
    verified: "owner", lastVerified: "2026-11-23",
  },
  vagov: {
    name: "VA.gov",
    kind: "info",
    offers: "Official starting point for VA benefits: health care, disability, education, housing, and careers.",
    url: "https://www.va.gov/",
    verified: "owner", lastVerified: "2026-11-23",
  },
  trafficking: {
    name: "National Human Trafficking Hotline",
    kind: "crisis",
    offers: "24/7, confidential. For anyone in a sex or labor trafficking situation, or worried about someone who is. Call 1-888-373-7888 or text 233733.",
    phone: "1-888-373-7888", call: "tel:18883737888", text: "sms:233733", textLabel: "Text 233733",
    url: "https://humantraffickinghotline.org/",
    verified: "owner", lastVerified: "2026-11-24",
  },
  dv: {
    name: "National Domestic Violence Hotline",
    kind: "crisis",
    offers: "Support for people experiencing abuse from a partner or family member. Men are welcome. Call 1-800-799-7233 or text 88788.",
    phone: "1-800-799-7233", call: "tel:18007997233", text: "sms:88788", textLabel: "Text 88788",
    url: "https://www.thehotline.org/",
    verified: "owner", lastVerified: "2026-11-24",
  },
  rainn: {
    name: "National Sexual Assault Hotline (RAINN)",
    kind: "crisis",
    offers: "Confidential support for survivors of sexual assault and abuse, including men and boys.",
    phone: "1-800-656-4673", call: "tel:18006564673",
    url: "https://rainn.org/",
    verified: "owner", lastVerified: "2026-11-24",
  },

  /* ── Suggested additions (NOT on theweightmen.com yet) ──────────
     Well-established national services that fill gaps in the
     wizard (grief, counseling, fatherhood, caregiving, legal).
     The links were checked for this prototype; the owner should
     confirm each one before it goes live.                          */
  samhsa: {
    name: "SAMHSA National Helpline",
    kind: "professional",
    offers: "Free, confidential, 24/7 information and referrals to local treatment, support groups, and community services for mental health and substance use.",
    phone: "1-800-662-4357", call: "tel:18006624357",
    url: "https://www.samhsa.gov/find-help/helplines/national-helpline",
    verified: "prototype",
  },
  findtreatment: {
    name: "FindTreatment.gov",
    kind: "professional",
    offers: "Official U.S. government search for mental health and substance use treatment near you. Filter by payment options, including low or no cost.",
    url: "https://findtreatment.gov/",
    verified: "prototype",
  },
  mos: {
    name: "Military OneSource",
    kind: "professional",
    offers: "Free, confidential support for service members and their families, including non-medical counseling and help with moves, money, and transition.",
    phone: "800-342-9647", call: "tel:8003429647",
    url: "https://www.militaryonesource.mil/",
    verified: "prototype",
  },
  fatherhood: {
    name: "National Responsible Fatherhood Clearinghouse",
    kind: "practical",
    offers: "Free information for dads on co-parenting, child support, and staying connected with your kids, plus a search for local fatherhood programs.",
    url: "https://www.fatherhood.gov/",
    verified: "prototype",
  },
  eldercare: {
    name: "Eldercare Locator",
    kind: "practical",
    offers: "Connects caregivers with local services for older adults: meals, transportation, in-home help, and caregiver support.",
    phone: "1-800-677-1116", call: "tel:18006771116",
    url: "https://eldercare.acl.gov/",
    verified: "prototype",
  },
  lawhelp: {
    name: "LawHelp.org",
    kind: "practical",
    offers: "Free legal information and links to legal aid in your state, including divorce, custody, and child support.",
    url: "https://www.lawhelp.org/",
    verified: "prototype",
  },
};

/* The Weight's own tools. These pages are part of the owner's site
   (theweightmen.com/unload.html and /talk.html) and are re-created in
   this prototype so the wizard can send people straight to them.      */
TW.TOOLS = {
  unload: {
    name: "Unload",
    offers: "A private place to write it out. Nothing is sent or saved.",
    href: "unload.html",
  },
  talk: {
    name: "Talk It Through",
    offers: "Write a short message asking someone you trust for exactly what you want: to listen, or to give honest feedback.",
    href: "talk.html",
  },
};

/* ── STEP 1: What's weighing on you? ─────────────────────────────
   Taken from the doors and mission on theweightmen.com.
   needs:  which Step 2 cards to show (in order)
   direct: skip Step 2 and go straight to this result              */
TW.TOPICS = [
  { id: "stress",   label: "Stress or feeling low",       hint: "Worry, pressure, anger, can’t switch off", icon: "cloud",
    needs: ["talk", "counselor", "reach", "today"] },
  { id: "divorce",  label: "Divorce or relationships",   hint: "Separation, co-parenting, a partner, family", icon: "split",
    needs: ["talk", "practical", "reach", "today"] },
  { id: "father",   label: "Fatherhood or caregiving",    hint: "Being a dad, caring for a parent or partner", icon: "family",
    needs: ["practical", "talk", "reach", "today"] },
  { id: "grief",    label: "Grief or loss",               hint: "Someone died, or something ended",          icon: "leaf",
    needs: ["talk", "counselor", "reach", "today"] },
  { id: "alone",    label: "Feeling alone",               hint: "Lonely, cut off, nobody to call",           icon: "person",
    needs: ["reach", "talk", "today"] },
  { id: "work",     label: "Money or work",               hint: "Lost a job, bills, need income",            icon: "briefcase",
    needs: ["job", "bills", "talk"] },
  { id: "housing",  label: "Housing, food, or basics",    hint: "A bed tonight, a meal, a ride, a bill",      icon: "home",
    direct: "housing" },
  { id: "military", label: "Military or veteran life",    hint: "Veterans, service members, families",        icon: "star",
    needs: ["vurgent", "vpractical", "reach", "today"] },
  { id: "unsure",   label: "I’m not sure",                hint: "It’s just heavy right now",                 icon: "question",
    needs: ["talk", "today", "reach", "practical"] },
];

/* ── STEP 2: What would help right now? ────────────────────────── */
TW.NEEDS = {
  talk:       { label: "Someone to talk to now",          hint: "Free and confidential, any hour",        icon: "phone" },
  counselor:  { label: "Find a counselor",                hint: "Ongoing, professional support",          icon: "clipboard" },
  reach:      { label: "Reach out to someone I know",     hint: "A friend, brother, someone you served with", icon: "people" },
  today:      { label: "Something I can do right now",    hint: "Private. Takes a few minutes.",          icon: "pen" },
  practical:  { label: "Practical help",                  hint: "Local services, legal and family info",  icon: "list" },
  job:        { label: "Finding work",                    hint: "Job help, training, scam checks",        icon: "briefcase" },
  bills:      { label: "Help with bills or food",         hint: "Rent, utilities, groceries",            icon: "home" },
  vurgent:    { label: "Urgent support",                  hint: "Veterans Crisis Line, 24/7",             icon: "phone" },
  vpractical: { label: "Housing, benefits, or work",      hint: "VA help and next steps",                icon: "list" },
};

/* ── RESULTS ──────────────────────────────────────────────────────
   Key: "topic:need" (or the topic's `direct` id).
   primary:   ONE main action  → { res: "id" } or { tool: "id" }
   secondary: up to TWO more   → same shape
   next:      what happens when they do it (short)
   prompt:    optional starter line passed to Unload                 */
const T = (tool, extra) => Object.assign({ tool }, extra);
const R = (res, extra) => Object.assign({ res }, extra);

const TALK_NOW = {
  title: "Talk to someone tonight",
  lead: "You don’t have to be in crisis to call or text 988. Counselors talk with people about stress, loss, and hard nights every day.",
  primary: R("988"),
  secondary: [T("talk"), T("unload")],
  next: [
    "A trained counselor answers. It’s free and you don’t have to give your name.",
    "Say as much or as little as you want. They listen first.",
    "Prefer typing? Text 988 or use the online chat.",
  ],
};

const UNLOAD_NOW = (prompt) => ({
  title: "Get it out of your head",
  lead: "Writing it down, even for two minutes, can take some of the pressure off. Nobody else will see it.",
  primary: T("unload", { prompt }),
  secondary: [R("988"), T("talk")],
  next: [
    "A blank, private page opens. Nothing you type is sent or saved.",
    "Write as much or as little as you want, then clear it.",
  ],
});

const REACH_OUT = (lead) => ({
  title: "Reach out to one person",
  lead,
  primary: T("talk"),
  secondary: [R("988"), T("unload")],
  next: [
    "Pick what you want from them: to listen, another view, or honest feedback.",
    "We write the first message for you. You copy it and send it from your own phone.",
    "The Weight never sends anything and never sees it.",
  ],
});

const COUNSELOR = {
  title: "Find a counselor",
  lead: "A counselor is one option, not a requirement. These free lines help you find one near you, including low-cost options.",
  primary: R("samhsa"),
  secondary: [R("findtreatment"), R("988")],
  next: [
    "Someone answers 24/7 and asks a few questions about where you live and how you’d pay.",
    "They give you names of local services. You decide whether to contact them.",
  ],
};

TW.RESULTS = {
  "stress:talk": TALK_NOW,
  "stress:counselor": COUNSELOR,
  "stress:reach": REACH_OUT("Saying it out loud to someone you trust can make it lighter. We’ll help you with the first message."),
  "stress:today": UNLOAD_NOW("What’s weighing on me"),

  "divorce:talk": Object.assign({}, TALK_NOW, { lead: "Separation can hit hardest at night, in the empty apartment. You don’t need to be in crisis to call or text 988." }),
  "divorce:practical": {
    title: "Get the practical side moving",
    lead: "Start with free, trustworthy information about custody, child support, and your rights where you live.",
    primary: R("lawhelp"),
    secondary: [R("fatherhood"), R("211")],
    next: [
      "Pick your state to see free legal information and local legal aid.",
      "If you have kids, the Fatherhood Clearinghouse has co-parenting and child-support guides.",
    ],
  },
  "divorce:reach": REACH_OUT("Divorce can quietly cut you off from people. One message to a friend can start to change that."),
  "divorce:today": UNLOAD_NOW("What I haven’t said"),

  "father:practical": {
    title: "Find local help for your family",
    lead: "211 connects you to local family and caregiver services in one call.",
    primary: R("211"),
    secondary: [R("fatherhood"), R("eldercare")],
    next: [
      "Tell them what’s going on: a new baby, a sick parent, needing a break.",
      "They point you to programs near you. What’s offered depends on where you live.",
    ],
  },
  "father:talk": Object.assign({}, TALK_NOW, { lead: "Being the one everyone leans on is heavy. You don’t need to be in crisis to call or text 988." }),
  "father:reach": REACH_OUT("Other dads and caregivers often feel the same way. Ask one of them for an hour."),
  "father:today": UNLOAD_NOW("What’s weighing on me"),

  "grief:talk": Object.assign({}, TALK_NOW, { lead: "Grief doesn’t keep office hours. You don’t need to be in crisis to call or text 988 and talk about who you lost." }),
  "grief:counselor": COUNSELOR,
  "grief:reach": REACH_OUT("People often want to help but don’t know how. Tell one person exactly what you need."),
  "grief:today": UNLOAD_NOW("What I wish I could tell them"),

  "alone:reach": REACH_OUT("Loneliness gets lighter one conversation at a time. Send one message today. It doesn’t have to be about how you feel."),
  "alone:talk": Object.assign({}, TALK_NOW, { lead: "If there’s nobody to call right now, there is still someone. You don’t need to be in crisis to call or text 988." }),
  "alone:today": UNLOAD_NOW("What I haven’t said"),

  "work:job": {
    title: "Get free job help near you",
    lead: "American Job Centers offer free help: computers, resume help, workshops, and training information.",
    primary: R("ajc"),
    secondary: [R("ftcJobs"), R("211")],
    next: [
      "Enter your ZIP code to find the nearest center, or call the toll-free line.",
      "Walk in or call ahead. Services vary by location.",
      "Before you say yes to any offer, check the FTC scam warning signs.",
    ],
  },
  "work:bills": {
    title: "Get help with bills and food",
    lead: "211 is the fastest single call for local help with rent, utilities, and food.",
    primary: R("211"),
    secondary: [R("food"), R("ajc")],
    next: [
      "Have your ZIP code ready. Say what you need first: a bill due, food this week.",
      "Ask what ID or paperwork to bring, and for a backup option.",
    ],
  },
  "work:talk": Object.assign({}, TALK_NOW, { lead: "Losing work can shake how you see yourself. You don’t need to be in crisis to call or text 988." }),

  housing: {
    title: "Call 211 for local help",
    lead: "Needing a place to sleep or a meal doesn’t say anything bad about you. 211 is the fastest first step.",
    primary: R("211"),
    secondary: [R("nchv", { note: "Veteran? Call this 24/7 line instead." }), R("food")],
    next: [
      "Have your ZIP code or nearest cross streets ready.",
      "Say what you need today first (a bed tonight, a meal, a ride), then this month.",
      "Ask about hours, what ID to bring, and for a backup option. Programs fill up.",
    ],
  },

  "military:vurgent": {
    title: "Veterans Crisis Line",
    lead: "Free, confidential, and open 24/7. You don’t need to be enrolled in VA care, and your discharge status doesn’t matter.",
    primary: R("vcl"),
    secondary: [R("911", { note: "If someone is in immediate physical danger." })],
    next: [
      "Call 988 and press 1, or text 838255. A responder who understands military life answers.",
      "In a mental health crisis you can also go directly to a VA medical center.",
    ],
  },
  "military:vpractical": {
    title: "Housing, benefits, and next steps",
    lead: "If housing is at risk, call the VA homeless line first. For benefits, start at VA.gov.",
    primary: R("nchv"),
    secondary: [R("vagov"), R("mos")],
    next: [
      "The call center connects you with VA staff near you, 24/7.",
      "Family, friends, and providers can call on your behalf.",
    ],
  },
  "military:reach": REACH_OUT("Sometimes the best person to talk to is someone you served with. We’ll help you write the first message."),
  "military:today": UNLOAD_NOW("What I haven’t said"),

  "unsure:talk": Object.assign({}, TALK_NOW, { lead: "You don’t need to know what’s wrong to call. Saying “I don’t know, it’s just heavy” is a fine place to start." }),
  "unsure:today": UNLOAD_NOW("What’s weighing on me"),
  "unsure:reach": REACH_OUT("You don’t need to explain it all. “Can we talk?” is enough. We’ll write it for you."),
  "unsure:practical": {
    title: "Call 211 for local help",
    lead: "Not sure where to go? 211 can point you to local help for almost anything: bills, food, housing, health, family.",
    primary: R("211"),
    secondary: [R("samhsa"), T("unload")],
    next: [
      "Tell them what’s going on in your own words. They’ll suggest services near you.",
    ],
  },
};

/* Labels used on the results screen */
TW.VERIFY_LABEL = {
  owner: (d) => `Checked by The Weight on ${d}`,
  prototype: () => "Suggested addition: not yet checked by The Weight",
};
