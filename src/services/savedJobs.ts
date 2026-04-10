import { databases, storage } from '@/lib/appwrite';
import { ID, Query, Models } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const SAVED_JOBS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SAVED_JOBS!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export interface SavedJob extends Models.Document {
  seekerId: string;
  jobId: string;
  savedAt: string;
}

export async function getSavedJobs(seekerId: string) {
  const response = await databases.listDocuments<SavedJob>(
    DATABASE_ID,
    SAVED_JOBS_COLLECTION_ID,
    [Query.equal('seekerId', seekerId), Query.orderDesc('$createdAt')]
  );
  return response.documents;
}

export async function saveJob(seekerId: string, jobId: string) {
  // Check if already saved
  const existing = await databases.listDocuments<SavedJob>(
    DATABASE_ID,
    SAVED_JOBS_COLLECTION_ID,
    [Query.equal('seekerId', seekerId), Query.equal('jobId', jobId)]
  );

  if (existing.documents.length > 0) {
    return existing.documents[0];
  }

  return await databases.createDocument<SavedJob>(
    DATABASE_ID,
    SAVED_JOBS_COLLECTION_ID,
    ID.unique(),
    {
      seekerId,
      jobId,
      savedAt: new Date().toISOString(),
    }
  );
}

export async function unsaveJob(savedJobId: string) {
  return await databases.deleteDocument(
    DATABASE_ID,
    SAVED_JOBS_COLLECTION_ID,
    savedJobId
  );
}

export async function isJobSaved(seekerId: string, jobId: string) {
  const response = await databases.listDocuments<SavedJob>(
    DATABASE_ID,
    SAVED_JOBS_COLLECTION_ID,
    [Query.equal('seekerId', seekerId), Query.equal('jobId', jobId)]
  );
  return response.documents[0] || null;
}
