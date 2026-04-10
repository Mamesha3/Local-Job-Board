import { databases } from '@/lib/appwrite';
import { ID, Query, Models } from 'appwrite';
import { createNotification } from './notifications';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const JOBS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOBS!;
const COMPANIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMPANIES!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!;

export interface Job extends Models.Document {
  title: string;
  description: string;
  companyId: string;
  location: string;
  lat: number;
  lng: number;
  type: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  requirements: string[];
  status: 'active' | 'closed' | 'draft';
  isFeatured: boolean;
  featuredUntil: string;
  expiresAt: string;
  createdAt: string;
}

export async function getJobs(filters?: {
  category?: string;
  type?: string;
  location?: string;
  status?: string;
  datePosted?: string;
}) {
  const queries: string[] = [Query.equal('status', 'active')];

  if (filters?.category) {
    queries.push(Query.equal('category', filters.category));
  }
  if (filters?.type) {
    queries.push(Query.equal('type', filters.type));
  }
  if (filters?.location) {
    queries.push(Query.search('location', filters.location));
  }
  
  // Date filtering based on createdAt
  if (filters?.datePosted) {
    const now = new Date();
    let startDate: Date;
    
    switch (filters.datePosted) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;  
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate = new Date(0); // All time
      }
    
    queries.push(Query.greaterThanEqual('createdAt', startDate.toISOString()));
  }

  const response = await databases.listDocuments<Job>(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    queries
  );

  return response.documents;
}

export async function getJobById(jobId: string) {
  return await databases.getDocument<Job>(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    jobId
  );
}

export async function createJob(data: Omit<Job, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId' | '$sequence'>) {
  // Create the job
  const job = await databases.createDocument<Job>(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    ID.unique(),
    {
      ...data,
      createdAt: new Date().toISOString(),
    }
  );

  // Get company details for notification
  const company = await databases.getDocument(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    data.companyId
  );

  // Notify company that job was posted successfully
  if (company && company.userId) {
    await createNotification({
      userId: company.userId,
      title: 'Job Posted Successfully! ',
      message: `Your job "${data.title}" has been posted and is now live. Candidates can now apply!`,
      type: 'job',
      link: `/dashboard/company`
    });
  }

  // Notify all admins about new job for moderation
  const admins = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.equal('role', 'admin')]
  );

  for (const admin of admins.documents) {
    await createNotification({
      userId: admin.$id,
      title: 'New Job Posted for Review ',
      message: `"${data.title}" was posted by ${company?.name || 'a company'}. Review and moderate if needed.`,
      type: 'system',
      link: '/dashboard/admin'
    });
  }

  return job;
}

export async function updateJob(jobId: string, data: Partial<Job>) {
  return await databases.updateDocument<Job>(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    jobId,
    data
  );
}

export async function deleteJob(jobId: string) {
  return await databases.deleteDocument(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    jobId
  );
}

export async function getJobsByCompany(companyId: string) {
  const response = await databases.listDocuments<Job>(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    [Query.equal('companyId', companyId)]
  );

  return response.documents;
}
