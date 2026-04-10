import { databases, storage } from '@/lib/appwrite';
import { ID, Query, Models } from 'appwrite';
import { createNotification } from './notifications';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!;
const COMPANIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMPANIES!;
const JOBS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOBS!;
const APPLICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APPLICATIONS!;
const AUDIT_LOGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUDIT_LOGS || 'audit_logs';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

// User Management
export async function getAllUsers() {
  const response = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.orderDesc('$createdAt')]
  );
  return response.documents;
}

export async function getUserById(userId: string) {
  return await databases.getDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    userId
  );
}

// Note: status field doesn't exist in user schema, using role instead
export async function updateUserRole(userId: string, role: 'seeker' | 'company' | 'admin') {
  // Map frontend role to database role
  const dbRole = role === 'company' ? 'employer' : role;
  
  return await databases.updateDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    userId,
    { role: dbRole }
  );
}

export async function deleteUser(userId: string) {
  // Use API route for admin-level delete permissions
  const response = await fetch('/api/admin/users', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
  
  return response.json();
}

// Company Management
export async function getAllCompanies() {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    [Query.orderDesc('$createdAt')]
  );
  return response.documents;
}

export async function verifyCompany(companyId: string, isVerified: boolean) {
  // Get company details first for notification
  const company = await databases.getDocument(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    companyId
  );

  const updated = await databases.updateDocument(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    companyId,
    { 
      isVerified, 
      verifiedAt: isVerified ? new Date().toISOString() : '' 
    }
  );

  // Notify company user when verified
  if (isVerified && company.userId) {
    await createNotification({
      userId: company.userId,
      title: 'Company Verified! ✓',
      message: `Congratulations! Your company "${company.name}" has been verified. You can now post jobs and receive applications.`,
      type: 'company',
      link: '/dashboard/company'
    });
  }

  return updated;
}

export async function deleteCompany(companyId: string, logoId?: string) {
  // Delete logo if exists
  if (logoId) {
    try {
      await storage.deleteFile(BUCKET_ID, logoId);
    } catch {
      // Logo might not exist
    }
  }
  return await databases.deleteDocument(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    companyId
  );
}

// Job Moderation
export async function getAllJobs() {
  const response = await databases.listDocuments(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    [Query.orderDesc('$createdAt')]
  );
  return response.documents;
}

export async function moderateJob(jobId: string, action: 'approve' | 'reject' | 'feature' | 'unfeature', reason?: string) {
  const updates: any = {};
  
  if (action === 'approve') {
    updates.status = 'active';
    updates.rejectionReason = null;
  } else if (action === 'reject') {
    updates.status = 'closed';
    updates.rejectionReason = reason || '';
  } else if (action === 'feature') {
    updates.isFeatured = true;
    updates.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else if (action === 'unfeature') {
    updates.isFeatured = false;
    updates.featuredUntil = null;
  }

  return await databases.updateDocument(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    jobId,
    updates
  );
}

export async function deleteJob(jobId: string) {
  return await databases.deleteDocument(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    jobId
  );
}

// Statistics
export interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  pendingVerifications: number;
  pendingFeaturedJobs: number;
  activeJobs: number;
  suspendedUsers: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [users, companies, jobs, applications] = await Promise.all([
    databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, []),
    databases.listDocuments(DATABASE_ID, COMPANIES_COLLECTION_ID, []),
    databases.listDocuments(DATABASE_ID, JOBS_COLLECTION_ID, []),
    databases.listDocuments(DATABASE_ID, APPLICATIONS_COLLECTION_ID, []),
  ]);

  const pendingVerifications = companies.documents.filter(c => !c.isVerified).length;
  const pendingFeaturedJobs = jobs.documents.filter(j => j.isFeatured && j.status === 'pending').length;
  const activeJobs = jobs.documents.filter(j => j.status === 'active').length;
  const suspendedUsers = users.documents.filter(u => u.status === 'suspended' || u.status === 'banned').length;

  return {
    totalUsers: users.total,
    totalCompanies: companies.total,
    totalJobs: jobs.total,
    totalApplications: applications.total,
    pendingVerifications,
    pendingFeaturedJobs,
    activeJobs,
    suspendedUsers,
  };
}

// Audit Logs
export interface AuditLog extends Models.Document {
  action: string;
  performedBy: string;
  targetType: 'user' | 'company' | 'job' | 'application';
  targetId: string;
  details: string;
  ipAddress?: string;
}

export async function createAuditLog(data: Omit<AuditLog, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'>) {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      AUDIT_LOGS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error: any) {
    // Collection doesn't exist yet - log to console instead
    if (error?.code === 404 || error?.response?.code === 404) {
      console.warn('Audit logs collection not found. Please create it in Appwrite console.');
      console.log('Audit log:', data);
      return null;
    }
    throw error;
  }
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  try {
    const response = await databases.listDocuments<AuditLog>(
      DATABASE_ID,
      AUDIT_LOGS_COLLECTION_ID,
      [Query.orderDesc('$createdAt'), Query.limit(limit)]
    );
    return response.documents;
  } catch (error: any) {
    // Collection doesn't exist yet - return empty array
    if (error?.code === 404 || error?.response?.code === 404) {
      console.warn('Audit logs collection not found. Please create it in Appwrite console.');
      return [];
    }
    throw error;
  }
}
