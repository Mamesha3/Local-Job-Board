import { databases, storage } from '@/lib/appwrite';
import { ID, Query, Models } from 'appwrite';
import { createNotification } from './notifications';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const APPLICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APPLICATIONS!;
const DEFAULT_RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DEFAULT_RESUMES!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!;
const JOBS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOBS!;
const COMPANIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMPANIES!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export async function getUserProfile(userId: string) {
  const response = await databases.getDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    userId
  );
  return response;
}

export interface Application extends Models.Document {
  jobId: string;
  seekerId: string;
  resumeId: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface DefaultResume extends Models.Document {
  seekerId: string;
  resumeId: string;
  fileName: string;
  uploadedAt: string;
}

export async function getApplicationsBySeeker(seekerId: string) {
  const response = await databases.listDocuments<Application>(
    DATABASE_ID,
    APPLICATIONS_COLLECTION_ID,
    [Query.equal('seekerId', seekerId), Query.orderDesc('$createdAt')]
  );
  return response.documents;
}

export async function getApplicationsByJob(jobId: string) {
  const response = await databases.listDocuments<Application>(
    DATABASE_ID,
    APPLICATIONS_COLLECTION_ID,
    [Query.equal('jobId', jobId), Query.orderDesc('$createdAt')]
  );
  return response.documents;
}

export async function checkExistingApplication(jobId: string, seekerId: string): Promise<boolean> {
  const response = await databases.listDocuments<Application>(
    DATABASE_ID,
    APPLICATIONS_COLLECTION_ID,
    [
      Query.equal('jobId', jobId),
      Query.equal('seekerId', seekerId),
      Query.limit(1)
    ]
  );
  return response.documents.length > 0;
}

export async function createApplication(data: Omit<Application, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'>) {
  // Create the application
  const application = await databases.createDocument<Application>(
    DATABASE_ID,
    APPLICATIONS_COLLECTION_ID,
    ID.unique(),
    data
  );

  // Get job details to notify the company
  const job = await databases.getDocument(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    data.jobId
  );

  // Get seeker profile for the notification
  const seeker = await databases.getDocument(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    data.seekerId
  );

  // Notify the company user about new application
  // job.companyId is the company document ID, we need to get the company's userId
  if (job && job.companyId) {
    try {
      const company = await databases.getDocument(
        DATABASE_ID,
        COMPANIES_COLLECTION_ID,
        job.companyId
      );
      
      if (company && company.userId) {
        await createNotification({
          userId: company.userId,
          title: 'New Job Application! 📨',
          message: `${seeker?.fullName || 'A candidate'} has applied for "${job.title}". Review their application now.`,
          type: 'new_application',
          link: `/dashboard/company/applications/${data.jobId}`
        });
      }
    } catch (error) {
      // Silently fail if company not found, job still created
      console.error('Failed to notify company:', error);
    }
  }

  return application;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: Application['status']
) {
  // Get the application first to get seekerId and jobId
  const application = await databases.getDocument<Application>(
    DATABASE_ID,
    APPLICATIONS_COLLECTION_ID,
    applicationId
  );

  // Update the application status
  const updated = await databases.updateDocument<Application>(
    DATABASE_ID,
    APPLICATIONS_COLLECTION_ID,
    applicationId,
    { status }
  );

  // Get job details for the notification
  const job = await databases.getDocument(
    DATABASE_ID,
    JOBS_COLLECTION_ID,
    application.jobId
  );

  // Create notification for the seeker
  const statusMessages: Record<string, { title: string; message: string; type: 'application_accepted' | 'application_rejected' | 'application_reviewed' }> = {
    accepted: {
      title: 'Application Accepted! 🎉',
      message: `Your application for "${job.title}" has been accepted. The company will contact you soon.`,
      type: 'application_accepted'
    },
    rejected: {
      title: 'Application Not Selected',
      message: `Your application for "${job.title}" was not selected. Keep applying to other opportunities!`,
      type: 'application_rejected'
    },
    reviewed: {
      title: 'Application Under Review',
      message: `Your application for "${job.title}" is being reviewed by the company.`,
      type: 'application_reviewed'
    }
  };

  const notification = statusMessages[status];
  if (notification) {
    await createNotification({
      userId: application.seekerId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: `/dashboard/seeker`
    });
  }

  return updated;
}

export async function deleteApplication(applicationId: string) {
  // Use API route for elevated permissions
  const response = await fetch(`/api/applications/${applicationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete application');
  }

  return response.json();
}

export async function getDefaultResume(seekerId: string) {
  const response = await databases.listDocuments<DefaultResume>(
    DATABASE_ID,
    DEFAULT_RESUMES_COLLECTION_ID,
    [Query.equal('seekerId', seekerId)]
  );
  return response.documents[0] || null;
}

export async function saveDefaultResume(seekerId: string, file: File) {
  // Upload file to storage
  const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
  
  // Check if user already has a default resume
  const existing = await getDefaultResume(seekerId);
  
  if (existing) {
    // Delete old file
    await storage.deleteFile(BUCKET_ID, existing.resumeId);
    
    // Update document
    return await databases.updateDocument<DefaultResume>(
      DATABASE_ID,
      DEFAULT_RESUMES_COLLECTION_ID,
      existing.$id,
      {
        resumeId: uploadedFile.$id,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    );
  } else {
    // Create new document
    return await databases.createDocument<DefaultResume>(
      DATABASE_ID,
      DEFAULT_RESUMES_COLLECTION_ID,
      ID.unique(),
      {
        seekerId,
        resumeId: uploadedFile.$id,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    );
  }
}

export function getResumeDownloadUrl(resumeId: string) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.replace('/v1', '') || 'https://fra.cloud.appwrite.io';
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const bucket = BUCKET_ID;
  
  // Construct the download URL manually to avoid SDK GET request issues
  return `${endpoint}/v1/storage/buckets/${bucket}/files/${resumeId}/download?project=${project}`;
}
