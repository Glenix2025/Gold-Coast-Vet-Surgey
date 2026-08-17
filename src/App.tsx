/**
 * Gold Coast Vet Surgery - Customer-Facing Chatbot Demo App
 * Surfers Paradise, Queensland, Australia
 * "Where Pets are Family"
 */

import React from 'react';
import { Header } from './components/Header';
import { ChatWidget } from './components/ChatWidget';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-navy selection:text-white">
      {/* Clinic Header */}
      <Header />

      {/* Main Single Page Chatbot Experience with radial gradient */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100">
        <ChatWidget />
      </main>

      {/* Clinic Footer */}
      <Footer />
    </div>
  );
}
