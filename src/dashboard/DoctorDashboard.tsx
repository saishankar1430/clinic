import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  setDoc,
  getDoc 
} from 'firebase/firestore';
import { Appointment, DoctorAvailability, ClinicAnnouncement } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Plane, 
  Calendar, 
  Users, 
  FileText, 
  Sparkles, 
  Radio, 
  Navigation, 
  Send, 
  ChevronRight,
  LogOut,
  Clock3,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Firestore States
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [announcement, setAnnouncement] = useState<ClinicAnnouncement | null>(null);

  // Form Inputs
  const [statusText, setStatusText] = useState('');
  const [nextAvailableTime, setNextAvailableTime] = useState('');
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(15);
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);

  // Active appointment notes state
  const [activeNoteAppId, setActiveNoteAppId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Tab
  const [currentTab, setCurrentTab] = useState<'queue' | 'appointments' | 'announcements' | 'status'>('queue');

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/auth');
      return;
    }

    // 1. Listen for ALL appointments
    const qApp = query(collection(db, 'appointments'));
    const unsubscribeApps = onSnapshot(qApp, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    // 2. Listen for Doctor Availability
    const unsubscribeAvail = onSnapshot(doc(db, 'doctorAvailability', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DoctorAvailability;
        setAvailability(data);
        setStatusText(data.statusText || '');
        setNextAvailableTime(data.nextAvailableTime || '');
        setEstimatedWaitTime(data.estimatedWaitTimeMinutes || 15);
      }
    });

    // 3. Listen for Announcements
    const unsubscribeAnnounce = onSnapshot(doc(db, 'announcements', 'banner'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ClinicAnnouncement;
        setAnnouncement(data);
        setAnnouncementContent(data.content || '');
        setAnnouncementActive(data.active);
      }
    });

    return () => {
      unsubscribeApps();
      unsubscribeAvail();
      unsubscribeAnnounce();
    };
  }, [user]);

  // Trigger Availability Change
  const handleStatusChange = async (status: 'available' | 'unavailable' | 'lunch' | 'vacation' | 'emergency') => {
    try {
      const docRef = doc(db, 'doctorAvailability', 'current');
      
      let defaultText = '';
      if (status === 'available') defaultText = "Dr. Mahesh is currently at the clinic and treating patients.";
      else if (status === 'lunch') defaultText = "Doctor is on a quick lunch break. Will return in 30 minutes.";
      else if (status === 'vacation') defaultText = "Doctor is currently on a scheduled vacation.";
      else if (status === 'emergency') defaultText = "Clinic is closed due to a clinical emergency.";
      else defaultText = "Doctor is currently away from the clinic.";

      await updateDoc(docRef, {
        status,
        statusText: defaultText,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Save Custom Status info
  const handleSaveStatusText = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'doctorAvailability', 'current');
      await updateDoc(docRef, {
        statusText,
        nextAvailableTime,
        estimatedWaitTimeMinutes: estimatedWaitTime,
        updatedAt: new Date()
      });
      alert('✓ Status configuration updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  // Appointment Workflow actions
  const handleApprove = async (id: string, patientId: string, serviceName: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'approved' });
      // Notify Patient
      await addDoc(collection(db, 'notifications'), {
        userId: patientId,
        title: 'Appointment Approved!',
        message: `Dr. Mahesh has approved your session for ${serviceName}. Check your portal for timings.`,
        type: 'appointment_status',
        read: false,
        createdAt: new Date()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string, patientId: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'rejected' });
      await addDoc(collection(db, 'notifications'), {
        userId: patientId,
        title: 'Appointment Declined',
        message: `Your booking was declined. Please reschedule or call helpdesk to identify alternative hours.`,
        type: 'appointment_status',
        read: false,
        createdAt: new Date()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'completed' });
    } catch (err) {
      console.error(err);
    }
  };

  // Save medical note for patients
  const handleSaveMedicalNote = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { notes: tempNoteText });
      setActiveNoteAppId(null);
      setTempNoteText('');
      alert('✓ Note saved securely in patient records.');
    } catch (err) {
      console.error(err);
    }
  };

  // Update Broadcast banner
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'announcements', 'banner'), {
        content: announcementContent,
        active: announcementActive,
        createdAt: new Date()
      });
      alert('✓ Clinic announcement broadcasted live.');
    } catch (err) {
      console.error(err);
    }
  };

  // Export Daily schedule to CSV
  const handleExportCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(app => app.date === today && app.status === 'approved');
    
    if (todayApps.length === 0) {
      alert("No approved appointments for today to export.");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Patient Name,Service,Slot,Duration (mins),Status,Commute\n"
      + todayApps.map(e => `"${e.patientName}","${e.serviceName}","${e.timeSlot}",${e.duration},"${e.status}","${e.isOnMyWay ? 'En Route' : 'Not Started'}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clinic_schedule_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingApps = appointments.filter(app => app.status === 'pending');
  const approvedApps = appointments.filter(app => app.status === 'approved');
  
  // Realtime Live Queue queue: active approved appointments for today
  const liveQueue = appointments.filter(app => app.date === todayStr && (app.status === 'approved' || app.status === 'completed'));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 font-sans flex flex-col md:flex-row transition-all duration-300">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 space-y-8 shrink-0">
        <div className="text-center border-b border-slate-800 pb-6 space-y-3">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto ring-2 ring-blue-500">
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150" alt="Dr" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">Dr. Mahesh</h3>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
              Chief Surgeon
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setCurrentTab('queue')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'queue' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Radio className="w-4 h-4 shrink-0" />
            <span>Live Queue & Commutes</span>
          </button>

          <button
            onClick={() => setCurrentTab('status')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'status' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Availability Status Toggle</span>
          </button>

          <button
            onClick={() => setCurrentTab('appointments')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'appointments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Approve Bookings ({pendingApps.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('announcements')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'announcements' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Manage Broadcasts</span>
          </button>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-slate-850 text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout Portal</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        
        {/* TAB 1: Live Queue Commute Indicator */}
        {currentTab === 'queue' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Live Patient Commutes & Queue</h2>
                <p className="text-xs text-slate-400">Track active bookings for today and see which patients clicked "I'm on my way".</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Export Daily Schedule</span>
              </button>
            </div>

            {/* Queue statistics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Total En-Route Commutes</span>
                <span className="font-mono text-3xl font-extrabold text-blue-600 block pt-1">
                  {liveQueue.filter(q => q.isOnMyWay && q.status !== 'completed').length}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Today's Remaining Sessions</span>
                <span className="font-mono text-3xl font-extrabold text-amber-500 block pt-1">
                  {liveQueue.filter(q => q.status === 'approved').length}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Today's Completed Treatments</span>
                <span className="font-mono text-3xl font-extrabold text-emerald-600 block pt-1">
                  {liveQueue.filter(q => q.status === 'completed').length}
                </span>
              </div>
            </div>

            {/* Patient commuters list */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Active Patient Line-up</span>
              </h3>

              <div className="space-y-3">
                {liveQueue.map((app) => (
                  <div key={app.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{app.patientName}</span>
                        <span className="text-xs bg-slate-50 dark:bg-slate-950 text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded font-medium">
                          {app.serviceName}
                        </span>
                        
                        {/* Glowing commuter badge */}
                        {app.isOnMyWay && app.status !== 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 font-bold px-2 py-0.5 rounded-full animate-pulse">
                            <Navigation className="w-3 h-3 fill-emerald-600" />
                            <span>On the Way!</span>
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4 text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock3 className="w-3.5 h-3.5 text-blue-500" />
                          <span>Slot: {app.timeSlot}</span>
                        </div>
                        {app.patientPhone && (
                          <span>Phone: {app.patientPhone}</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Approve completion, append files, add medical notes) */}
                    <div className="flex items-center gap-2">
                      {app.status === 'approved' ? (
                        <>
                          <button
                            onClick={() => handleComplete(app.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => {
                              setActiveNoteAppId(app.id);
                              setTempNoteText(app.notes || '');
                            }}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                          >
                            Add Medical Files
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Treatment Finalized</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {liveQueue.length === 0 && (
                  <p className="text-center text-xs text-slate-400 italic py-12">No patient sessions scheduled for today yet.</p>
                )}
              </div>
            </div>

            {/* Note attachment Modal Overlay */}
            {activeNoteAppId && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>Add Clinical Diagnosis File</span>
                    </h3>
                    <button onClick={() => setActiveNoteAppId(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                      <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={tempNoteText}
                    onChange={(e) => setTempNoteText(e.target.value)}
                    placeholder="Enter prescriptions, next follow-up dates, gums analysis files..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveMedicalNote(activeNoteAppId)}
                      className="flex-1 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      Save Secure Records
                    </button>
                    <button
                      onClick={() => setActiveNoteAppId(null)}
                      className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Availability status toggler */}
        {currentTab === 'status' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Instant Availability Status Controls</h2>
              <p className="text-xs text-slate-400">Instantly update the homepage status. Patients checking online will adjust their journeys immediately.</p>
            </div>

            {/* Quick-toggle triggers */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">One-Click Controls</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button
                    onClick={() => handleStatusChange('available')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex flex-col items-center gap-2 border transition cursor-pointer ${
                      availability?.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>🟢 Available</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('unavailable')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex flex-col items-center gap-2 border transition cursor-pointer ${
                      availability?.status === 'unavailable'
                        ? 'bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-800 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-5 h-5 text-slate-500" />
                    <span>🔴 Unavailable</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('lunch')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex flex-col items-center gap-2 border transition cursor-pointer ${
                      availability?.status === 'lunch'
                        ? 'bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>🟡 Lunch Break</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('vacation')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex flex-col items-center gap-2 border transition cursor-pointer ${
                      availability?.status === 'vacation'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-400'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-100'
                    }`}
                  >
                    <Plane className="w-5 h-5 text-indigo-500" />
                    <span>🌴 Vacation</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('emergency')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex flex-col items-center gap-2 border transition cursor-pointer ${
                      availability?.status === 'emergency'
                        ? 'bg-rose-50 text-rose-700 border-rose-400 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>🚨 Emergency</span>
                  </button>
                </div>
              </div>

              {/* Text Status details */}
              <form onSubmit={handleSaveStatusText} className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Custom Status Message</label>
                    <input
                      type="text"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      placeholder="e.g., Back at 4:00 PM. High traffic on sectors."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Next Available Appointment</label>
                    <input
                      type="text"
                      value={nextAvailableTime}
                      onChange={(e) => setNextAvailableTime(e.target.value)}
                      placeholder="e.g. Tomorrow 10:00 AM"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <label className="text-xs font-semibold text-slate-400">Estimated Walk-In Waiting Time (Minutes)</label>
                  <input
                    type="number"
                    value={estimatedWaitTime}
                    onChange={(e) => setEstimatedWaitTime(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Save Status Configuration
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Approvals management */}
        {currentTab === 'appointments' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Approve Appointment Bookings</h2>
              <p className="text-xs text-slate-400">Verify and authorize or decline incoming appointment requests from patients.</p>
            </div>

            <div className="space-y-3">
              {pendingApps.map((app) => (
                <div key={app.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.patientName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Requested: <strong className="text-blue-600">{app.serviceName}</strong> on {app.date} • {app.timeSlot}
                    </p>
                    {app.problemDescription && (
                      <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-slate-950 p-2 rounded-xl mt-2 max-w-xl">
                        "{app.problemDescription}"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(app.id, app.patientId, app.serviceName)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Approve Slot
                    </button>
                    <button
                      onClick={() => handleReject(app.id, app.patientId)}
                      className="bg-rose-50 text-rose-650 hover:bg-rose-100 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}

              {pendingApps.length === 0 && (
                <p className="text-center text-xs text-slate-400 italic py-12">No pending appointment approvals.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Manage Broadcaster */}
        {currentTab === 'announcements' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Homepage Broadcasts Banner</h2>
              <p className="text-xs text-slate-400">Directly update the banner alert shown at the very top of all pages.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm">
              <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Broadcast Banner Alert Text</label>
                  <textarea
                    rows={3}
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="🎉 e.g. Special Holiday Hours: Open until 3 PM today..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ann-active"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <label htmlFor="ann-active" className="text-xs font-semibold text-slate-500">
                    Enable Broadcaster Alert Live on Website
                  </label>
                </div>

                <button
                  type="submit"
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Broadcast Alert Now
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
