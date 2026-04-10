import { databases, storage } from '@/lib/appwrite';
import { Models, ID } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export interface UserProfile extends Models.Document {
  role: 'seeker' | 'company' | 'employer';
  fullName: string;
  phone: string;
  email: string;
  bio?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  profilePictureId?: string;
}

export async function getUserProfile(userId: string) {
  const response = await databases.getDocument<UserProfile>(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    userId
  );
  return response;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'>>
) {
  return await databases.updateDocument<UserProfile>(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    userId,
    data
  );
}

export async function uploadProfilePicture(file: File) {
  return await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file
  );
}
