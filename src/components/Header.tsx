import React from 'react';
import { CLINIC_INFO } from '../knowledgeBase';
import { Calendar, Phone, Award, ShieldCheck, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Notification Bar */}
      <div className="bg-navy text-slate-100 text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-orange font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Independent & Family Owned
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-200">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Accredited Hospital of Excellence
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Mon–Fri 8am–5:30pm | Sat 8:30am–12pm
            </span>
            <a
              href={CLINIC_INFO.phoneRaw}
              className="flex items-center gap-1.5 font-bold text-white hover:text-orange transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-orange" />
              <span>(07) 5538 5909</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-4">
          <img
            src={CLINIC_INFO.logoUrl}
            alt="Gold Coast Vet Surgery"
            className="h-14 sm:h-16 w-auto object-contain rounded-md shadow-xs bg-white"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-navy">
              {CLINIC_INFO.name}
            </h1>
            <p className="text-sm italic font-medium text-slate-500">
              "{CLINIC_INFO.tagline}"
            </p>
            <p className="text-xs text-slate-400 hidden md:block">
              Surfers Paradise, QLD • Led by Husband & Wife Vet Team
            </p>
          </div>
        </div>

        {/* CTA & Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <a
            href={CLINIC_INFO.phoneRaw}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Phone className="w-4 h-4 text-navy" />
            <span className="font-semibold text-navy">(07) 5538 5909</span>
          </a>

          <a
            href={CLINIC_INFO.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-orange hover:brightness-110 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition-all uppercase text-xs sm:text-sm tracking-wider active:scale-[0.99]"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Book Appointment Online</span>
          </a>
        </div>
      </div>

      {/* Purpose Banner */}
      <div className="bg-slate-50 border-t border-slate-200/90 px-4 py-2 text-center text-xs text-slate-600 font-medium">
        <span className="text-navy font-semibold">Our Purpose:</span> "{CLINIC_INFO.purpose}"
      </div>
    </header>
  );
};
