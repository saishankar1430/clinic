import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { Mail, Phone, MessageSquare, MapPin, AlertCircle, Send, CheckCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: new Date(),
        read: false
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please try calling us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-300 font-sans pb-16">
      
      {/* Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-12 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Mail className="w-8 h-8 text-blue-600" />
            <span>Contact Mahesh Dental Clinic</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            Have questions regarding orthodontic braces, root canals, or live timings? Send Dr. Mahesh's helpdesk a direct digital message.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Contact info list */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Clinic Helpdesk</h3>
            
            <div className="space-y-4">
              <a href="tel:+919876543210" className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition">
                <div className="bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-medium">Phone Support</span>
                  <span className="font-mono text-sm font-semibold text-slate-950 dark:text-slate-100">+91 98765 43210</span>
                </div>
              </a>

              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition">
                <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-medium">WhatsApp Direct</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Chat with Helpdesk</span>
                </div>
              </a>

              <a href="mailto:contact@maheshdental.com" className="flex items-center gap-3.5 group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition">
                <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-medium">Email Inquiries</span>
                  <span className="text-sm font-semibold text-slate-950 dark:text-slate-100">contact@maheshdental.com</span>
                </div>
              </a>

              <div className="flex items-center gap-3.5 p-2.5 rounded-xl">
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-slate-600 dark:text-slate-450 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-medium">Clinic Address</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    102, Premium Plaza, Near Central Park, Sector 5, City Center.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Closed */}
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-3xl p-6 space-y-3">
            <h4 className="font-display font-bold text-sm text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Dental Trauma & Emergencies</span>
            </h4>
            <p className="text-xs text-rose-600 dark:text-rose-400/80 leading-relaxed">
              If you have sustained oral fracture, severe wisdom swelling, or bleeding, dial our 24/7 Priority Emergency Line: <strong>+91 98765 99999</strong> for swift assistance.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-150 dark:border-slate-800 shadow-sm">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-6">Send digital inquiry</h3>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. name@gmail.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 99999 88888"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Orthodontics Consultation"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-450">Message Body</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your query here..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-semibold">{error}</p>
            )}

            {success && (
              <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Message received! Our helpdesk will email or call you shortly.</span>
              </p>
            )}

            <button
              id="contact-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
