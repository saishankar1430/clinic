import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  doc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { DentalService, Holiday, DoctorAvailability } from '../types';
import { 
  Calendar, 
  Clock, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  Stethoscope, 
  User, 
  ChevronRight,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service') || '';

  // Data States
  const [services, setServices] = useState<DentalService[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);

  // Form States
  const [selectedService, setSelectedService] = useState(initialServiceId);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [reportFileBase64, setReportFileBase64] = useState<string | null>(null);
  const [reportFileName, setReportFileName] = useState('');

  // Status & Validation States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]); // Slots already taken for selected date

  // Hardcoded standard daily slots
  const TIME_SLOTS = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", 
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", 
    "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"
  ];

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // Load services
        const servicesSnap = await getDocs(collection(db, 'services'));
        setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() } as DentalService)));

        // Load holidays
        const holidaysSnap = await getDocs(collection(db, 'holidays'));
        setHolidays(holidaysSnap.docs.map(d => d.data() as Holiday));

        // Load current availability status
        const availSnap = await getDoc(doc(db, 'doctorAvailability', 'current'));
        if (availSnap.exists()) {
          setAvailability(availSnap.data() as DoctorAvailability);
        }
      } catch (err) {
        console.error('Failed to load clinic configurations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, []);

  // Whenever selectedDate changes, fetch already booked slots to prevent double booking!
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const checkBookedSlots = async () => {
      try {
        const q = query(
          collection(db, 'appointments'),
          where('date', '==', selectedDate)
        );
        const snap = await getDocs(q);
        const slots = snap.docs
          .map(d => d.data())
          .filter(app => app.status !== 'cancelled' && app.status !== 'rejected')
          .map(app => app.timeSlot);
        setBookedSlots(slots);
      } catch (err) {
        console.error('Error loading booked slots:', err);
      }
    };

    checkBookedSlots();
  }, [selectedDate]);

  // File Upload base64 reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReportFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) {
      setErrorMsg('Please login to finalize your appointment.');
      setTimeout(() => navigate('/auth?redirect=book'), 2000);
      return;
    }

    if (!selectedService || !selectedDate || !selectedSlot) {
      setErrorMsg('Please complete all selections (service, date, and slot).');
      return;
    }

    // Validation 1: Prevent past dates
    const chosenDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (chosenDateObj < today) {
      setErrorMsg('You cannot schedule an appointment in the past.');
      return;
    }

    // Validation 2: Check Holiday
    const isHoliday = holidays.some(h => h.date === selectedDate);
    if (isHoliday) {
      const hDesc = holidays.find(h => h.date === selectedDate)?.description || 'Holiday';
      setErrorMsg(`The clinic is closed on this date due to a scheduled holiday: ${hDesc}`);
      return;
    }

    // Validation 3: Check Sunday closed
    const dayOfWeek = chosenDateObj.getDay();
    if (dayOfWeek === 6) { // 0 Sunday, 6 Saturday, wait, standard getDay(): 0 is Sunday, 6 is Saturday
      // Wait, Javascript getDay(): 0 = Sunday, 1 = Monday, 6 = Saturday
      // So Sunday is 0
    }
    if (dayOfWeek === 0) {
      setErrorMsg('The clinic is closed on Sundays. Please select a weekday or Saturday.');
      return;
    }

    // Validation 4: Double Booking double check
    if (bookedSlots.includes(selectedSlot)) {
      setErrorMsg('This slot was just booked by another patient. Please choose a different time.');
      return;
    }

    setSubmitting(true);
    try {
      const serviceName = services.find(s => s.id === selectedService)?.name || 'Dental Service';
      const duration = services.find(s => s.id === selectedService)?.duration || 30;

      // Create booking document in appointments collection
      const newAppointment = {
        patientId: user.uid,
        patientName: user.displayName || 'Anonymous Patient',
        patientPhone: user.phoneNumber || '',
        patientEmail: user.email,
        serviceId: selectedService,
        serviceName,
        date: selectedDate,
        timeSlot: selectedSlot,
        duration,
        problemDescription: problemDescription.trim(),
        preferredTimeOfDay,
        status: 'pending', // Requires Doctor approval
        createdAt: new Date(),
        reportURL: reportFileBase64 || '',
        isOnMyWay: false
      };

      await addDoc(collection(db, 'appointments'), newAppointment);

      // Create system notification for patient
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Booking Pending Approval',
        message: `Your appointment for ${serviceName} on ${selectedDate} at ${selectedSlot} has been logged and is awaiting Dr. Mahesh's approval.`,
        type: 'appointment_created',
        read: false,
        createdAt: new Date()
      });

      setSuccessMsg('Your appointment booking request has been submitted successfully! Redirecting you to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Suggest next available slots helper
  const getSuggestedSlot = () => {
    const openSlots = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
    return openSlots.length > 0 ? openSlots[0] : null;
  };

  const suggestion = getSuggestedSlot();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-300 font-sans pb-16">
      
      {/* Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-12 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span>Book Your Clinical Appointment</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            Fill in the medical form below. Our scheduling algorithm detects holiday closures, past date entries, and slot double-booking conflicts instantly.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Doctor Live Status Warning Banner */}
        {availability && (availability.status === 'unavailable' || availability.status === 'emergency') && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 mb-8 flex gap-3.5 items-start">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-rose-800 dark:text-rose-400">Dr. Mahesh is Currently Away</h4>
              <p className="text-xs text-rose-600 dark:text-rose-400/80 leading-relaxed">
                {availability.statusText}. You can still log appointments for upcoming weekdays, which will be approved as soon as the doctor returns!
              </p>
            </div>
          </div>
        )}

        {/* Outer Form Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-150 dark:border-slate-800 shadow-sm">
          
          <form onSubmit={handleBookingSubmit} className="space-y-8">
            
            {/* 1. Service Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Select Dental Service</span>
              </label>
              <select
                id="book-service"
                required
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a Dental Procedure --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration} mins • {s.estimatedCost})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Date Picker */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Select Date</span>
              </label>
              <input
                id="book-date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 3. Slot Selector Grid */}
            {selectedDate && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Choose Available Time Slot</span>
                  </label>
                  {suggestion && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Nearest Slot: {suggestion}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isTaken = bookedSlots.includes(slot);
                    return (
                      <button
                        id={`slot-btn-${slot.replace(' ', '-').replace(':', '-')}`}
                        key={slot}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold font-mono border transition text-center ${
                          isTaken 
                            ? 'bg-slate-100 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-850 cursor-not-allowed line-through'
                            : selectedSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 hover:border-blue-500 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                        }`}
                      >
                        {slot}
                        {isTaken && <span className="block text-[8px] font-sans opacity-60">Taken</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Preference & Problem Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Preferred Time of Day
                </label>
                <div className="flex gap-2">
                  {(['morning', 'afternoon', 'evening'] as const).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setPreferredTimeOfDay(pref)}
                      className={`flex-1 py-2 text-xs font-semibold capitalize border rounded-xl transition ${
                        preferredTimeOfDay === pref
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload report simulation */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>Upload Previous Reports (Optional)</span>
                </label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 relative">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2 rounded-lg shrink-0">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs text-slate-500 truncate">
                    {reportFileName || 'Click to select report (PDF/Image)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description textarea */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white">
                Briefly Describe Your Dental Pain/Problem
              </label>
              <textarea
                id="book-description"
                placeholder="e.g., Extreme hot/cold sensitivity in left molar, swelling in gums, regular orthodontic adjustment..."
                rows={4}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Action Alert states */}
            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-4 flex gap-3 text-sm text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 flex gap-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              id="book-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>{submitting ? 'Processing Your Booking Request...' : 'Finalize Request & Submit'}</span>
            </button>

          </form>

        </div>
      </div>

    </div>
  );
};
