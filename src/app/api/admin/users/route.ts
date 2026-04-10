import { NextRequest, NextResponse } from 'next/server';
import { databases, users } from '@/lib/appwrite-admin';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!;

// DELETE - Delete a user (requires admin API key)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Delete from database collection
    await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
    
    // Note: Deleting the auth user requires server-side API key
    // This is handled by the admin client
    try {
      await users.delete(userId);
    } catch {
      // Auth user might already be deleted or not exist
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user role
export async function PATCH(request: NextRequest) {
  try {
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role required' }, { status: 400 });
    }

    const result = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      { role }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
