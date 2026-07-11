import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Phone, Mail, MessageSquare, MapPin, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Clinic Bio */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight text-white">
              <Stethoscope className="w-6 h-6 text-blue-400 stroke-[2.5]" />
              <div className="flex flex-col">
                <span className="leading-tight">Mahesh</span>
                <span className="text-xs font-mono font-medium text-slate-400 -mt-0.5">Dental Clinic</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing premium, painless dental care solutions for the whole family under the expert supervision of Dr. Mahesh.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-full px-3 py-1 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Status Enabled</span>
            </div>
          </div>

          {/* Opening Timings */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white tracking-wide text-sm uppercase">Clinic Hours</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex justify-between"><span>Mon - Fri:</span> <span className="font-mono text-white">10:00 AM - 07:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday:</span> <span className="font-mono text-white">10:00 AM - 05:00 PM</span></li>
              <li className="flex justify-between text-red-400"><span>Sunday:</span> <span className="font-semibold uppercase text-xs tracking-wider">Closed</span></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white tracking-wide text-sm uppercase">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Dr. Mahesh</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact & Location</Link></li>
              <li><Link to="/book" className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1"><span>Book Appointment</span> <Calendar className="w-3 h-3" /></Link></li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white tracking-wide text-sm uppercase">Emergency Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="leading-snug">102, Premium Plaza, Sector 5, City Center</span>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors font-mono">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>+91 98765 43210</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>WhatsApp Chat</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Mahesh Dental Clinic. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
