import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  onSnapshot,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { Appointment, UserProfile, Notification, Review, ClinicAnnouncement, Blog } from '../types';
import { 
  Calendar, 
  User, 
  FileText, 
  Bell, 
  Smile, 
  ChevronRight, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Clock, 
  LogOut,
  Settings,
  X,
  Star,
  Send,
  Navigation,
  Sparkles,
  Award
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  // Firestore Data States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [announcement, setAnnouncement] = useState<ClinicAnnouncement | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile' | 'notifications' | 'reviews' | 'blogs'>('appointments');

  // Profile Form States
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(user?.gender || 'Male');
  const [address, setAddress] = useState(user?.address || '');
  const [medicalHistory, setMedicalHistory] = useState(user?.medicalHistory || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(user?.emergencyContact?.relationship || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Review Submission States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // 1. Listen for Appointments real-time
    const qApp = query(collection(db, 'appointments'), where('patientId', '==', user.uid));
    const unsubscribeAppointments = onSnapshot(qApp, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    // 2. Listen for User Notifications real-time
    const qNotif = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsubscribeNotifications = onSnapshot(qNotif, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });

    // 3. Listen for Announcement
    const unsubscribeAnnounce = onSnapshot(doc(db, 'announcements', 'banner'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().active) {
        setAnnouncement(docSnap.data() as ClinicAnnouncement);
      } else {
        setAnnouncement(null);
      }
    });

    // Fetch Blogs once
    const fetchBlogs = async () => {
      try {
        const snap = await getDocs(collection(db, 'blogs'));
        setBlogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Blog)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlogs();

    return () => {
      unsubscribeAppointments();
      unsubscribeNotifications();
      unsubscribeAnnounce();
    };
  }, [user]);

  // Profile Update Submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    try {
      await updateUserProfile({
        phoneNumber: phone,
        dob,
        gender,
        address,
        medicalHistory,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship
        }
      });
      setProfileSuccess('✓ Your patient profile was successfully updated!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Action: I'm on my way!
  const handleImOnMyWay = async (appointmentId: string) => {
    try {
      const docRef = doc(db, 'appointments', appointmentId);
      await updateDoc(docRef, {
        isOnMyWay: true,
        isOnMyWayTime: new Date()
      });
      // Trigger user notification
      await addDoc(collection(db, 'notifications'), {
        userId: user!.uid,
        title: "Clinic Notified: You're En Route!",
        message: "We've logged your commute. Dr. Mahesh's assistant will update your queue position accordingly.",
        type: 'appointment_status',
        read: false,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error triggering ImOnMyWay:', err);
    }
  };

  // Action: Cancel Appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled'
      });
      await addDoc(collection(db, 'notifications'), {
        userId: user!.uid,
        title: 'Appointment Cancelled',
        message: 'Your dental appointment was cancelled successfully.',
        type: 'appointment_status',
        read: false,
        createdAt: new Date()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Reschedule Appointment (Simple simulate)
  const handleReschedule = async (appointmentId: string) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    const newTime = prompt('Enter new time slot (e.g. 10:30 AM):');
    if (!newDate || !newTime) return;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        date: newDate,
        timeSlot: newTime,
        status: 'pending' // Revert to pending for doctor review
      });
      await addDoc(collection(db, 'notifications'), {
        userId: user!.uid,
        title: 'Reschedule Requested',
        message: `Requested rescheduling to ${newDate} at ${newTime}. Awaiting Dr. Mahesh's verification.`,
        type: 'appointment_status',
        read: false,
        createdAt: new Date()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    setReviewSuccess('');
    try {
      await addDoc(collection(db, 'reviews'), {
        patientId: user!.uid,
        patientName: user!.displayName,
        patientPhoto: user!.photoURL || '',
        rating,
        comment,
        status: 'pending', // Admin reviews before publishing
        createdAt: new Date()
      });
      setReviewSuccess('✓ Your review was submitted for moderation. Thank you!');
      setComment('');
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notification as read
  const handleMarkNotifRead = async (notifId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  // Profile completion calculation helper
  const calculateProfileCompletion = () => {
    let score = 0;
    if (user?.phoneNumber) score += 20;
    if (user?.dob) score += 20;
    if (user?.gender) score += 20;
    if (user?.address) score += 20;
    if (user?.medicalHistory) score += 20;
    return score;
  };

  const completionPercent = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 font-sans flex flex-col md:flex-row transition-all duration-300">
      
      {/* Sidebar Dashboard Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-150 dark:border-slate-800 p-6 space-y-8 shrink-0">
        
        {/* User Mini Profile card */}
        <div className="space-y-3 text-center border-b border-slate-100 dark:border-slate-850 pb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold text-xl rounded-full flex items-center justify-center mx-auto">
            {user?.displayName ? user.displayName[0].toUpperCase() : 'P'}
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">{user?.displayName}</h3>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Patient Portal
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'appointments'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
            } cursor-pointer`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
            } cursor-pointer`}
          >
            <User className="w-4 h-4" />
            <span>Edit Medical Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
              activeTab === 'notifications'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
            } cursor-pointer`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute right-3 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'reviews'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
            } cursor-pointer`}
          >
            <Smile className="w-4 h-4" />
            <span>Leave a Review</span>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'blogs'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
            } cursor-pointer`}
          >
            <FileText className="w-4 h-4" />
            <span>Dental Advice & Blogs</span>
          </button>
        </nav>

        {/* Profile Completion Panel */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2 text-[11px]">
          <span className="font-semibold text-slate-500 block">Profile Completion</span>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <span className="text-slate-400 font-mono block text-right">{completionPercent}% Complete</span>
        </div>

      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        
        {/* Realtime Announcement Banner */}
        {announcement && (
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-4 flex gap-3 text-sm text-indigo-700 dark:text-indigo-400 items-start">
            <Sparkles className="w-5 h-5 shrink-0 animate-spin text-amber-500" />
            <div className="space-y-0.5">
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Clinic Broadcast</span>
              <p className="text-xs leading-relaxed">{announcement.content}</p>
            </div>
          </div>
        )}

        {/* TAB 1: Appointments management */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your Appointments</h2>
                <p className="text-xs text-slate-400">Track and manage upcoming clinical sessions with Dr. Mahesh.</p>
              </div>
              <Link
                id="portal-quick-book"
                to="/book"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-full shadow transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Book</span>
              </Link>
            </div>

            {/* list */}
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{app.serviceName}</span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        app.status === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : app.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{app.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{app.timeSlot}</span>
                      </div>
                      {app.isOnMyWay && (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold animate-pulse">
                          <Navigation className="w-3.5 h-3.5 shrink-0" />
                          <span>Commute Notified</span>
                        </div>
                      )}
                    </div>

                    {app.notes && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-slate-500 leading-snug">
                        <strong>Dr. Mahesh's Medical Note:</strong> {app.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions (Reschedule, Cancel, Im on my way) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {app.status === 'approved' && !app.isOnMyWay && (
                      <button
                        onClick={() => handleImOnMyWay(app.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>I'm on my way</span>
                      </button>
                    )}
                    
                    {app.status !== 'cancelled' && app.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleReschedule(app.id)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(app.id)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400">No appointments scheduled yet. Book your first dental procedure now.</p>
                  <Link
                    to="/book"
                    className="inline-block bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-full"
                  >
                    Schedule Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Edit Medical Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-6">Patient Medical Records</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 99999 88888"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">DOB (Date of Birth)</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Home Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Apt 102, Central Heights, Sector 5"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Chronic Illness & Dental History</label>
                <textarea
                  rows={3}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Diabetic under medication, previous extraction in 2022, allergic to penicillin..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-sm resize-none"
                />
              </div>

              {/* Emergency Contact details */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact Name"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs"
                  />
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Contact Phone"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs"
                  />
                  <input
                    type="text"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                    placeholder="Relationship (e.g. Spouse)"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {profileSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{profileSuccess}</p>
              )}

              <button
                id="btn-update-profile"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow cursor-pointer transition-colors"
              >
                Save Medical Profile
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Live Notifications</h2>
            
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-4 rounded-xl border flex justify-between items-start gap-4 ${
                  notif.read 
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850' 
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900'
                }`}>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{notif.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 block pt-1 font-mono">
                      {notif.createdAt ? new Date(notif.createdAt.toDate ? notif.createdAt.toDate() : notif.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkNotifRead(notif.id)}
                      className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ))}

              {notifications.length === 0 && (
                <p className="text-center text-xs text-slate-400 italic py-12">No notifications found.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Leave Review */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Share Your Feedback</h2>
              <p className="text-xs text-slate-400">Only verified patients can submit clinic reviews. Your input helps us continuously polish Dr. Mahesh\'s care standards.</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450 block">Assign Rating (1 - 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-amber-400 p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-450">Review Comment</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Dr. Mahesh was incredibly gentle. The extraction process was completely painless..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {reviewSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{reviewSuccess}</p>
              )}

              <button
                id="btn-submit-review"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition"
              >
                Submit Verified Review
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: Blogs */}
        {activeTab === 'blogs' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Oral Health Blogs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <img src={blog.image} alt={blog.title} className="w-full h-40 object-cover" />
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">{blog.category}</span>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">{blog.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{blog.summary}</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-50 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                    <span>By {blog.author}</span>
                    <button 
                      onClick={() => alert(blog.content)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Read Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
