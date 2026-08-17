import React from 'react';
import { CLINIC_INFO } from '../knowledgeBase';
import { Phone, Mail, MapPin, Clock, AlertTriangle, ExternalLink, ShieldCheck, Car, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        
        {/* Emergency Alert Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-8 text-rose-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-sm">After-Hours & Overnight Emergencies</h4>
              <p className="text-xs text-rose-800/90 mt-0.5 leading-relaxed">
                Outside Mon–Fri 8:00am–5:30pm & Sat 8:30am–12:00pm, we refer emergencies directly to <strong>Animal Emergency Service (AES)</strong> in Carrara. Call immediately rather than waiting.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <a
              href={CLINIC_INFO.emergency.phoneRaw}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors w-full md:w-auto shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call AES: (07) 5559 1599</span>
            </a>
            <a
              href={CLINIC_INFO.emergency.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs transition-colors border border-rose-200"
              title="104 Eastlake St, Carrara QLD"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 3-Column Professional Polish Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pb-6 border-b border-slate-100 text-sm">
          
          {/* Column 1: Phone & Email */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-slate-100 rounded-xl text-navy shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <a
                href={CLINIC_INFO.phoneRaw}
                className="font-bold text-base text-navy hover:text-orange transition-colors block"
              >
                {CLINIC_INFO.phone}
              </a>
              <a
                href={`mailto:${CLINIC_INFO.email}`}
                className="text-xs text-slate-500 hover:text-navy transition-colors block mt-0.5"
              >
                {CLINIC_INFO.email}
              </a>
            </div>
          </div>

          {/* Column 2: Location */}
          <div className="flex items-center gap-3.5 md:border-x md:border-slate-200 md:px-6">
            <div className="p-3 bg-slate-100 rounded-xl text-navy shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <a
                href={CLINIC_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-base text-navy hover:text-orange transition-colors block"
              >
                Surfers Paradise
              </a>
              <p className="text-xs text-slate-500 mt-0.5">{CLINIC_INFO.address}</p>
            </div>
          </div>

          {/* Column 3: Accreditation & Ownership */}
          <div className="flex flex-col justify-center md:text-right">
            <p className="text-navy text-xs uppercase tracking-wider font-bold">
              Accredited Hospital of Excellence
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Independent • Family Owned & Operated
            </p>
            <div className="flex items-center md:justify-end gap-1.5 text-xs text-emerald-700 font-medium mt-1">
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>Undercover off-street parking</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Hours & Copyright */}
        <div className="pt-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-slate-700">Hours:</span>
            <span>Mon–Fri 8:00am–5:30pm</span>
            <span>•</span>
            <span>Sat 8:30am–12:00pm</span>
            <span>•</span>
            <span className="text-slate-400">Sun & Public Hols Closed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>© {new Date().getFullYear()} Gold Coast Vet Surgery</span>
            <span>•</span>
            <span className="italic">"Where Pets are Family"</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
