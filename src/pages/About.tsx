import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { GalleryItem } from '../types';
import { Award, GraduationCap, Heart, CheckCircle, Image as ImageIcon, Sparkles, BookOpen, Star } from 'lucide-react';

export const About: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'clinic' | 'equipment' | 'before_after'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const snap = await getDocs(collection(db, 'gallery'));
        setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredGallery = activeFilter === 'all' 
    ? gallery 
    : gallery.filter(item => item.category === activeFilter);

  const qualifications = [
    { degree: 'MDS (Master of Dental Surgery)', school: 'All India Institute of Medical Sciences (AIIMS)', year: '2017' },
    { degree: 'BDS (Bachelor of Dental Surgery)', school: 'Government Dental College', year: '2014' },
    { degree: 'Fellowship in Oral Implantology', school: 'International Congress of Oral Implantologists (ICOI)', year: '2019' },
    { degree: 'Advanced Esthetic Dentistry Certification', school: 'Smile Design Academy', year: '2020' }
  ];

  const milestones = [
    { title: 'Clinical Precision', desc: 'Over 12 years of surgical excellence with zero post-operative complications.' },
    { title: 'Laser Certified', desc: 'Authorized expert in advanced Er:YAG dental laser technology for pain-free therapy.' },
    { title: 'Global Recognition', desc: 'Presented clinical papers on minimally invasive restorative dentistry at the IDF.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-300 font-sans pb-16">
      
      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-12 md:py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">About Dr. Mahesh</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Meet the primary medical force behind the clinic, dedicated to painless procedures, holistic safety, and real-time operational excellence.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Profile Card & Bio details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>Biography & Clinical Vision</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Dr. Mahesh is an acclaimed orthodontist and cosmetic dental surgeon with a career spanning over a decade. She founded the clinic with a singular goal: to demystify dentistry and make high-end dental procedures accessible, painless, and completely transparent.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              She pioneer-designed the <strong>"Before You Leave Home" live tracker</strong> so that families and professionals can coordinate their clinical sessions in real time. Dr. Mahesh takes personal care of each patient, planning customized orthodontic regimes and laser treatments with unparalleled precision.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-1">
                <Star className="w-5 h-5 text-amber-500 mx-auto" />
                <span className="block font-display font-bold text-sm text-slate-900 dark:text-white">Gold Medalist</span>
                <span className="text-[10px] text-slate-400">Oral Implantology</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-1">
                <Award className="w-5 h-5 text-blue-600 mx-auto" />
                <span className="block font-display font-bold text-sm text-slate-900 dark:text-white">Top Dentist</span>
                <span className="text-[10px] text-slate-400">National Dental Summit</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-center space-y-1">
                <GraduationCap className="w-5 h-5 text-purple-500 mx-auto" />
                <span className="block font-display font-bold text-sm text-slate-900 dark:text-white">ICOI Fellow</span>
                <span className="text-[10px] text-slate-400">Implant Certification</span>
              </div>
            </div>
          </div>

          {/* Education & Qualifications list */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              <span>Education & Qualifications</span>
            </h2>
            <div className="space-y-4">
              {qualifications.map((q, idx) => (
                <div key={idx} className="flex gap-4 items-start border-l-2 border-blue-100 dark:border-blue-900/50 pl-4 py-1">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{q.degree}</h4>
                    <p className="text-xs text-slate-400">{q.school} • {q.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor photo, Core values & Certification uploads */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm overflow-hidden p-6 text-center space-y-4">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600"
              alt="Dr. Mahesh"
              className="w-48 h-48 rounded-full object-cover mx-auto ring-4 ring-blue-50 dark:ring-blue-950/40"
            />
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Dr. Mahesh</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Chief Dental Specialist</p>
              <p className="text-[11px] text-slate-400">Fluent in: English, Hindi, Bengali</p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white space-y-4 shadow-md">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-300 shrink-0" />
              <span>Our Clinical Philosophy</span>
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-blue-100">
              <p>
                <strong>Mission:</strong> To prevent patient inconvenience through innovative real-time availability tracking while delivering high-end, painless clinical treatments.
              </p>
              <p>
                <strong>Vision:</strong> Establishing a gold standard in modern family dentistry, where medical expertise merges seamlessly with transparency, technology, and absolute hygiene.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Clinic Tour & Image Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <ImageIcon className="w-7 h-7 text-blue-600" />
            <span>Interactive Clinic Tour</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Take a look inside our sterile, patient-optimized diagnostic suites, high-tech labs, and kid-friendly zones.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 flex-wrap">
          {(['all', 'clinic', 'equipment', 'before_after'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeFilter === filter 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-blue-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800'
              } cursor-pointer`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredGallery.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative overflow-hidden h-44 bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur">
                  {item.category.replace('_', ' ')}
                </span>
              </div>
              <div className="p-3.5">
                <h4 className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{item.title}</h4>
              </div>
            </div>
          ))}
          {filteredGallery.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 italic">
              Loading clinical photos...
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
