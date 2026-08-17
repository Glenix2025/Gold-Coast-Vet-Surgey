import { CLINIC_INFO, FAQ_KNOWLEDGE_BASE, KnowledgeItem } from '../knowledgeBase';
import { Message } from '../types';

interface ChatResponse {
  text: string;
  actionButtons?: Message['actionButtons'];
  topicTag?: string;
  isEmergencyAlert?: boolean;
}

export async function sendMessageToAssistant(
  userQuery: string,
  _chatHistory: Message[]
): Promise<ChatResponse> {
  const normalizedQuery = userQuery.toLowerCase().trim();

  // Try calling the server-side Gemini API endpoint
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userQuery }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        // Derive action buttons contextually from the reply or query
        const actionButtons = extractActionButtons(normalizedQuery, data.reply);
        const isEmergency = isEmergencyQuery(normalizedQuery, data.reply);
        return {
          text: data.reply,
          actionButtons: actionButtons.length > 0 ? actionButtons : undefined,
          isEmergencyAlert: isEmergency,
        };
      }
    }
  } catch (_err) {
    // Graceful fallback to deterministic local knowledge engine
  }

  // Fallback to grounded local knowledge base matcher
  return getLocalGroundedResponse(userQuery);
}

function isEmergencyQuery(query: string, replyText: string): boolean {
  const emergencyKeywords = ['emergency', 'urgent', 'after-hours', 'after hours', 'dying', 'poison', 'carrara', 'aes', 'overnight'];
  const textToCheck = `${query} ${replyText}`.toLowerCase();
  return emergencyKeywords.some(kw => textToCheck.includes(kw));
}

function extractActionButtons(query: string, reply: string): Message['actionButtons'] {
  const buttons: NonNullable<Message['actionButtons']> = [];
  const text = `${query} ${reply}`.toLowerCase();

  if (text.includes('emergency') || text.includes('after hours') || text.includes('5559 1599') || text.includes('carrara')) {
    buttons.push({
      label: 'Call AES Carrara: (07) 5559 1599',
      phone: CLINIC_INFO.emergency.phoneRaw,
      type: 'emergency',
    });
    buttons.push({
      label: 'AES Directions',
      url: CLINIC_INFO.emergency.mapsUrl,
      type: 'directions',
    });
    return buttons;
  }

  if (text.includes('book') || text.includes('appointment') || text.includes('consultation') || text.includes('app.cw.vet')) {
    buttons.push({
      label: 'Book Online Now',
      url: CLINIC_INFO.bookingUrl,
      type: 'booking',
    });
  }

  if (text.includes('call') || text.includes('phone') || text.includes('5538 5909') || text.includes('puppy') || text.includes('kitten')) {
    buttons.push({
      label: 'Call (07) 5538 5909',
      phone: CLINIC_INFO.phoneRaw,
      type: 'phone',
    });
  }

  if (text.includes('parking') || text.includes('direction') || text.includes('where') || text.includes('address') || text.includes('location')) {
    buttons.push({
      label: 'View on Google Maps',
      url: CLINIC_INFO.mapsUrl,
      type: 'directions',
    });
  }

  return buttons;
}

export function getLocalGroundedResponse(userQuery: string): ChatResponse {
  const q = userQuery.toLowerCase().trim();

  // 1. Emergency detection
  if (
    q.includes('emergency') ||
    q.includes('after hours') ||
    q.includes('after-hours') ||
    q.includes('overnight') ||
    q.includes('night') ||
    q.includes('closed') ||
    q.includes('poison') ||
    q.includes('hit by car') ||
    q.includes('bleeding')
  ) {
    return {
      text: "Outside our standard opening hours, Gold Coast Vet Surgery refers all emergencies to Animal Emergency Service (AES) on the Gold Coast. Please call them immediately on (07) 5559 1599 or proceed directly to 104 Eastlake St, Carrara Qld 4211 rather than waiting.",
      isEmergencyAlert: true,
      topicTag: "After-Hours Emergency",
      actionButtons: [
        { label: "Call AES: (07) 5559 1599", phone: CLINIC_INFO.emergency.phoneRaw, type: "emergency" },
        { label: "AES Directions (Carrara)", url: CLINIC_INFO.emergency.mapsUrl, type: "directions" },
        { label: "Clinic Reception: (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 2. Pricing & Quotes detection (Never invent prices)
  if (
    q.includes('how much') ||
    q.includes('cost') ||
    q.includes('price') ||
    q.includes('quote') ||
    q.includes('fee') ||
    q.includes('pricing') ||
    q.includes('consult fee') ||
    q.includes('surgery cost')
  ) {
    return {
      text: "Because every pet's medical requirements are unique, we do not provide fixed price quotes over chat or telephone. Our veterinarians will always provide an accurate, transparent estimate during your consultation prior to treatment, and keep you updated on any hospitalised costs. Please call (07) 5538 5909 or book a consultation online.",
      topicTag: "Cost Estimates & Pricing",
      actionButtons: [
        { label: "Book Consultation for Estimate", url: CLINIC_INFO.bookingUrl, type: "booking" },
        { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      ],
    };
  }

  // 3. Medical diagnosis / treatment advice outside knowledge base
  if (
    q.includes('diagnos') ||
    q.includes('is my dog dying') ||
    q.includes('is my cat sick') ||
    q.includes('vomiting blood') ||
    q.includes('medicine dose') ||
    q.includes('what pill') ||
    q.includes('can i give human')
  ) {
    return {
      text: "I cannot advise on medical diagnoses or clinical treatments directly over chat. If your pet is unwell, experiencing discomfort, or needs immediate attention, please call our clinic right away on (07) 5538 5909 so our veterinary team can assist you.",
      topicTag: "Medical Inquiries",
      actionButtons: [
        { label: "Call Clinic (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        { label: "Book an Appointment", url: CLINIC_INFO.bookingUrl, type: "booking" },
      ],
    };
  }

  // 4. Free puppy and kitten health check
  if (
    (q.includes('puppy') || q.includes('kitten')) &&
    (q.includes('free') || q.includes('check') || q.includes('new') || q.includes('first'))
  ) {
    const item = FAQ_KNOWLEDGE_BASE.find(i => i.id === 'free-puppy-kitten-check')!;
    return {
      text: item.answer,
      topicTag: item.topic,
      actionButtons: item.actionButtons,
    };
  }

  // 5. Booking appointment
  if (
    q.includes('book') ||
    q.includes('appointment') ||
    q.includes('schedule') ||
    q.includes('slot') ||
    q.includes('consultation')
  ) {
    const item = FAQ_KNOWLEDGE_BASE.find(i => i.id === 'how-to-book')!;
    return {
      text: item.answer,
      topicTag: item.topic,
      actionButtons: item.actionButtons,
    };
  }

  // 6. Match against FAQ items by keyword scoring
  let bestMatch: KnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of FAQ_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (q.includes(item.id.replace(/-/g, ' '))) {
      score += 20;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 3) {
    return {
      text: bestMatch.answer,
      topicTag: bestMatch.topic,
      actionButtons: bestMatch.actionButtons,
    };
  }

  // 7. General fallback / welcoming overview
  return {
    text: "At Gold Coast Vet Surgery, our purpose is to maintain and improve the quality of life of pets and their human families. I can answer questions about our opening hours, independent family ownership, core surgical & diagnostic services, free puppy/kitten checks, payment plans (ZipMoney & VetPay), or pet insurance e-claims. If you have specific medical questions or need an appointment right away, please call us on (07) 5538 5909 or book online!",
    topicTag: "General Inquiries",
    actionButtons: [
      { label: "Book Appointment Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
      { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
      { label: "View Hours & Location", url: CLINIC_INFO.mapsUrl, type: "directions" },
    ],
  };
}
