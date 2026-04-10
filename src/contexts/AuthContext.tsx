'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { account, databases } from '@/lib/appwrite';
import { ID, Models } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!;

type UserRole = 'seeker' | 'company' | 'employer' | 'admin';

interface UserProfile extends Models.Document {
  role: UserRole;
  fullName: string;
  phone: string;
  email: string;
  status?: 'active' | 'suspended' | 'banned';
  bio?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
}

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: UserRole, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await account.get();
      setUser(session);
      
      // Fetch user profile to get role
      const userProfile = await databases.getDocument<UserProfile>(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        session.$id
      );
      setProfile(userProfile);
      // Map database roles to frontend roles
      const roleMap: Record<string, UserRole> = {
        'employer': 'company',
        'seeker': 'seeker',
        'admin': 'admin',
      };
      const userRole = roleMap[userProfile.role] || 'seeker';
      setRole(userRole);
      
      // Set user_role cookie for middleware access
      document.cookie = `user_role=${userRole}; path=/; max-age=86400`;
    } catch {
      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    await account.createEmailPasswordSession(email, password);
    await checkAuth();
  }

  async function register(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    phone: string
  ) {
    // Delete any existing session first
    try {
      await account.deleteSession('current');
    } catch {
      // No active session, that's fine
    }
    
    // Create account
    const newUser = await account.create(ID.unique(), email, password, fullName);
    
    // Create session
    await account.createEmailPasswordSession(email, password);
    
    // Map frontend role to database role
    let dbRole: string;
    if (role === 'company') {
      dbRole = 'employer';
    } else if (role === 'admin') {
      dbRole = 'admin';
    } else {
      dbRole = 'seeker';
    }
    
    // Create user profile in database
    await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      newUser.$id,
      {
        role: dbRole,
        fullName,
        phone,
        createdAt: new Date().toISOString(),
      }
    );

    await checkAuth();
  }

  async function logout() {
    await account.deleteSession('current');
    setUser(null);
    setProfile(null);
    setRole(null);
    // Clear user_role cookie
    document.cookie = 'user_role=; path=/; max-age=0';
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, role, loading, isLoading: loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

