import { Client, Databases, Users } from 'node-appwrite';

// Admin client with API key for server-side operations
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
  .setKey(process.env.APPWRITE_API_KEY!); // Server-side API key

export const databases = new Databases(client);
export const users = new Users(client);
