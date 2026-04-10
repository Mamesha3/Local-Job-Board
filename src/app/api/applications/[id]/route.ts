import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite-admin';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const APPLICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APPLICATIONS!;

// DELETE /api/applications/[id] - Delete an application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await databases.deleteDocument(
      DATABASE_ID,
      APPLICATIONS_COLLECTION_ID,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete application' },
      { status: 500 }
    );
  }
}
