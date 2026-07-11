export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  address?: string;
  medicalHistory?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  photoURL?: string;
  createdAt: any;
}

export interface DoctorProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  qualifications: string[];
  experience: number; // in years
  languages: string[];
  biography: string;
  specializations: string[];
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'lunch' | 'vacation' | 'emergency';

export interface DoctorAvailability {
  id: string; // 'current'
  status: AvailabilityStatus;
  statusText: string; // e.g., "I'll return at 4 PM."
  updatedAt: any;
  nextAvailableTime?: string; // e.g., "Today at 3:30 PM" or "Tomorrow at 10:00 AM"
  estimatedWaitTimeMinutes?: number;
  queueCount?: number;
}

export interface ClinicTiming {
  day: string; // Monday, Tuesday, etc.
  open: string; // e.g. "10:00 AM"
  close: string; // e.g. "07:00 PM"
  isClosed: boolean;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface DentalService {
  id: string;
  name: string;
  image: string;
  description: string;
  duration: number; // in minutes
  estimatedCost: string; // e.g., "$50 - $100"
  benefits: string[];
  recoveryTime: string;
}

export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'rescheduled' | 'completed';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:30 AM"
  duration: number; // minutes
  problemDescription: string;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  status: AppointmentStatus;
  createdAt: any;
  notes?: string; // medical notes added by doctor
  reportURL?: string; // optional uploaded file
  isOnMyWay?: boolean; // Patient click "I'm on my way"
  isOnMyWayTime?: any;
}

export interface Notification {
  id: string;
  userId: string; // target user
  title: string;
  message: string;
  type: 'appointment_created' | 'appointment_status' | 'announcement' | 'system_alert';
  read: boolean;
  createdAt: any;
}

export interface Review {
  id: string;
  patientId: string;
  patientName: string;
  patientPhoto?: string;
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  author: string;
  image: string;
  createdAt: any;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  image?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'clinic' | 'equipment' | 'treatment' | 'before_after';
  image: string;
}

export interface ClinicAnnouncement {
  id: string;
  content: string;
  active: boolean;
  createdAt: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: any;
  read: boolean;
}
