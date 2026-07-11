import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  getDocs, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query,
  where
} from 'firebase/firestore';
import { Appointment, UserProfile, Review, ContactMessage } from '../types';
import { 
  Activity, 
  Users, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Smile, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  LogOut, 
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Database lists
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);

  // Tab
  const [currentTab, setCurrentTab] = useState<'analytics' | 'appointments' | 'users' | 'reviews' | 'messages'>('analytics');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
      return;
    }

    // 1. Listen for all appointments
    const unsubscribeAppointments = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    // 2. Listen for all registered users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsersList(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    });

    // 3. Listen for reviews
    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snap) => {
      setReviewsList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    });

    // 4. Listen for inbox messages
    const unsubscribeMessages = onSnapshot(collection(db, 'messages'), (snap) => {
      setMessagesList(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage)));
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeUsers();
      unsubscribeReviews();
      unsubscribeMessages();
    };
  }, [user]);

  // Moderation Actions
  const handleReviewApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'approved' });
      alert('✓ Review approved. It is now visible on the homepage.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'rejected' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark Contact Message as Read
  const handleMarkMessageRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Revenue estimation calculator: e.g. completed appointments * average cost
  const calculateRevenue = () => {
    const completedCount = appointments.filter(a => a.status === 'completed').length;
    return completedCount * 120; // Avg $120 per procedure
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 font-sans flex flex-col md:flex-row transition-all duration-300">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 space-y-8 shrink-0">
        <div className="text-center border-b border-slate-800 pb-6 space-y-3">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 font-bold text-xl rounded-full flex items-center justify-center mx-auto">
            A
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">Clinic Administrator</h3>
            <span className="text-[10px] bg-purple-500 text-white font-bold px-2.5 py-0.5 rounded-full uppercase">
              Admin Hub
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Clinic Analytics</span>
          </button>

          <button
            onClick={() => setCurrentTab('appointments')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'appointments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Manage Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('users')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Registered Patients ({usersList.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('reviews')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'reviews' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Smile className="w-4 h-4 shrink-0" />
            <span>Moderated Reviews ({reviewsList.filter(r => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('messages')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
              currentTab === 'messages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Inquiries Inbox ({messagesList.filter(m => !m.read).length})</span>
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
        
        {/* TAB 1: Clinical Analytics */}
        {currentTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Clinical Analytics Summary</h2>
              <p className="text-xs text-slate-400">Monthly overview of appointments, registered clients, patient reviews, and clinic revenue estimates.</p>
            </div>

            {/* Grid metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Patients Enrolled</span>
                <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white block">
                  {usersList.filter(u => u.role === 'patient').length}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
                <Calendar className="w-6 h-6 text-amber-500" />
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Appointments</span>
                <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white block">
                  {appointments.length}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
                <DollarSign className="w-6 h-6 text-emerald-500" />
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Revenue Estimate</span>
                <span className="font-mono text-3xl font-extrabold text-emerald-600 block">
                  ${calculateRevenue()}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-1">
                <MessageSquare className="w-6 h-6 text-purple-500" />
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Unread Messages</span>
                <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white block">
                  {messagesList.filter(m => !m.read).length}
                </span>
              </div>
            </div>

            {/* Recent inquiries preview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Recent Clinical Logs</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                <div className="py-3 flex justify-between text-xs text-slate-500">
                  <span>Standard Seeder Config Status</span>
                  <span className="font-mono text-emerald-600 font-bold">● Operational</span>
                </div>
                <div className="py-3 flex justify-between text-xs text-slate-500">
                  <span>Firebase Authentication Configuration</span>
                  <span className="font-mono text-emerald-600 font-bold">● Active</span>
                </div>
                <div className="py-3 flex justify-between text-xs text-slate-500">
                  <span>Real-time Doctor Sync</span>
                  <span className="font-mono text-emerald-600 font-bold">● Enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Global Appointments Ledger */}
        {currentTab === 'appointments' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Global Appointments Ledger</h2>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-150 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-850 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Date & Slot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{app.patientName}</td>
                      <td className="p-4 text-slate-500">{app.serviceName}</td>
                      <td className="p-4 font-mono text-slate-400">{app.date} @ {app.timeSlot}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-650'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            if (confirm('Delete this appointment record forever?')) {
                              await deleteDoc(doc(db, 'appointments', app.id));
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {appointments.length === 0 && (
                <p className="p-8 text-center text-xs text-slate-400 italic">No appointments booked yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Patients database list */}
        {currentTab === 'users' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Registered Patient Database</h2>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-150 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <th className="p-4">Display Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">User Role</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4 font-mono">Enrolled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {usersList.map((usr) => (
                    <tr key={usr.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{usr.displayName}</td>
                      <td className="p-4 text-slate-400">{usr.email}</td>
                      <td className="p-4 uppercase font-bold text-[10px] text-blue-600">{usr.role}</td>
                      <td className="p-4 text-slate-500">{usr.phoneNumber || 'Not provided'}</td>
                      <td className="p-4 text-slate-400 font-mono">
                        {usr.createdAt ? new Date(usr.createdAt.toDate ? usr.createdAt.toDate() : usr.createdAt).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Moderator Reviews panel */}
        {currentTab === 'reviews' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Moderated Patient Reviews</h2>
            
            <div className="space-y-3">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">{rev.patientName}</span>
                      <span className="text-amber-400 text-xs">{"★".repeat(rev.rating)}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        rev.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {rev.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{rev.comment}"</p>
                  </div>

                  <div className="flex gap-2">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => handleReviewApprove(rev.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => handleReviewReject(rev.id)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 text-[11px] font-medium text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleReviewDelete(rev.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {reviewsList.length === 0 && (
                <p className="text-center text-xs text-slate-400 italic py-12">No patient reviews submitted yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Message inbox */}
        {currentTab === 'messages' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Clinical Inquiries Inbox</h2>
            
            <div className="space-y-3">
              {messagesList.map((msg) => (
                <div key={msg.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  msg.read 
                    ? 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850' 
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{msg.name}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-medium">
                        {msg.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed max-w-xl">
                      {msg.message}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono flex gap-4">
                      <span>Email: {msg.email}</span>
                      {msg.phone && <span>Phone: {msg.phone}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!msg.read && (
                      <button
                        onClick={() => handleMarkMessageRead(msg.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleMessageDelete(msg.id)}
                      className="bg-rose-50 text-rose-600 hover:bg-rose-150 text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {messagesList.length === 0 && (
                <p className="text-center text-xs text-slate-400 italic py-12">No inquiries received in inbox.</p>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
