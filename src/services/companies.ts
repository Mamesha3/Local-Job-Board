import { databases, storage } from '@/lib/appwrite';
import { ID, Query, Models } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COMPANIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COMPANIES!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export interface Company extends Models.Document {
  name: string;
  description: string;
  logoId: string;
  ownerId: string;
  location: string;
  lat: number;
  lng: number;
  category: string[];
  website: string;
  isVerified: boolean;
  verifiedAt: string;
  createdAt: string;
}

export async function getCompanyById(companyId: string) {
  return await databases.getDocument<Company>(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    companyId
  );
}

export async function getCompanyByOwner(ownerId: string) {
  const response = await databases.listDocuments<Company>(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    [Query.equal('ownerId', ownerId)]
  );
  return response.documents[0] || null;
}

export async function createCompany(data: Omit<Company, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId' | '$sequence'>) {
  return await databases.createDocument<Company>(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    ID.unique(),
    {
      ...data,
      createdAt: new Date().toISOString(),
    }
  );
}

export async function updateCompany(companyId: string, data: Partial<Company>) {
  return await databases.updateDocument<Company>(
    DATABASE_ID,
    COMPANIES_COLLECTION_ID,
    companyId,
    data
  );
}

export async function uploadLogo(file: File) {
  return await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file
  );
}

export async function deleteLogo(logoId: string) {
  try {
    await storage.deleteFile(BUCKET_ID, logoId);
  } catch {
    // Ignore errors if file doesn't exist
  }
}

export function getLogoUrl(logoId: string) {
  return storage.getFileView(BUCKET_ID, logoId);
}
