import { CLINIC_INFO, FAQ_KNOWLEDGE_BASE, KnowledgeItem, SYSTEM_PROMPT } from '../knowledgeBase';
import { Message } from '../types';

interface ChatResponse {
  text: string;
  actionButtons?: Message['actionButtons'];
  topicTag?: string;
  isEmergencyAlert?: boolean;
}

/**
 * Main chat handler:
 * 1. Checks server-side `/api/chat` (Express dev/prod server)
 * 2. Checks client-side Gemini if VITE_GEMINI_API_KEY or localStorage key exists
 * 3. Falls back to our advanced conversational semantic knowledge engine (100% offline on GitHub Pages)
 */
export async function sendMessageToAssistant(
  userQuery: string,
  chatHistory: Message[]
): Promise<ChatResponse> {
  const trimmed = userQuery.trim();
  if (!trimmed) {
    return {
      text: "Hello! How can I help you and your pet today at Gold Coast Vet Surgery?",
      topicTag: "Welcome",
    };
  }

  // 1. Try server-side endpoint if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        const actionButtons = extractContextualButtons(trimmed, data.reply);
        const isEmergency = detectEmergencyIntent(trimmed, data.reply);
        return {
          text: data.reply,
          actionButtons: actionButtons.length > 0 ? actionButtons : undefined,
          isEmergencyAlert: isEmergency,
        };
      }
    }
  } catch (_e) {
    // Static hosting like GitHub Pages will fail /api/chat gracefully
  }

  // 2. High-precision semantic & conversational knowledge engine
  return generateIntelligentGroundedResponse(trimmed, chatHistory);
}

/**
 * Generates natural, conversational, grounded responses directly in browser (ideal for GitHub Pages)
 */
export function generateIntelligentGroundedResponse(
  userQuery: string,
  _history: Message[] = []
): ChatResponse {
  const q = userQuery.toLowerCase().trim();
  const cleanQ = q.replace(/[^\w\s]/g, ' ');

  // 1. GREETINGS / SMALL TALK
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|gday|g'day|yo)\b/i.test(q) &&
    q.length < 30
  ) {
    return {
      text: `Hello and welcome to Gold Coast Vet Surgery! 🐾\n\nWe are an independent, family-owned practice in Surfers Paradise led by a dedicated husband & wife vet team. How can we help you and your pet today?\n\nYou can ask about our opening hours, free new puppy/kitten health checks, our core surgical & diagnostic services, payment plans (ZipMoney / VetPay), direct pet insurance e-claims, or how to book an appointment.`,
      topicTag: "Welcome",
      actionButtons: [
        { label: "Book Appointment Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "View Opening Hours", url: CLINIC_INFO.mapsUrl, type: "directions" },
      ],
    };
  }

  // 2. THANKS / POLITE CLOSINGS
  if (/^(thank you|thanks|cheers|awesome thanks|thank you so much|ta)\b/i.test(q)) {
    return {
      text: "You're very welcome! Please feel free to ask any other questions about our clinic, services, or care for your pet. Our team at Gold Coast Vet Surgery is always here to help! 🐾",
      topicTag: "Assistance",
      actionButtons: [
        { label: "Book Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "Call Clinic: (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 3. EMERGENCY & AFTER-HOURS
  if (
    detectEmergencyIntent(q) ||
    cleanQ.includes('dying') ||
    cleanQ.includes('poison') ||
    cleanQ.includes('chocolate') ||
    cleanQ.includes('hit by car') ||
    cleanQ.includes('bleeding heavily') ||
    cleanQ.includes('seizure') ||
    cleanQ.includes('snake bite') ||
    cleanQ.includes('tick paralysis') ||
    cleanQ.includes('unconscious') ||
    cleanQ.includes('choking') ||
    cleanQ.includes('overnight') ||
    cleanQ.includes('midnight') ||
    cleanQ.includes('sunday emergency') ||
    cleanQ.includes('after hours') ||
    cleanQ.includes('afterhours')
  ) {
    return {
      text: `🚨 **EMERGENCY ASSISTANCE:**\n\n- **During Clinic Hours (Mon–Fri 8am–5:30pm, Sat 8:30am–12pm):**\nPlease call our Surfers Paradise clinic immediately on **(07) 5538 5909** so we can prepare for your arrival.\n\n- **After-Hours & Overnight Emergencies:**\nGold Coast Vet Surgery refers all after-hours and overnight emergencies directly to **Animal Emergency Service (AES)** on the Gold Coast. Please do not wait — call AES immediately on **(07) 5559 1599** or proceed directly to **104 Eastlake St, Carrara QLD 4211**.`,
      isEmergencyAlert: true,
      topicTag: "After-Hours Emergency",
      actionButtons: [
        { label: "🚨 Call AES Carrara: (07) 5559 1599", phone: CLINIC_INFO.emergency.phoneRaw, type: "emergency" },
        { label: "📍 AES Carrara Directions", url: CLINIC_INFO.emergency.mapsUrl, type: "directions" },
        { label: "📞 Call Clinic: (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 4. PRICING / FIXED QUOTES GUARDRAIL (Never invent prices)
  if (
    cleanQ.includes('how much') ||
    cleanQ.includes('price') ||
    cleanQ.includes('pricing') ||
    cleanQ.includes('cost') ||
    cleanQ.includes('costs') ||
    cleanQ.includes('fee') ||
    cleanQ.includes('fees') ||
    cleanQ.includes('quote') ||
    cleanQ.includes('rates') ||
    cleanQ.includes('expensive') ||
    cleanQ.includes('cheap') ||
    cleanQ.includes('how much is desexing') ||
    cleanQ.includes('consultation fee')
  ) {
    return {
      text: `Because every pet's medical and anatomical needs are unique, Gold Coast Vet Surgery does not provide fixed price quotes over chat or telephone.\n\n**Our Estimate Policy:**\n• Our veterinarians will always provide an accurate, transparent, and itemised estimate **during your consultation** prior to starting any treatment.\n• For hospitalised pets, our team keeps you closely updated if any unexpected care is required.\n• We offer flexible payment plans (ZipMoney Mediplan & VetPay) and process direct pet insurance e-claims on the spot.\n\nPlease call our friendly team on **(07) 5538 5909** or book a consultation online to receive a tailored estimate for your pet.`,
      topicTag: "Cost Estimates & Pricing",
      actionButtons: [
        { label: "📅 Book Consult for Estimate", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 5. SPECIFIC MEDICAL DIAGNOSIS / DRUG DOSING INQUIRY
  if (
    cleanQ.includes('diagnos') ||
    cleanQ.includes('what medicine') ||
    cleanQ.includes('paracetamol') ||
    cleanQ.includes('panadol') ||
    cleanQ.includes('ibuprofen') ||
    cleanQ.includes('what dosage') ||
    cleanQ.includes('mg dose') ||
    cleanQ.includes('why is my dog coughing') ||
    cleanQ.includes('why is my cat vomiting')
  ) {
    return {
      text: `For your pet's safety, our team cannot provide medical diagnoses or prescribe drug dosages over chat. Giving human medications can be toxic or fatal to pets.\n\nIf your pet is unwell, experiencing discomfort, or showing unusual symptoms, please call our clinic right away on **(07) 5538 5909** or book an appointment online so our veterinary team can conduct a proper examination.`,
      topicTag: "Medical Inquiries",
      actionButtons: [
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "📅 Book an Appointment", url: CLINIC_INFO.bookingUrl, type: "booking" },
      ],
    };
  }

  // 6. FREE PUPPY & KITTEN HEALTH CHECK
  if (
    (cleanQ.includes('puppy') || cleanQ.includes('kitten') || cleanQ.includes('pup') || cleanQ.includes('new pet')) &&
    (cleanQ.includes('free') || cleanQ.includes('health check') || cleanQ.includes('first week') || cleanQ.includes('nose to tail') || cleanQ.includes('exam') || cleanQ.includes('checkup') || cleanQ.includes('check up') || cleanQ.includes('biting') || cleanQ.includes('toilet training'))
  ) {
    return {
      text: `🎉 **100% Free New Puppy & Kitten Health Check!**\n\nIf you have welcomed a new puppy or kitten into your family, we offer a **free comprehensive health consultation** with a vet within your first week of bringing them home.\n\n**What's included:**\n• Full nose-to-tail physical examination (eyes, ears, heart, teeth, joints, coat).\n• Behavioural guidance on puppy biting, toilet training, and crate training.\n• Personalised preventative healthcare advice (vaccinations, parasite protection, microchipping, and nutrition).\n\nPlease call us on **(07) 5538 5909** to reserve your free puppy or kitten check!`,
      topicTag: "Free Puppy/Kitten Health Check",
      actionButtons: [
        { label: "📞 Call (07) 5538 5909 to Book Free Check", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "📅 Book Consultation Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
      ],
    };
  }

  // 7. PUPPY PRESCHOOL / CLASSES
  if (
    cleanQ.includes('puppy school') ||
    cleanQ.includes('puppy preschool') ||
    cleanQ.includes('training class') ||
    cleanQ.includes('socialis') ||
    cleanQ.includes('socializ')
  ) {
    return {
      text: `🐶 **Puppy Preschool Classes at Gold Coast Vet Surgery:**\n\nYes! We run Puppy Preschool classes to help your young pup socialise safely, build confidence around other dogs and people, and learn essential good manners in a controlled veterinary setting.\n\nClasses fill up quickly, so please give our reception a call on **(07) 5538 5909** to check the upcoming schedule and reserve a spot for your puppy.`,
      topicTag: "Puppy Preschool",
      actionButtons: [
        { label: "📞 Call Reception: (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 8. HOW TO BOOK / APPOINTMENTS / SAME DAY
  if (
    cleanQ.includes('book') ||
    cleanQ.includes('booking') ||
    cleanQ.includes('appointment') ||
    cleanQ.includes('schedule') ||
    cleanQ.includes('same day') ||
    cleanQ.includes('urgent appointment') ||
    cleanQ.includes('see a vet')
  ) {
    return {
      text: `📅 **Booking an Appointment:**\n\n• **Online 24/7:** You can book an appointment online anytime via our secure booking portal: [app.cw.vet/hosted/au/goldcoastvet](${CLINIC_INFO.bookingUrl})\n• **By Phone:** If you can't find a suitable time online, or if your pet is unwell, call us directly on **(07) 5538 5909**.\n• **Critically Ill Pets:** Same-day emergency consultations are **always prioritised** for critically ill animals.`,
      topicTag: "How to Book",
      actionButtons: [
        { label: "📅 Book Online Now", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 9. OPENING HOURS & DAYS
  if (
    cleanQ.includes('hour') ||
    cleanQ.includes('hours') ||
    cleanQ.includes('opening time') ||
    cleanQ.includes('open') ||
    cleanQ.includes('close') ||
    cleanQ.includes('closing') ||
    cleanQ.includes('saturday') ||
    cleanQ.includes('sunday') ||
    cleanQ.includes('weekend') ||
    cleanQ.includes('public holiday') ||
    cleanQ.includes('trading')
  ) {
    return {
      text: `⏰ **Clinic Opening Hours:**\n\n• **Monday – Friday:** 8:00am – 5:30pm\n• **Saturday:** 8:30am – 12:00pm\n• **Sunday & Public Holidays:** Closed\n\n*For any emergencies outside these hours, please contact Animal Emergency Service (AES) Carrara immediately on (07) 5559 1599.*`,
      topicTag: "Opening Hours",
      actionButtons: [
        { label: "📅 Book Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "📍 View Address & Map", url: CLINIC_INFO.mapsUrl, type: "directions" },
      ],
    };
  }

  // 10. PAYMENT PLANS (ZipMoney & VetPay)
  if (
    cleanQ.includes('zip') ||
    cleanQ.includes('zipmoney') ||
    cleanQ.includes('zippay') ||
    cleanQ.includes('vetpay') ||
    cleanQ.includes('payment plan') ||
    cleanQ.includes('finance') ||
    cleanQ.includes('installment') ||
    cleanQ.includes('pay off') ||
    cleanQ.includes('mediplan') ||
    cleanQ.includes('interest free')
  ) {
    return {
      text: `💳 **Payment Plans at Gold Coast Vet Surgery:**\n\nWe offer two trusted third-party payment plan options so you can manage veterinary care with ease:\n\n1. **ZipMoney Mediplan:**\n• **6 months interest-free**\n• No establishment fee for amounts under $1,000\n• 0% deposit with fast digital application\n\n2. **VetPay:**\n• Spreads treatment costs over **6 to 12 months**\n• Quick online approval with a small initial deposit on the day\n\nOur team can help you set these up during your visit.`,
      topicTag: "Payment Plans",
      actionButtons: [
        { label: "📞 Call Reception for Details", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "📅 Book Appointment", url: CLINIC_INFO.bookingUrl, type: "booking" },
      ],
    };
  }

  // 11. PAYMENT POLICY & ACCEPTED METHODS (Cash, Card, Cheques, Split)
  if (
    cleanQ.includes('payment') ||
    cleanQ.includes('pay') ||
    cleanQ.includes('cash') ||
    cleanQ.includes('card') ||
    cleanQ.includes('eftpos') ||
    cleanQ.includes('visa') ||
    cleanQ.includes('mastercard') ||
    cleanQ.includes('cheque') ||
    cleanQ.includes('cheques') ||
    cleanQ.includes('split payment') ||
    cleanQ.includes('credit account')
  ) {
    return {
      text: `💳 **Payment Policy & Accepted Methods:**\n\n• **When Payment is Due:** Full payment is required at the time of consultation or upon patient discharge. We do not run accounts or extend credit.\n• **Deposits:** Required for surgical admissions and major inpatient hospitalisations.\n• **Accepted Methods:** Cash, EFTPOS, VISA, and Mastercard.\n• **Split Payments:** Yes! You are welcome to split payments across multiple methods (e.g. part cash, part card).\n• **Cheques:** We **do not** accept cheques.`,
      topicTag: "Payment Methods",
      actionButtons: [
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 12. PET INSURANCE & DIRECT E-CLAIMS
  if (
    cleanQ.includes('insurance') ||
    cleanQ.includes('pet insurance') ||
    cleanQ.includes('eclaim') ||
    cleanQ.includes('e-claim') ||
    cleanQ.includes('gaponly') ||
    cleanQ.includes('claim') ||
    cleanQ.includes('policy') ||
    cleanQ.includes('pet cover')
  ) {
    return {
      text: `🛡️ **Pet Insurance & Direct E-Claims:**\n\n• **Direct Software E-Claims:** We can lodge direct electronic insurance claims on the spot through our practice software for most major Australian pet insurance providers — **no manual paperwork or physical forms required**!\n• **Free Lodgement:** Bring your pet insurance policy number to your appointment, and our reception team will lodge your claim free of charge.\n• **Independent:** We receive zero commissions from insurers and provide 100% unbiased veterinary advocacy.`,
      topicTag: "Pet Insurance",
      actionButtons: [
        { label: "📞 Call with Policy Questions", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "📅 Book Consultation", url: CLINIC_INFO.bookingUrl, type: "booking" },
      ],
    };
  }

  // 13. PARKING & LOCATION & DIRECTIONS
  if (
    cleanQ.includes('park') ||
    cleanQ.includes('parking') ||
    cleanQ.includes('undercover') ||
    cleanQ.includes('car park') ||
    cleanQ.includes('where are you') ||
    cleanQ.includes('address') ||
    cleanQ.includes('location') ||
    cleanQ.includes('directions') ||
    cleanQ.includes('surfers paradise') ||
    cleanQ.includes('gold coast hwy')
  ) {
    return {
      text: `🚗 **Location & Free Undercover Parking:**\n\n• **Address:** 2800 Gold Coast Hwy, Surfers Paradise QLD 4217\n• **Parking:** We provide **free off-street undercover parking** directly at our clinic, making your visit comfortable, weather-proof, and safe for your pet when arriving or departing.\n• **Grooming:** Polished Pets grooming is located directly downstairs.`,
      topicTag: "Location & Parking",
      actionButtons: [
        { label: "📍 View on Google Maps", url: CLINIC_INFO.mapsUrl, type: "directions" },
        { label: "📞 Call Clinic: (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 14. SERVICES (VACCINATIONS, 3-YEAR VACCINES, SURGERY, DESEXING, MICROCHIP)
  if (
    cleanQ.includes('vaccin') ||
    cleanQ.includes('3 year') ||
    cleanQ.includes('triennial') ||
    cleanQ.includes('desex') ||
    cleanQ.includes('spey') ||
    cleanQ.includes('spay') ||
    cleanQ.includes('castrat') ||
    cleanQ.includes('neuter') ||
    cleanQ.includes('microchip') ||
    cleanQ.includes('surgery') ||
    cleanQ.includes('orthopaedic') ||
    cleanQ.includes('cruciate') ||
    cleanQ.includes('xray') ||
    cleanQ.includes('x-ray') ||
    cleanQ.includes('ultrasound') ||
    cleanQ.includes('services')
  ) {
    return {
      text: `🏥 **Our Core Veterinary & Surgical Services:**\n\n• **Preventative:** Triennial (3-year) vaccinations for dogs & cats, desexing, and microchipping.\n• **Diagnostics:** In-house pathology lab, high-resolution digital X-rays, and ultrasound.\n• **Surgery:** Soft tissue surgery and advanced orthopaedics (including a visiting specialist surgeon for complex cruciate/joint surgeries).\n• **Dental Suite:** Ultrasonic scaling, polishing, tooth extractions, and high-res digital dental X-rays.\n• **Facilities:** Operating theatre, on-site pharmacy, and hospital ward all under one roof.`,
      topicTag: "Veterinary Services",
      actionButtons: [
        { label: "📅 Book Consultation", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 15. DENTAL CARE & DENTAL X-RAYS
  if (
    cleanQ.includes('dental') ||
    cleanQ.includes('teeth') ||
    cleanQ.includes('scale') ||
    cleanQ.includes('scaling') ||
    cleanQ.includes('polish') ||
    cleanQ.includes('bad breath') ||
    cleanQ.includes('tartar') ||
    cleanQ.includes('gum') ||
    cleanQ.includes('tooth') ||
    cleanQ.includes('extractions')
  ) {
    return {
      text: `🦷 **Comprehensive On-Site Pet Dental Care:**\n\nWe provide professional veterinary dental care including:\n• Ultrasonic dental scaling & enamel polishing\n• Advanced surgical extractions when necessary\n• High-resolution digital dental X-rays to assess hidden disease under the gumline\n\nDental health is vital to your pet's longevity and comfort. Book an oral check-up with our vets to assess your pet's teeth.`,
      topicTag: "Dental Care",
      actionButtons: [
        { label: "📅 Book Dental Consultation", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 16. PARASITES (FLEAS, TICKS, HEARTWORM, WORMS)
  if (
    cleanQ.includes('flea') ||
    cleanQ.includes('fleas') ||
    cleanQ.includes('tick') ||
    cleanQ.includes('ticks') ||
    cleanQ.includes('heartworm') ||
    cleanQ.includes('worm') ||
    cleanQ.includes('worming') ||
    cleanQ.includes('parasite')
  ) {
    return {
      text: `🛡️ **Parasite Protection & Prevention:**\n\nQueensland's warm climate makes year-round parasite protection critical:\n• **Paralysis Ticks & Fleas:** Tailored top-spot and oral chews suited to your pet's weight.\n• **Heartworm:** Convenient annual heartworm preventative injections (SR12) or monthly preventatives.\n• **Intestinal Worms:** Comprehensive all-wormer treatments.\n\nAsk our veterinary team at your next visit for a tailored protection program.`,
      topicTag: "Parasite Prevention",
      actionButtons: [
        { label: "📅 Book Consult", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 17. SENIOR PETS, WEIGHT LOSS & NUTRITION
  if (
    cleanQ.includes('senior') ||
    cleanQ.includes('geriatric') ||
    cleanQ.includes('old dog') ||
    cleanQ.includes('old cat') ||
    cleanQ.includes('arthritis') ||
    cleanQ.includes('weight') ||
    cleanQ.includes('diet') ||
    cleanQ.includes('nutrition') ||
    cleanQ.includes('obese') ||
    cleanQ.includes('fat')
  ) {
    return {
      text: `🐾 **Senior Care & Complimentary Weight Management:**\n\n• **Senior Pet Wellness:** Comprehensive health checks, proactive blood screenings, and gentle arthritis management plans to keep aging pets active and comfortable.\n• **Free Weight Loss Program:** We run a **complimentary pet weight loss program** with custom nutritional advice and ongoing weight checks.\n\nCall our clinic or book online to support your pet's lifelong vitality!`,
      topicTag: "Senior Care & Nutrition",
      actionButtons: [
        { label: "📅 Book Appointment", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 18. GROOMING (POLISHED PETS)
  if (
    cleanQ.includes('groom') ||
    cleanQ.includes('grooming') ||
    cleanQ.includes('wash') ||
    cleanQ.includes('hydrobath') ||
    cleanQ.includes('clip') ||
    cleanQ.includes('haircut') ||
    cleanQ.includes('polished pets')
  ) {
    return {
      text: `✂️ **Onsite Grooming at Polished Pets:**\n\nProfessional dog grooming and hydrobathing are conveniently available right downstairs at **Polished Pets** (2800 Gold Coast Hwy).\n\nYou can easily combine a veterinary health check upstairs with a grooming session downstairs! Contact Polished Pets or ask our reception team when booking.`,
      topicTag: "Onsite Grooming",
      actionButtons: [
        { label: "📞 Call Clinic Reception", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "📍 View Location", url: CLINIC_INFO.mapsUrl, type: "directions" },
      ],
    };
  }

  // 19. ABOUT US / OWNERSHIP / ACCREDITATION / STAFF
  if (
    cleanQ.includes('who are you') ||
    cleanQ.includes('who runs') ||
    cleanQ.includes('owners') ||
    cleanQ.includes('owner') ||
    cleanQ.includes('family') ||
    cleanQ.includes('corporate') ||
    cleanQ.includes('independent') ||
    cleanQ.includes('husband') ||
    cleanQ.includes('wife') ||
    cleanQ.includes('accredit') ||
    cleanQ.includes('excellence') ||
    cleanQ.includes('qualif') ||
    cleanQ.includes('staff') ||
    cleanQ.includes('vets')
  ) {
    return {
      text: `💙 **About Gold Coast Vet Surgery:**\n\n• **Independent & Family-Owned:** Led by a dedicated husband & wife vet team in Surfers Paradise. We are not part of any corporate chain, meaning every clinical decision is made purely in your pet's best interest.\n• **Accredited Hospital of Excellence:** Recognised for meeting the highest industry benchmarks in veterinary equipment, hygiene, and standards.\n• **Qualified Professionals Only:** All our veterinarians and veterinary nurses are fully qualified and experienced — we do not use junior trainee vets.\n• **Our Purpose:** *"To maintain and improve the quality of life of pets and their human families."*`,
      topicTag: "About Our Clinic",
      actionButtons: [
        { label: "📅 Book Appointment", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 20. HOME VISITS & BEHAVIOUR
  if (
    cleanQ.includes('home visit') ||
    cleanQ.includes('house call') ||
    cleanQ.includes('behaviour') ||
    cleanQ.includes('behavior') ||
    cleanQ.includes('anxiety') ||
    cleanQ.includes('aggression')
  ) {
    return {
      text: `🏡 **Home Visits & Behaviour Consultations:**\n\nYes! We provide both **home visits** (for pets who struggle with car travel or stress) and specialized **pet behaviour consultations** (for anxiety, fear, or aggression).\n\nPlease call our friendly team on **(07) 5538 5909** to discuss arrangements and book a home visit or behavioural assessment.`,
      topicTag: "Home Visits & Behaviour",
      actionButtons: [
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 21. WILDLIFE & COMMUNITY
  if (
    cleanQ.includes('wildlife') ||
    cleanQ.includes('possum') ||
    cleanQ.includes('bird') ||
    cleanQ.includes('native') ||
    cleanQ.includes('community')
  ) {
    return {
      text: `🌿 **Community & Native Wildlife Care:**\n\nWe are proud supporters of our Gold Coast community. We treat injured native Australian wildlife (possums, birds, reptiles) **free of charge** and actively sponsor local charity events.\n\nIf you have found an injured wild animal, please bring them to our clinic during opening hours or contact our team on **(07) 5538 5909**.`,
      topicTag: "Wildlife & Community",
      actionButtons: [
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "📍 Driving Directions", url: CLINIC_INFO.mapsUrl, type: "directions" },
      ],
    };
  }

  // 22. SMART FUZZY SCORER ACROSS ALL 24 FAQ ITEMS
  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;

  const queryWords = cleanQ.split(/\s+/).filter(w => w.length > 2);

  for (const item of FAQ_KNOWLEDGE_BASE) {
    let score = 0;
    const itemText = `${item.topic} ${item.summary} ${item.answer} ${item.keywords.join(' ')}`.toLowerCase();

    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (cleanQ.includes(kwLower)) {
        score += kwLower.length * 3;
      }
    }

    for (const word of queryWords) {
      if (itemText.includes(word)) {
        score += word.length;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 6) {
    return {
      text: `**${bestMatch.topic}:**\n\n${bestMatch.answer}`,
      topicTag: bestMatch.topic,
      actionButtons: bestMatch.actionButtons && bestMatch.actionButtons.length > 0 ? bestMatch.actionButtons : [
        { label: "📅 Book Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 23. COMPREHENSIVE HELPFUL DEFAULT WITH QUICK TOPICS
  return {
    text: `At **Gold Coast Vet Surgery**, our purpose is to maintain and improve the quality of life of pets and their human families. 🐾\n\nI can assist you with:\n• **Booking & Hours:** Mon–Fri 8am–5:30pm, Sat 8:30am–12pm (same-day emergency slots)\n• **Free Puppy & Kitten Health Checks:** 100% free within your first week!\n• **Veterinary Services:** 3-year vaccines, dental care, digital X-rays, ultrasound, soft tissue & specialist orthopaedics\n• **Payment Plans:** ZipMoney (6 months interest-free) & VetPay\n• **Pet Insurance:** Direct software e-claims processed on the spot\n• **After-Hours Emergency:** Direct referral to AES Carrara on (07) 5559 1599\n\nWhat would you like to know more about? You can also call us anytime on **(07) 5538 5909**!`,
    topicTag: "General Inquiries",
    actionButtons: [
      { label: "📅 Book Appointment Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
      { label: "📞 Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      { label: "📍 View Hours & Parking", url: CLINIC_INFO.mapsUrl, type: "directions" },
    ],
  };
}

function detectEmergencyIntent(query: string, replyText: string = ''): boolean {
  const emergencyKeywords = [
    'emergency',
    'urgent',
    'after-hours',
    'after hours',
    'dying',
    'poison',
    'carrara',
    'aes',
    'overnight',
    '5559 1599',
    'snake bite',
    'hit by car',
  ];
  const combined = `${query} ${replyText}`.toLowerCase();
  return emergencyKeywords.some(kw => combined.includes(kw));
}

function extractContextualButtons(query: string, reply: string): Message['actionButtons'] {
  const buttons: NonNullable<Message['actionButtons']> = [];
  const text = `${query} ${reply}`.toLowerCase();

  if (text.includes('emergency') || text.includes('after hours') || text.includes('5559 1599') || text.includes('carrara')) {
    buttons.push({
      label: '🚨 Call AES: (07) 5559 1599',
      phone: CLINIC_INFO.emergency.phoneRaw,
      type: 'emergency',
    });
    buttons.push({
      label: '📍 AES Directions (Carrara)',
      url: CLINIC_INFO.emergency.mapsUrl,
      type: 'directions',
    });
    return buttons;
  }

  if (text.includes('book') || text.includes('appointment') || text.includes('consultation')) {
    buttons.push({
      label: '📅 Book Online Now',
      url: CLINIC_INFO.bookingUrl,
      type: 'booking',
    });
  }

  if (text.includes('call') || text.includes('phone') || text.includes('5538 5909') || text.includes('puppy') || text.includes('kitten')) {
    buttons.push({
      label: '📞 Call (07) 5538 5909',
      phone: CLINIC_INFO.phoneRaw,
      type: 'phone',
    });
  }

  if (text.includes('parking') || text.includes('direction') || text.includes('where') || text.includes('address') || text.includes('location')) {
    buttons.push({
      label: '📍 View on Google Maps',
      url: CLINIC_INFO.mapsUrl,
      type: 'directions',
    });
  }

  return buttons;
}
