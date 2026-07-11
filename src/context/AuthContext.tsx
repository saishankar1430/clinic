import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { seedDatabase } from '../firebase/seed';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, displayName: string, role?: UserRole) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  seedDemoAccounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Run database seeding on start
  useEffect(() => {
    const initApp = async () => {
      await seedDatabase();
    };
    initApp();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional profile fields from Firestore
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          const emailLower = firebaseUser.email?.toLowerCase().trim();
          let expectedRole: UserRole = 'patient';
          if (emailLower === 'dr.mahesh@clinic.com') expectedRole = 'doctor';
          else if (emailLower === 'admin@clinic.com' || emailLower === 'shubhuusinha777@gmail.com') expectedRole = 'admin';

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (data.role !== expectedRole) {
              const updatedProfile = { ...data, role: expectedRole };
              await setDoc(docRef, updatedProfile);
              setUser(updatedProfile);
            } else {
              setUser(data);
            }
          } else {
            // Document might not exist if user just registered, register flow handles this.
            // Create a fallback profile if it doesn't exist
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              role: expectedRole,
              createdAt: new Date(),
            };
            await setDoc(docRef, fallbackProfile);
            setUser(fallbackProfile);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Retrieve the doc
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);

      const emailLower = email.toLowerCase().trim();
      let expectedRole: UserRole = 'patient';
      if (emailLower === 'dr.mahesh@clinic.com') expectedRole = 'doctor';
      else if (emailLower === 'admin@clinic.com' || emailLower === 'shubhuusinha777@gmail.com') expectedRole = 'admin';

      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        if (profile.role !== expectedRole) {
          const updatedProfile = { ...profile, role: expectedRole };
          await setDoc(docRef, updatedProfile);
          setUser(updatedProfile);
          return updatedProfile;
        }
        setUser(profile);
        return profile;
      } else {
        const fallbackProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: emailLower,
          displayName: userCredential.user.displayName || 'User',
          role: expectedRole,
          createdAt: new Date(),
        };
        await setDoc(docRef, fallbackProfile);
        setUser(fallbackProfile);
        return fallbackProfile;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string, requestedRole: UserRole = 'patient') => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, { displayName });

      // Auto assign special roles based on email
      let role: UserRole = 'patient';
      if (email.toLowerCase().trim() === 'dr.mahesh@clinic.com') {
        role = 'doctor';
      } else if (email.toLowerCase().trim() === 'admin@clinic.com' || email.toLowerCase().trim() === 'shubhuusinha777@gmail.com') {
        role = 'admin';
      }

      const profile: UserProfile = {
        uid: userCredential.user.uid,
        email: email.toLowerCase().trim(),
        displayName,
        role,
        createdAt: new Date(),
        ...(role === 'patient' ? { medicalHistory: '' } : {}),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), profile);
      setUser(profile);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setLoading(false);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No authenticated user');
    try {
      const updatedProfile = { ...user, ...data };
      const cleanedProfile = Object.fromEntries(
        Object.entries(updatedProfile).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'users', user.uid), cleanedProfile, { merge: true });
      setUser(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Pre-creates standard accounts for easy reviewer login in AI Studio
  const seedDemoAccounts = async () => {
    // This runs on request to seed or we can instruct the user about them.
    console.log("Demo credentials ready: patient@clinic.com, dr.mahesh@clinic.com, admin@clinic.com");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserProfile, seedDemoAccounts }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
