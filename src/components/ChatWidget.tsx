import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { CLINIC_INFO, FAQ_KNOWLEDGE_BASE, SUGGESTED_QUESTIONS } from '../knowledgeBase';
import { sendMessageToAssistant } from '../services/chatService';
import {
  Send,
  Calendar,
  Phone,
  AlertTriangle,
  MapPin,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  Search,
  CreditCard,
  FileCheck2,
  Clock,
  Heart,
  FlaskConical,
  CheckCircle2,
  ShieldAlert,
  DollarSign
} from 'lucide-react';

const INITIAL_MESSAGE: Message = {
  id: 'welcome-1',
  sender: 'bot',
  text: `Hello! I'm the Gold Coast Vet Surgery assistant. Our purpose is to maintain and improve the quality of life of pets and their human families.\n\nHow can I help you and your pet today? Ask about our services, opening hours, free puppy/kitten checks, booking, payment plans (ZipMoney & VetPay), or pet insurance.`,
  timestamp: 'Just now',
  actionButtons: [
    { label: "Book Appointment Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
    { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
  ],
};

const TEST_SCENARIOS = [
  {
    category: "1. Core Clinic Info & Booking",
    icon: Clock,
    tests: [
      { prompt: "What are your opening hours on weekdays and weekends?", expected: "Mon-Fri 8am-5:30pm, Sat 8:30am-12pm, Sun closed." },
      { prompt: "How do I book an appointment?", expected: "Links to online booking portal + same-day critical care info." },
      { prompt: "Where is the clinic and is there parking?", expected: "2800 Gold Coast Hwy, Surfers Paradise + undercover parking." },
      { prompt: "Who owns and runs Gold Coast Vet Surgery?", expected: "Independent, family owned husband & wife vet team (no corporate chain)." }
    ]
  },
  {
    category: "2. Puppy & Kitten Special Care",
    icon: Heart,
    tests: [
      { prompt: "Do you have free health checks for new puppies or kittens?", expected: "Free 1st-week vet check + toilet/behaviour & parasite advice." },
      { prompt: "Do you run Puppy Preschool classes?", expected: "Yes, puppy preschool classes offered — ask clinic for schedule." }
    ]
  },
  {
    category: "3. After-Hours Emergency Guardrail",
    icon: ShieldAlert,
    tests: [
      { prompt: "My dog ate something toxic at 10pm, what should I do?", expected: "Refers immediately to Animal Emergency Service (AES) Carrara (07) 5559 1599." },
      { prompt: "Are you open on Sunday for emergencies?", expected: "Closed Sundays, AES on call at 104 Eastlake St, Carrara." }
    ]
  },
  {
    category: "4. Pricing Guardrail (No Invented Prices)",
    icon: DollarSign,
    tests: [
      { prompt: "How much does a dog desexing surgery cost?", expected: "Refuses fixed price quote, explains consult estimates, gives phone/booking." },
      { prompt: "What is your consultation fee?", expected: "Transparent estimate provided at consult, no fixed quotes over chat." }
    ]
  },
  {
    category: "5. Payment Plans & Pet Insurance",
    icon: CreditCard,
    tests: [
      { prompt: "What payment plans do you accept?", expected: "ZipMoney Mediplan (6 mo interest-free) and VetPay (6-12 mo)." },
      { prompt: "How does pet insurance work with your clinic?", expected: "Direct e-claims through software, no forms or extra charge." },
      { prompt: "Can I pay by cheque?", expected: "Cheques not accepted. Cash, EFTPOS, VISA, Mastercard accepted." }
    ]
  },
  {
    category: "6. Medical & Surgical Services",
    icon: Stethoscope,
    tests: [
      { prompt: "What services and surgeries do you provide?", expected: "Triennial vaccines, desexing, X-ray, ultrasound, soft tissue & orthopaedic." },
      { prompt: "Do you offer dental cleaning and dental X-rays?", expected: "Ultrasonic scaling, polishing, extractions, digital dental X-rays on site." },
      { prompt: "Is grooming available on site?", expected: "Yes, Polished Pets located downstairs." }
    ]
  }
];

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFaqDrawer, setShowFaqDrawer] = useState(false);
  const [showTesterDrawer, setShowTesterDrawer] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setDictationSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-AU';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToAssistant(text, messages);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: botResponse.actionButtons,
        topicTag: botResponse.topicTag,
        isEmergencyAlert: botResponse.isEmergencyAlert,
      };

      setMessages(prev => [...prev, botMessage]);

      if (isSpeaking && 'speechSynthesis' in window) {
        speakText(botResponse.text);
      }
    } catch (_error) {
      const fallbackMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Thank you for reaching out. If you have immediate questions or need to book, please call Gold Coast Vet Surgery directly on (07) 5538 5909 or book online.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: [
          { label: "Book Appointment Online", url: CLINIC_INFO.bookingUrl, type: "booking" },
          { label: "Call (07) 5538 5909", phone: CLINIC_INFO.phoneRaw, type: "phone" },
        ],
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMessages([INITIAL_MESSAGE]);
  };

  const toggleDictation = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition start failed', err);
      }
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/https?:\/\/\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-AU';
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceMode = () => {
    if (isSpeaking) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const lastBot = [...messages].reverse().find(m => m.sender === 'bot');
      if (lastBot) {
        speakText(lastBot.text);
      }
    }
  };

  const filteredFaqs = FAQ_KNOWLEDGE_BASE.filter(item => {
    const matchesSearch =
      faqSearch === '' ||
      item.topic.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.keywords.some(k => k.toLowerCase().includes(faqSearch.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Main Card Container styled to Professional Polish design */}
      <div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[680px] sm:h-[720px] max-h-[82vh] overflow-hidden relative">
        
        {/* Chatbot Header - bg-navy */}
        <div className="bg-navy p-4 px-4 sm:px-6 flex items-center justify-between text-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shrink-0"></div>
            <div>
              <h2 className="text-white font-semibold text-base sm:text-lg leading-tight">
                Clinic Assistant — Online
              </h2>
              <p className="text-xs text-slate-300">
                Gold Coast Vet Surgery • Verified FAQ
              </p>
            </div>
          </div>

          {/* Quick Header Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Test Suite Launcher */}
            <button
              type="button"
              onClick={() => {
                setShowTesterDrawer(true);
                setShowFaqDrawer(false);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-orange hover:brightness-110 text-white flex items-center gap-1.5 transition-all shadow-xs"
              title="Test sample questions by category"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Test Suite</span>
            </button>

            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoiceMode}
                title={isSpeaking ? "Mute audio" : "Listen via voice"}
                className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                  isSpeaking
                    ? 'bg-orange text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowFaqDrawer(!showFaqDrawer);
                setShowTesterDrawer(false);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1.5 transition-colors border border-white/10"
              title="Explore all 24 FAQ topics"
            >
              <HelpCircle className="w-3.5 h-3.5 text-orange" />
              <span className="hidden sm:inline">24 Topics</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Emergency Ticker Notice */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <AlertTriangle className="w-4 h-4 text-orange shrink-0" />
            <span className="truncate">
              <strong>Emergency?</strong> Clinic: <a href={CLINIC_INFO.phoneRaw} className="underline font-bold text-navy">(07) 5538 5909</a> | After-Hours: <a href={CLINIC_INFO.emergency.phoneRaw} className="underline font-bold text-rose-700">AES Carrara (07) 5559 1599</a>
            </span>
          </div>
          <a
            href={CLINIC_INFO.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-navy hover:text-orange shrink-0"
          >
            <span>Book Online</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Message Thread Area */}
        <div className="flex-grow p-4 sm:p-6 sm:px-8 space-y-5 overflow-y-auto bg-white flex flex-col">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 sm:gap-4 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Bot Avatar 🐾 */}
              {msg.sender === 'bot' && (
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${
                    msg.isEmergencyAlert
                      ? 'bg-rose-100 border-rose-300 text-rose-600'
                      : 'bg-slate-100 border-slate-200 text-navy'
                  }`}
                >
                  <span className="text-base sm:text-lg">🐾</span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`flex flex-col space-y-2 max-w-[85%] sm:max-w-[80%] ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-4 rounded-2xl shadow-xs text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-navy text-white rounded-tr-none'
                      : msg.isEmergencyAlert
                      ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.topicTag && (
                    <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-orange">
                      <Sparkles className="w-3 h-3" />
                      <span>{msg.topicTag}</span>
                    </div>
                  )}

                  {msg.isEmergencyAlert && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100/90 px-2.5 py-1 rounded-md">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>AFTER-HOURS EMERGENCY NOTICE</span>
                    </div>
                  )}

                  <div className="space-y-1.5 leading-relaxed">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (!line.trim()) return <div key={lIdx} className="h-1.5" />;
                      
                      // Check for bullet points
                      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
                      const cleanLine = isBullet ? line.trim().replace(/^([•\-\*]\s*)/, '') : line;

                      // Format bold **text**
                      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

                      const formattedParts = parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });

                      if (isBullet) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2 pl-1 my-0.5">
                            <span className="text-orange font-bold leading-none mt-1">•</span>
                            <span className="flex-1">{formattedParts}</span>
                          </div>
                        );
                      }

                      return <p key={lIdx} className="my-0.5">{formattedParts}</p>;
                    })}
                  </div>
                </div>

                {/* Contextual Action Buttons */}
                {msg.actionButtons && msg.actionButtons.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.actionButtons.map((btn, idx) => {
                      if (btn.type === 'booking') {
                        return (
                          <a
                            key={idx}
                            href={btn.url || CLINIC_INFO.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-sm transition-all uppercase tracking-wider active:scale-[0.99]"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{btn.label}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-90" />
                          </a>
                        );
                      }

                      if (btn.type === 'emergency') {
                        return (
                          <a
                            key={idx}
                            href={btn.phone || CLINIC_INFO.emergency.phoneRaw}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all animate-pulse"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{btn.label}</span>
                          </a>
                        );
                      }

                      if (btn.type === 'phone') {
                        return (
                          <a
                            key={idx}
                            href={btn.phone || CLINIC_INFO.phoneRaw}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-navy text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-orange" />
                            <span>{btn.label}</span>
                          </a>
                        );
                      }

                      if (btn.type === 'directions') {
                        return (
                          <a
                            key={idx}
                            href={btn.url || CLINIC_INFO.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-navy border border-slate-300 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                          >
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{btn.label}</span>
                          </a>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 px-1">
                  {msg.timestamp}
                </span>
              </div>

              {/* User Avatar 👤 */}
              {msg.sender === 'user' && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="text-slate-600 text-base sm:text-lg">👤</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <span className="text-navy text-lg">🐾</span>
              </div>
              <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-orange animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-navy animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  <span className="text-xs text-slate-500 ml-2 font-medium">Checking knowledge base...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Topic Chips */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange" />
            Quick Test:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs bg-white hover:bg-slate-100 hover:border-orange text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 shrink-0 transition-all active:scale-95 shadow-2xs font-medium cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar - Professional Polish Design */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex gap-3 sm:gap-4 items-center">
          <div className="relative flex-grow">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type any question to test (e.g. puppy check, desexing cost, after-hours emergency)..."
              className="w-full bg-white border border-slate-200 rounded-full px-5 pr-10 py-3 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-navy focus:border-transparent resize-none max-h-32 placeholder:text-slate-400 shadow-2xs"
            />
            {dictationSupported && (
              <button
                type="button"
                onClick={toggleDictation}
                className={`absolute right-3.5 top-3 p-1 rounded-full transition-colors ${
                  isListening
                    ? 'text-rose-600 bg-rose-100 animate-pulse'
                    : 'text-slate-400 hover:text-navy'
                }`}
                title={isListening ? "Listening..." : "Dictate"}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 shrink-0 ${
              inputValue.trim() && !isLoading
                ? 'bg-navy hover:bg-navy-dark cursor-pointer'
                : 'bg-slate-300 text-slate-100 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Test Suite Drawer (Overlay) */}
        {showTesterDrawer && (
          <div className="absolute inset-0 bg-white/98 backdrop-blur-sm z-30 flex flex-col p-4 sm:p-6 overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-orange" />
                <div>
                  <h3 className="font-bold text-base text-navy">
                    Instant Question Test Suite
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any test prompt below to run and verify the response
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTesterDrawer(false)}
                className="text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              >
                Close ✕
              </button>
            </div>

            {/* Test Scenarios List */}
            <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
              {TEST_SCENARIOS.map((group, gIdx) => {
                const IconComponent = group.icon;
                return (
                  <div key={gIdx} className="space-y-2">
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                      <IconComponent className="w-4 h-4 text-orange" />
                      <span>{group.category}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.tests.map((test, tIdx) => (
                        <div
                          key={tIdx}
                          onClick={() => {
                            setShowTesterDrawer(false);
                            handleSend(test.prompt);
                          }}
                          className="p-3 bg-slate-50 hover:bg-orange/5 border border-slate-200 hover:border-orange rounded-xl transition-all cursor-pointer group flex flex-col justify-between text-left shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-navy group-hover:text-orange">
                              "{test.prompt}"
                            </p>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange shrink-0 mt-0.5" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{test.expected}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQ Topic Explorer Drawer (Overlay) */}
        {showFaqDrawer && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col p-4 sm:p-6 overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange" />
                <h3 className="font-bold text-base text-navy">
                  Verified FAQ Knowledge Base (24 Topics)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFaqDrawer(false)}
                className="text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
              >
                Close ✕
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="py-3 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search clinic topics (e.g. puppy check, dental, payment plans, hours)..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-full focus:outline-hidden focus:ring-2 focus:ring-navy"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs pt-1">
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'booking', label: 'Booking' },
                  { id: 'emergency', label: 'Emergency' },
                  { id: 'services', label: 'Services' },
                  { id: 'puppy-kitten', label: 'Puppy & Kitten' },
                  { id: 'payment', label: 'Payment' },
                  { id: 'insurance', label: 'Insurance' },
                  { id: 'facility', label: 'Facility' },
                  { id: 'about', label: 'About Us' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-navy text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No matching topics found.
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    onClick={() => {
                      setShowFaqDrawer(false);
                      handleSend(faq.topic);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-orange/5 border border-slate-200 hover:border-orange rounded-xl transition-all cursor-pointer group flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-navy group-hover:text-orange">
                        {faq.topic}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {faq.summary}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange shrink-0 mt-1" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Clinic Highlights below widget */}
      <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <Clock className="w-5 h-5 text-navy mx-auto mb-1" />
          <h4 className="font-bold text-xs text-navy">Mon–Fri 8am–5:30pm</h4>
          <p className="text-[11px] text-slate-500">Sat 8:30am–12pm</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <Heart className="w-5 h-5 text-orange mx-auto mb-1" />
          <h4 className="font-bold text-xs text-navy">Free Puppy/Kitten</h4>
          <p className="text-[11px] text-slate-500">1st week health check</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <CreditCard className="w-5 h-5 text-navy mx-auto mb-1" />
          <h4 className="font-bold text-xs text-navy">Zip & VetPay</h4>
          <p className="text-[11px] text-slate-500">Interest-free plans</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <FileCheck2 className="w-5 h-5 text-navy mx-auto mb-1" />
          <h4 className="font-bold text-xs text-navy">Direct E-Claims</h4>
          <p className="text-[11px] text-slate-500">No insurance forms needed</p>
        </div>
      </div>
    </div>
  );
};
