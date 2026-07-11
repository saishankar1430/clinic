import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, onSnapshot, collection, getDocs, limit, query, addDoc } from 'firebase/firestore';
import { 
  DoctorAvailability, 
  DentalService, 
  Testimonial, 
  FAQ, 
  ClinicAnnouncement,
  ClinicTiming
} from '../types';
import { 
  Calendar, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  AlertTriangle, 
  HelpCircle, 
  Users, 
  Award, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [announcement, setAnnouncement] = useState<ClinicAnnouncement | null>(null);
  const [services, setServices] = useState<DentalService[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [timings, setTimings] = useState<ClinicTiming[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick message submission state
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Hero Image Carousel State
  const [currentHeroImageIdx, setCurrentHeroImageIdx] = useState(0);

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=600",
      alt: "Dr. Mahesh - BDS, MDS",
      title: "Dr. Mahesh",
      sub: "BDS, MDS • Senior Dental Surgeon",
      desc: "\"I believe dental visits should be relaxing and personalized. I manage my availability live so you never have to wait.\"",
      badge: "Certified Implantologist & Cosmetic Expert"
    },
    {
      url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600",
      alt: "Luxury Clinic Reception Lounge",
      title: "Premium Patient Lounge",
      sub: "Hygienic & Comfortable Environment",
      desc: "\"A calming space with state-of-the-art hygiene standards designed to keep you and your family fully relaxed and safe.\"",
      badge: "Sterile & Child-Friendly Clinical Standards"
    },
    {
      url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600",
      alt: "State-of-the-art dental equipment",
      title: "High-Tech Treatment Suite",
      sub: "Advanced Dental Technology",
      desc: "\"Equipped with next-generation Er:YAG lasers and painless procedural technologies for the best clinical outcomes.\"",
      badge: "Advanced Restorative Laser Certified"
    },
    {
      url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=600",
      alt: "Happy patient dental appointment",
      title: "Your Smile, Reimagined",
      sub: "Perfect Smile Design",
      desc: "\"Check live doctor availability before you leave home to completely eliminate waiting room fatigue.\"",
      badge: "Real-Time Tracking & Online Booking"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    // 1. Listen for Live Doctor Availability
    const unsubscribeAvailability = onSnapshot(doc(db, 'doctorAvailability', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setAvailability(docSnap.data() as DoctorAvailability);
      }
    }, (err) => console.error('Error listening to availability:', err));

    // 2. Listen for Announcement Banner
    const unsubscribeAnnouncements = onSnapshot(doc(db, 'announcements', 'banner'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().active) {
        setAnnouncement(docSnap.data() as ClinicAnnouncement);
      } else {
        setAnnouncement(null);
      }
    }, (err) => console.error('Error listening to announcements:', err));

    // Fetch static collections
    const fetchStaticData = async () => {
      try {
        const servicesSnap = await getDocs(query(collection(db, 'services'), limit(3)));
        setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() } as DentalService)));

        const testimonialsSnap = await getDocs(collection(db, 'testimonials'));
        setTestimonials(testimonialsSnap.docs.map(d => d.data() as Testimonial));

        const faqsSnap = await getDocs(collection(db, 'FAQs'));
        setFaqs(faqsSnap.docs.map(d => d.data() as FAQ));

        const timingsSnap = await getDocs(collection(db, 'clinicTimings'));
        setTimings(timingsSnap.docs.map(d => d.data() as ClinicTiming));
      } catch (err) {
        console.error('Error loading static collections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaticData();

    return () => {
      unsubscribeAvailability();
      unsubscribeAnnouncements();
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setSubmittingForm(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...contactForm,
        subject: 'Quick Callback Request',
        createdAt: new Date(),
        read: false
      });
      setFormSuccess(true);
      setContactForm({ name: '', phone: '', message: '' });
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingForm(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-emerald-500',
          text: 'Doctor Available Now',
          lightColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
          desc: 'Dr. Mahesh is currently at the clinic. Walk-ins and pre-booked slots are active.',
          icon: <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
        };
      case 'lunch':
        return {
          color: 'bg-amber-500',
          text: 'On Lunch Break',
          lightColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900',
          desc: 'Dr. Mahesh is on a short break. Appointments will resume shortly.',
          icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
        };
      case 'vacation':
        return {
          color: 'bg-indigo-500',
          text: 'On Scheduled Leave / Vacation',
          lightColor: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
          desc: 'Dr. Mahesh is away. You can still book for upcoming dates online!',
          icon: <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
        };
      case 'emergency':
        return {
          color: 'bg-rose-500',
          text: 'Emergency Closed Today',
          lightColor: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900',
          desc: 'The doctor is away on a medical emergency. Please do not visit without contacting.',
          icon: <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
        };
      default:
        return {
          color: 'bg-slate-500',
          text: 'Clinic Closed / Doctor Away',
          lightColor: 'bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-850',
          desc: 'Dr. Mahesh is away from the clinic. Please avoid visiting without an online booking.',
          icon: <AlertTriangle className="w-6 h-6 text-slate-500 shrink-0" />
        };
    }
  };

  const statusConfig = availability ? getStatusBadge(availability.status) : getStatusBadge('unavailable');

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans pb-12">
      
      {/* 2. Announcement Banner */}
      {announcement && (
        <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900 py-2.5 text-center text-xs md:text-sm text-blue-800 dark:text-blue-300 px-4 flex items-center justify-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
          <span>{announcement.content}</span>
        </div>
      )}

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-16 md:py-24">
        <div className="absolute inset-0 bg-radial-gradient from-blue-50/50 to-transparent dark:from-blue-950/10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-900">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Premium Dental Care • Real-Time Doctor Tracking</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Gentle Care for <span className="text-blue-600 dark:text-blue-400">Perfect Smiles</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Dr. Mahesh combines state-of-the-art dental technology with a warm, caring touch. Prevent wasted clinic visits by checking her live availability status in real time before leaving home!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                id="hero-book-btn"
                to="/book"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Appointment Online</span>
              </Link>
              <a
                href="tel:+919876543210"
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-3 rounded-full transition flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Call Clinic</span>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-full transition flex items-center gap-2 shadow-sm"
              >
                <MessageSquare className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Quick stats counter */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="block font-display text-2xl font-bold text-blue-600 dark:text-blue-400">12+</span>
                <span className="text-xs text-slate-400">Years Experience</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-bold text-blue-600 dark:text-blue-400">5,000+</span>
                <span className="text-xs text-slate-400">Happy Patients</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-bold text-blue-600 dark:text-blue-400">99.8%</span>
                <span className="text-xs text-slate-400">Satisfaction Rate</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration / Doctor Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-blue-500 rounded-3xl rotate-3 opacity-10 blur-xl animate-pulse" />
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-xl space-y-4">
                
                {/* Dynamic Sliding Image Container */}
                <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-100 group">
                  <motion.img
                    key={currentHeroImageIdx}
                    src={heroImages[currentHeroImageIdx].url}
                    alt={heroImages[currentHeroImageIdx].alt}
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Indicators overlay */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-full">
                    {heroImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentHeroImageIdx(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentHeroImageIdx === idx 
                            ? 'bg-blue-400 w-4' 
                            : 'bg-white/50 hover:bg-white'
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white transition-all duration-300">
                    {heroImages[currentHeroImageIdx].title}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium transition-all duration-300">
                    {heroImages[currentHeroImageIdx].sub}
                  </p>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 h-12 overflow-hidden transition-all duration-300 leading-relaxed italic">
                  {heroImages[currentHeroImageIdx].desc}
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-3 border border-blue-100 dark:border-blue-900 flex items-center gap-3 transition-all duration-300">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {heroImages[currentHeroImageIdx].badge}
                  </span>
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Centerpiece feature: "Before You Leave Home" Live Status */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-stretch gap-8">
            
            {/* Live Indicator Panel */}
            <div className="lg:w-3/5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <span className="font-display font-bold text-sm tracking-widest text-slate-400 uppercase">Before You Leave Home</span>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Check Dr. Mahesh's Real-Time Availability Status
              </h2>

              {/* Status block dynamically bound to Firestore */}
              <div className={`rounded-2xl border p-5 flex flex-col md:flex-row gap-4 items-start ${statusConfig.lightColor}`}>
                {statusConfig.icon}
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg md:text-xl leading-snug">
                    {statusConfig.text}
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {availability?.statusText || statusConfig.desc}
                  </p>
                  <p className="text-xs font-mono opacity-60 pt-1">
                    Status Last Checked: {availability?.updatedAt ? new Date(availability.updatedAt.toDate ? availability.updatedAt.toDate() : availability.updatedAt).toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <span className="font-semibold text-slate-400">Our Promise:</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-300">No wasted trips</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-300">Live booking slots</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-300">Real-time queue tracking</span>
              </div>
            </div>

            {/* Waiting list / Queue Estimator */}
            <div className="lg:w-2/5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Live Queue Status</span>
                  </h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block font-mono text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                      {availability?.queueCount ?? 2}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Patients Waiting</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ~{availability?.estimatedWaitTimeMinutes ?? 15} min
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Est. Wait Time</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-50 dark:border-blue-900/50 flex gap-2.5 items-start">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    {availability?.status === 'available' 
                      ? "Doctor is present! The next available appointment slot is open for online booking."
                      : "Doctor is currently unavailable. Please schedule for later or request a digital recall."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  id="status-book-cta"
                  to="/book"
                  className={`w-full py-3 px-4 rounded-xl text-center font-semibold block text-sm transition-all shadow-sm ${
                    availability?.status === 'unavailable' || availability?.status === 'emergency'
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow'
                  }`}
                >
                  {availability?.status === 'unavailable' || availability?.status === 'emergency'
                    ? 'Booking Temporarily Suspended'
                    : 'Claim Next Available Slot'}
                </Link>
                {availability?.nextAvailableTime && (
                  <p className="text-[11px] text-center text-slate-400">
                    Next Available Time: <strong className="text-slate-600 dark:text-slate-200">{availability.nextAvailableTime}</strong>
                  </p>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Services Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Our Premium Services</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From pediatric care to complex cosmetic surgeries, Dr. Mahesh offers high-fidelity, painless dental treatments tailored to your exact comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{service.name}</h3>
                    <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-semibold">{service.duration} mins</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{service.description}</p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">{service.estimatedCost}</span>
                <Link to="/services" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            <span>View All 13+ Dental Procedures</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 6. Why Choose Us (Bento-style benefits grid) */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Why Choose Mahesh Dental Clinic</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Our clinic represents the pinnacle of patient comfort, technological excellence, and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">No-Wait Live Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Check availability before leaving your house. No more wasted commutes or unexpected absences.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Painless Procedures</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Utilizing ultra-fine laser systems and advanced local aesthetics to guarantee pain-free sessions.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
              <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Kid-Friendly Care</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Specialized pediatric treatments designed to replace fear with smiles and dental hygiene confidence.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Sterile & Certified</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Class-B autoclaving and 100% disposable materials for a sterile surgical environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials & Google Map Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Patient Reviews */}
        <div className="space-y-8">
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Loved by Patients</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">★ 4.9/5 Rating</span>
          </h2>

          <div className="space-y-4">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={t.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                    alt={t.name}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                  <div className="ml-auto text-amber-400 text-sm">
                    {"★".repeat(t.rating)}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timings & Map Embed */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Our Location & Timings</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Clinic Address</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  102, Premium Plaza, Near Central Park, Sector 5, City Center.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Standard Timings</span>
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <p>Mon - Fri: 10:00 AM – 7:00 PM</p>
                  <p>Sat: 10:00 AM – 5:00 PM</p>
                  <p className="text-rose-500 font-semibold">Sun: Closed</p>
                </div>
              </div>
            </div>

            {/* Simulated Google Maps Iframe */}
            <div className="rounded-xl overflow-hidden h-48 border border-slate-100 dark:border-slate-800 relative bg-slate-100">
              <iframe
                title="Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.0583707255153!2d88.4286161759495!3d22.576912832810815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275adebdf753b%3A0xe6bf44b61dbd043d!2sSector%20V!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

      </section>

      {/* 8. Interactive FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-sm text-slate-400">
            Find answers to common questions about appointments, consultations, treatments, and live tracking.
          </p>
        </div>

        {/* FAQ Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="faq-search"
            type="text"
            placeholder="Search questions (e.g. live status, pain)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <details key={faq.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 group transition-colors">
              <summary className="font-display font-semibold text-sm md:text-base text-slate-900 dark:text-white cursor-pointer select-none flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-blue-500 font-mono text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
          {filteredFaqs.length === 0 && (
            <p className="text-center text-xs text-slate-400 italic">No matching questions found.</p>
          )}
        </div>
      </section>

      {/* 9. Contact Callback Form */}
      <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg">Request a Call Back</h3>
            <p className="text-xs text-blue-100">Leave your details and Dr. Mahesh\'s clinic will contact you in 10 minutes.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all"
            />
            <button
              id="callback-submit-btn"
              type="submit"
              disabled={submittingForm}
              className="w-full bg-white text-blue-600 font-bold text-xs uppercase py-2.5 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submittingForm ? 'Submitting...' : 'Call Me Back'}
            </button>
          </form>

          {formSuccess && (
            <p className="text-xs text-emerald-300 font-semibold text-center mt-2 animate-bounce">
              ✓ Request submitted! We will call you shortly.
            </p>
          )}
        </div>
      </section>

    </div>
  );
};
