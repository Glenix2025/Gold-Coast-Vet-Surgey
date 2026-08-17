/**
 * Official FAQ Knowledge Base for Gold Coast Vet Surgery
 * Surfers Paradise, Queensland, Australia
 */

export interface KnowledgeItem {
  id: string;
  topic: string;
  category: 'about' | 'hours' | 'booking' | 'emergency' | 'services' | 'puppy-kitten' | 'payment' | 'insurance' | 'facility';
  keywords: string[];
  summary: string;
  answer: string;
  actionButtons?: {
    label: string;
    url?: string;
    phone?: string;
    type: 'booking' | 'phone' | 'emergency' | 'directions' | 'email';
  }[];
}

export const CLINIC_INFO = {
  name: "Gold Coast Vet Surgery",
  tagline: "Where Pets are Family",
  purpose: "Our purpose is to maintain and improve the quality of life of pets and their human families.",
  phone: "(07) 5538 5909",
  phoneRaw: "tel:0755385909",
  email: "reception@goldcoastvet.com.au",
  address: "2800 Gold Coast Hwy, Surfers Paradise QLD 4217",
  mapsUrl: "https://maps.google.com/?q=2800+Gold+Coast+Hwy,+Surfers+Paradise+QLD+4217",
  bookingUrl: "https://app.cw.vet/hosted/au/goldcoastvet",
  hours: {
    weekdays: "Monday to Friday: 8:00am – 5:30pm",
    saturday: "Saturday: 8:30am – 12:00pm",
    sunday: "Closed Sundays & Public Holidays",
  },
  emergency: {
    provider: "Animal Emergency Service (AES)",
    phone: "(07) 5559 1599",
    phoneRaw: "tel:0755591599",
    address: "104 Eastlake St, Carrara Qld 4211",
    mapsUrl: "https://maps.google.com/?q=104+Eastlake+St,+Carrara+QLD+4211",
  },
  logoUrl: "https://goldcoastvet.com.au/wp-content/uploads/2018/01/logo.jpg",
};

export const FAQ_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'who-runs-clinic',
    topic: 'Who runs the clinic / Ownership',
    category: 'about',
    keywords: ['who runs', 'owners', 'owner', 'husband and wife', 'corporate', 'independent', 'family owned', 'chain', 'team'],
    summary: 'Independent, family owned & operated practice led by husband & wife vet team.',
    answer: "Gold Coast Vet Surgery is an independent, family owned and operated practice in Surfers Paradise, led by a dedicated husband and wife vet team. Because we're not part of a corporate chain, all treatment decisions are made with your pet's best interests at heart, never corporate policy.",
  },
  {
    id: 'opening-hours',
    topic: 'Opening Hours',
    category: 'hours',
    keywords: ['hours', 'open', 'opening times', 'opening hours', 'saturday', 'sunday', 'weekend', 'public holidays', 'closing'],
    summary: 'Mon–Fri 8:00am–5:30pm, Sat 8:30am–12:00pm. Closed Sundays & public holidays.',
    answer: "We are open Monday to Friday from 8:00am to 5:30pm, and Saturday from 8:30am to 12:00pm. We are closed on Sundays and public holidays. For any after-hours emergencies, please contact Animal Emergency Service.",
    actionButtons: [
      { label: "Book Appointment", url: CLINIC_INFO.bookingUrl, type: "booking" },
      { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'how-to-book',
    topic: 'How to Book an Appointment',
    category: 'booking',
    keywords: ['book', 'booking', 'appointment', 'schedule', 'make appointment', 'online booking', 'same day', 'consultation'],
    summary: 'Book online anytime or call. Same-day appointments available for critically ill pets.',
    answer: "You can book an appointment online anytime at our booking portal. If you can't find a suitable online slot or your pet is unwell, please call us directly on (07) 5538 5909 — same-day appointments are always made for critically ill animals.",
    actionButtons: [
      { label: "Book Online Now", url: CLINIC_INFO.bookingUrl, type: "booking" },
      { label: "Call Reception", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'after-hours-emergency',
    topic: 'After-Hours & Overnight Emergencies',
    category: 'emergency',
    keywords: ['emergency', 'after hours', 'after-hours', 'overnight', 'night', 'urgent', 'closed', 'weekend emergency', 'aes', 'carrara'],
    summary: 'Referred to Animal Emergency Service at 104 Eastlake St, Carrara — (07) 5559 1599.',
    answer: "Outside our standard opening hours, Gold Coast Vet Surgery refers emergencies directly to Animal Emergency Service (AES) on the Gold Coast. Please do not wait — call them immediately on (07) 5559 1599 or head to 104 Eastlake St, Carrara QLD 4211.",
    actionButtons: [
      { label: "Call AES: (07) 5559 1599", phone: CLINIC_INFO.emergency.phoneRaw, type: "emergency" },
      { label: "AES Directions (Carrara)", url: CLINIC_INFO.emergency.mapsUrl, type: "directions" }
    ]
  },
  {
    id: 'core-services',
    topic: 'Core Veterinary & Surgical Services',
    category: 'services',
    keywords: ['services', 'what do you do', 'vaccinations', 'vaccine', '3 year', 'triennial', 'desexing', 'microchipping', 'xray', 'x-ray', 'ultrasound', 'surgery', 'orthopaedic', 'cruciate', 'specialist surgeon'],
    summary: 'Consultations, emergency care, 3-yr vaccines, desexing, imaging, soft tissue & orthopaedic surgery.',
    answer: "Our core services include consultations, emergency treatment, triennial (3-year) vaccinations for dogs and cats, desexing, microchipping, digital X-rays, ultrasound, and soft tissue surgery. We also perform orthopaedic surgery and host a visiting specialist surgeon for advanced cases like cruciate surgery.",
    actionButtons: [
      { label: "Book Consultation", url: CLINIC_INFO.bookingUrl, type: "booking" }
    ]
  },
  {
    id: 'onsite-facilities',
    topic: 'On-site Clinic Facilities',
    category: 'facility',
    keywords: ['facilities', 'lab', 'laboratory', 'pharmacy', 'theatre', 'operating room', 'equipment', 'gp clinic', 'hospital'],
    summary: 'In-house lab, on-site pharmacy, and operating theatre all under one roof.',
    answer: "Our practice functions as both a general GP clinic and an emergency facility. We have a fully equipped in-house pathology laboratory, an on-site pharmacy, and a modern surgical operating theatre — all conveniently located under one roof.",
  },
  {
    id: 'dental-care',
    topic: 'Dental Care & Scaling',
    category: 'services',
    keywords: ['dental', 'teeth', 'scaling', 'polishing', 'extractions', 'dental xray', 'dental x-rays', 'bad breath', 'tartar'],
    summary: 'Dental scaling, polishing, extractions, and high-res digital dental X-rays on site.',
    answer: "We offer comprehensive on-site pet dental care, including ultrasonic scaling and polishing, extractions, and high-resolution digital dental X-rays to assess tooth root health below the gumline.",
    actionButtons: [
      { label: "Book Dental Check", url: CLINIC_INFO.bookingUrl, type: "booking" }
    ]
  },
  {
    id: 'free-puppy-kitten-check',
    topic: 'Free New Puppy & Kitten Health Check',
    category: 'puppy-kitten',
    keywords: ['puppy', 'kitten', 'free health check', 'new puppy', 'new kitten', 'first check', 'toilet training', 'biting'],
    summary: 'Free vet health check within your first week of bringing home a new puppy or kitten.',
    answer: "We offer a 100% FREE health check consultation with a vet within the first week of getting your new puppy or kitten! This includes a complete nose-to-tail physical exam plus advice on behaviour (biting, toilet training) and preventative care (vaccines, worming, fleas, ticks, heartworm). Call (07) 5538 5909 to book your free session.",
    actionButtons: [
      { label: "Call (07) 5538 5909 to Book Free Check", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'puppy-preschool',
    topic: 'Puppy Preschool Classes',
    category: 'puppy-kitten',
    keywords: ['puppy preschool', 'preschool', 'puppy school', 'training', 'socialisation', 'classes'],
    summary: 'Puppy preschool classes available — ask the clinic for the latest schedule.',
    answer: "Yes, we run Puppy Preschool classes to help your pup socialise safely and learn essential early manners! Please call or ask our friendly team at reception for the upcoming class schedule and enrollment.",
    actionButtons: [
      { label: "Inquire by Phone", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'parasite-prevention',
    topic: 'Parasite Prevention (Fleas, Ticks, Heartworm & Worms)',
    category: 'services',
    keywords: ['parasite', 'flea', 'fleas', 'tick', 'ticks', 'heartworm', 'injection', 'paralysis tick', 'worming', 'worms', 'intestinal worms'],
    summary: 'Complete flea, paralysis tick, heartworm (annual injection available) and intestinal worm control.',
    answer: "We provide complete parasite prevention plans, including flea and tick control, intestinal worming, and heartworm prevention (including convenient once-a-year heartworm injections). Our team can advise on the best product suited to your pet's lifestyle.",
    actionButtons: [
      { label: "Book a Consult", url: CLINIC_INFO.bookingUrl, type: "booking" }
    ]
  },
  {
    id: 'senior-pet-care',
    topic: 'Senior & Geriatric Pet Care',
    category: 'services',
    keywords: ['senior', 'geriatric', 'older dog', 'older cat', 'wellness screening', 'arthritis', 'aging', 'elderly'],
    summary: 'Senior checks, wellness screenings, and proactive care for aging pets.',
    answer: "We offer dedicated senior pet health checks, wellness blood screenings, and arthritis management to keep older dogs and cats comfortable, active, and happy throughout their golden years.",
    actionButtons: [
      { label: "Book Senior Health Check", url: CLINIC_INFO.bookingUrl, type: "booking" }
    ]
  },
  {
    id: 'weight-and-nutrition',
    topic: 'Weight Loss & Pet Nutrition',
    category: 'services',
    keywords: ['weight', 'nutrition', 'diet', 'obesity', 'food', 'weight loss program', 'overweight', 'free weight loss'],
    summary: 'Free weight loss program and complete nutrition advice.',
    answer: "We run a complimentary weight loss program along with tailored nutritional advice to help your pet achieve a healthy weight and sustain lifelong vitality. Feel free to contact our clinic to get started.",
  },
  {
    id: 'home-visits-and-behaviour',
    topic: 'Home Visits & Behaviour Consultations',
    category: 'services',
    keywords: ['home visit', 'house call', 'behaviour', 'behavior', 'anxiety', 'aggression', 'home visits'],
    summary: 'Home visits and dedicated behaviour advice available upon request.',
    answer: "Yes, both home visits and specialised pet behaviour consultations are available. Please call our clinic at (07) 5538 5909 to discuss arrangements and availability with our team.",
    actionButtons: [
      { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'specialist-referrals',
    topic: 'Specialist Referrals',
    category: 'services',
    keywords: ['referral', 'specialist', 'second opinion', 'specialist referrals', 'ophthalmology', 'oncology'],
    summary: 'Seamless referrals arranged for complex specialist care when required.',
    answer: "If your pet requires specialist-level diagnostics or treatments beyond our internal facilities, we work closely with top veterinary specialists across Queensland and will coordinate all referral arrangements for you.",
  },
  {
    id: 'grooming-polished-pets',
    topic: 'Onsite Grooming (Polished Pets)',
    category: 'services',
    keywords: ['grooming', 'wash', 'hydrobath', 'haircut', 'clip', 'polished pets', 'downstairs'],
    summary: 'Onsite grooming available at Polished Pets, right downstairs from our clinic.',
    answer: "Professional grooming is conveniently available at Polished Pets, located immediately downstairs from our clinic. You can easily combine a vet check-up with a grooming session!",
  },
  {
    id: 'payment-on-the-day',
    topic: 'Payment Policy',
    category: 'payment',
    keywords: ['payment', 'pay', 'billing', 'accounts', 'credit', 'deposit', 'discharge', 'when to pay'],
    summary: 'Payment required on the day of consult or discharge. No accounts/credit. Deposits required for surgery.',
    answer: "Full payment is required at the time of consultation or at discharge for admitted patients. We do not run accounts or extend credit. A deposit is required for major treatments and complex surgical admissions.",
  },
  {
    id: 'accepted-payment-methods',
    topic: 'Accepted Payment Methods',
    category: 'payment',
    keywords: ['payment methods', 'cash', 'card', 'eftpos', 'visa', 'mastercard', 'cheque', 'cheques', 'split payment'],
    summary: 'Cash, EFTPOS, VISA, Mastercard. Split payments accepted. Cheques not accepted.',
    answer: "We accept Cash, EFTPOS, VISA, and Mastercard. Cheques are not accepted. You are welcome to split payments across multiple methods (for instance, part cash and part card).",
  },
  {
    id: 'payment-plans',
    topic: 'Payment Plans (ZipMoney & VetPay)',
    category: 'payment',
    keywords: ['payment plan', 'payment plans', 'zipmoney', 'zip', 'vetpay', 'finance', 'installments', 'pay off', 'mediplan', 'interest free'],
    summary: 'ZipMoney Mediplan (6 months interest-free) and VetPay (6-12 months) available.',
    answer: "We offer two trusted payment plan options: ZipMoney Mediplan (6 months interest-free, no establishment fee under $1,000, zero deposit, quick digital approval) and VetPay (vet treatment finance spread over 6–12 months with a quick online approval after an initial deposit).",
    actionButtons: [
      { label: "Inquire with Reception", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'cost-estimates',
    topic: 'Cost Estimates & Quotes',
    category: 'payment',
    keywords: ['cost', 'price', 'quote', 'how much', 'fee', 'consult fee', 'surgery cost', 'estimate', 'pricing'],
    summary: 'Inclusive estimates given before treatment; no fixed quotes due to medical individuality.',
    answer: "Because every patient's medical needs are unique, we cannot provide fixed quotes over chat or phone. However, our vets will always provide an accurate, transparent estimate before beginning any treatment, and we keep you closely updated on costs for any hospitalised pet.",
    actionButtons: [
      { label: "Book a Consult for an Estimate", url: CLINIC_INFO.bookingUrl, type: "booking" },
      { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'pet-insurance',
    topic: 'Pet Insurance & Direct E-Claims',
    category: 'insurance',
    keywords: ['insurance', 'pet insurance', 'claim', 'claims', 'e-claim', 'eclaim', 'gaponly', 'reimbursement', 'policy'],
    summary: 'Direct e-claims processing for most Australian pet insurers; no paperwork needed.',
    answer: "We strongly advocate for pet insurance and are completely independent (receiving zero insurer commissions). We can process direct e-claims through our practice software for most Australian pet insurers — no manual claim forms needed in most cases! Just bring your policy number, and our team will lodge it for you at no charge.",
    actionButtons: [
      { label: "Call with Policy Questions", phone: CLINIC_INFO.phoneRaw, type: "phone" }
    ]
  },
  {
    id: 'community-involvement',
    topic: 'Community & Wildlife Care',
    category: 'about',
    keywords: ['community', 'wildlife', 'charity', 'possum', 'bird', 'native animal', 'free wildlife'],
    summary: 'Free treatment for local injured wildlife and active community sponsorship.',
    answer: "We are proud supporters of our local community: we treat injured native wildlife free of charge and regularly sponsor local community initiatives and charities.",
  },
  {
    id: 'staff-quality',
    topic: 'Staff Experience & Qualifications',
    category: 'about',
    keywords: ['staff', 'vets', 'nurses', 'qualifications', 'experience', 'junior vets', 'trainee'],
    summary: '100% fully qualified and experienced veterinarians and veterinary nurses.',
    answer: "Every member of our team is fully qualified and experienced — we do not use junior vets or trainee nurses. Your pet will always be attended to by seasoned veterinary professionals.",
  },
  {
    id: 'parking-location',
    topic: 'Parking & Accessibility',
    category: 'facility',
    keywords: ['parking', 'park', 'undercover', 'off-street', 'car park', 'where to park', 'access'],
    summary: 'Free undercover off-street parking available on site.',
    answer: "We provide convenient off-street undercover parking directly at our clinic at 2800 Gold Coast Hwy in Surfers Paradise, making visits safe and weather-proof for you and your pet.",
    actionButtons: [
      { label: "Get Driving Directions", url: CLINIC_INFO.mapsUrl, type: "directions" }
    ]
  },
  {
    id: 'hospital-accreditation',
    topic: 'Hospital of Excellence Accreditation',
    category: 'about',
    keywords: ['accreditation', 'accredited', 'hospital of excellence', 'standards', 'quality assurance'],
    summary: 'Proudly accredited as an Australian Hospital of Excellence.',
    answer: "Gold Coast Vet Surgery is an Accredited Hospital of Excellence, which provides independent assurance that our facilities, staff qualifications, and clinical standards meet the highest benchmarks in the veterinary industry.",
  },
];

export const SUGGESTED_QUESTIONS = [
  "What are your opening hours?",
  "How do I book an appointment?",
  "What should I do in an after-hours emergency?",
  "Tell me about the free puppy/kitten health check",
  "Do you offer payment plans like ZipMoney or VetPay?",
  "How does pet insurance and direct e-claiming work?",
  "What surgical & diagnostic services do you provide?",
  "Where can I park when visiting the clinic?",
];

export const SYSTEM_PROMPT = `
You are the official website assistant for Gold Coast Vet Surgery, an independent, family owned and operated vet practice in Surfers Paradise, Queensland, Australia, led by a husband and wife vet team.

CRITICAL INSTRUCTIONS & BOUNDARIES:
1. Grounding: Answer ONLY from the provided FAQ knowledge base below. Do not assume or extrapolate facts not in this knowledge base.
2. Tone: Warm, personal, professional, family-run — not corporate. Keep answers concise (2 to 4 sentences) unless a bulleted list is necessary for clarity.
3. Pricing & Diagnosis:
   - If asked for a medical diagnosis, clinical treatment advice, or anything urgent, state warmly that you cannot advise on medical specifics over chat and prompt them to call (07) 5538 5909.
   - NEVER invent or state specific monetary prices. The clinic provides transparent, tailored estimates during consultation. Direct pricing inquiries to a phone call or booking.
4. Booking:
   - Always mention the online booking portal: https://app.cw.vet/hosted/au/goldcoastvet
   - Mention that same-day appointments are always made for critically ill animals, and if no online slot is available, they should call (07) 5538 5909.
5. After-Hours Emergency:
   - If asked about emergencies outside Mon-Fri 8am-5:30pm or Sat 8:30am-12pm, inform them that Gold Coast Vet Surgery refers after-hours emergencies to Animal Emergency Service (AES), (07) 5559 1599, located at 104 Eastlake St, Carrara QLD 4211. Tell them to call AES directly rather than wait.
6. Core Identity:
   - Independent & family owned (husband & wife vet team). Not a corporate chain.
   - Purpose: "Our purpose is to maintain and improve the quality of life of pets and their human families."
   - Accredited Hospital of Excellence. Staffed only by fully qualified, experienced vets and nurses (no junior vets or trainee nurses).

KNOWLEDGE BASE:
${FAQ_KNOWLEDGE_BASE.map(item => `[${item.id}] ${item.topic}: ${item.answer}`).join('\n\n')}
`;
