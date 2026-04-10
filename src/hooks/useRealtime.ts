'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { client, databases } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const JOBS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_JOBS!;
const APPLICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_APPLICATIONS!;

export function useRealtimeNotifications() {
  const { user, role, profile } = useAuth();
  const { showToast } = useToast();
  const retryCount = useRef(0);
  const maxRetries = 3;
  const [usePolling, setUsePolling] = useState(false);
  const lastJobCheck = useRef<string | null>(null);
  const lastApplicationCheck = useRef<string | null>(null);

  const handleJobCreate = useCallback((event: any) => {
    console.log('[Realtime] Job event received:', event);
    const job = event.payload;
    
    // Only notify seekers about new jobs
    console.log('[Realtime] Current role:', role);
    if (role === 'seeker') {
      console.log('[Realtime] Showing toast for new job:', job.title);
      showToast({
        title: 'New Job Posted!',
        description: `${job.title} at ${job.location}`,
        type: 'info',
        action: {
          label: 'View',
          onClick: () => window.location.href = `/jobs/${job.$id}`,
        },
      });
    }
  }, [role, showToast]);

  const handleApplicationUpdate = useCallback((event: any) => {
    console.log('[Realtime] Application event received:', event);
    const application = event.payload;
    
    // Notify seeker when their application status changes
    if (role === 'seeker' && application.seekerId === user?.$id) {
      const statusMessages: Record<string, string> = {
        reviewed: 'Your application is being reviewed',
        shortlisted: 'Congratulations! You have been shortlisted',
        rejected: 'Your application was not selected',
        hired: 'Congratulations! You got the job!',
      };
      
      showToast({
        title: 'Application Update',
        description: statusMessages[application.status] || `Status updated to ${application.status}`,
        type: application.status === 'hired' || application.status === 'shortlisted' ? 'success' : 'info',
      });
    }
    
    // Notify company when they receive a new application
    if (role === 'company' && event.events?.includes('create')) {
      showToast({
        title: 'New Application Received!',
        description: 'Someone applied to your job posting',
        type: 'info',
        action: {
          label: 'View',
          onClick: () => window.location.href = '/dashboard/company',
        },
      });
    }
  }, [role, user?.$id, showToast]);

  // Polling fallback when WebSocket fails
  useEffect(() => {
    if (!user || !usePolling) return;

    console.log('[Realtime] Using polling fallback');
    
    // Immediate first check
    const checkForUpdates = async () => {
      try {
        // Poll for new jobs (for seekers)
        if (role === 'seeker') {
          const jobsResponse = await databases.listDocuments(
            DATABASE_ID,
            JOBS_COLLECTION_ID,
            [Query.orderDesc('$createdAt'), Query.limit(1)]
          );
          
          const latestJob = jobsResponse.documents[0];
          if (latestJob && latestJob.$id !== lastJobCheck.current) {
            if (lastJobCheck.current) {
              // Only notify if this isn't the first check
              showToast({
                title: 'New Job Posted!',
                description: `${latestJob.title} at ${latestJob.location}`,
                type: 'info',
                action: {
                  label: 'View',
                  onClick: () => window.location.href = `/jobs/${latestJob.$id}`,
                },
              });
            }
            lastJobCheck.current = latestJob.$id;
          }
        }

        // Poll for applications (for seekers - their own applications)
        if (role === 'seeker') {
          const appsResponse = await databases.listDocuments(
            DATABASE_ID,
            APPLICATIONS_COLLECTION_ID,
            [Query.equal('seekerId', user.$id), Query.orderDesc('$createdAt'), Query.limit(1)]
          );
          
          const latestApp = appsResponse.documents[0];
          if (latestApp && latestApp.$id !== lastApplicationCheck.current) {
            if (lastApplicationCheck.current) {
              showToast({
                title: 'Application Update!',
                description: `Status: ${latestApp.status}`,
                type: 'info',
                action: {
                  label: 'View',
                  onClick: () => window.location.href = '/dashboard/seeker',
                },
              });
            }
            lastApplicationCheck.current = latestApp.$id;
          }
        }
      } catch (error) {
        console.error('[Realtime] Polling error:', error);
      }
    };

    // Run immediately on mount
    checkForUpdates();
    
    const pollInterval = setInterval(checkForUpdates, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [user, role, profile, usePolling, showToast]);

  useEffect(() => {
    if (!user) {
      console.log('[Realtime] No user logged in, skipping subscription');
      return;
    }

    console.log('[Realtime] Setting up subscriptions for role:', role);
    console.log('[Realtime] Database ID:', DATABASE_ID);
    console.log('[Realtime] Jobs Collection ID:', JOBS_COLLECTION_ID);

    let jobsUnsubscribe: (() => void) | null = null;
    let applicationsUnsubscribe: (() => void) | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;

    // Set a timeout to detect if WebSocket fails to connect
    connectionTimeout = setTimeout(() => {
      if (retryCount.current < maxRetries) {
        console.log('[Realtime] WebSocket connection timeout, enabling polling fallback');
        setUsePolling(true);
        retryCount.current += 1;
      }
    }, 5000); // 5 second timeout

    try {
      // Subscribe to jobs collection for new job notifications
      jobsUnsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${JOBS_COLLECTION_ID}.documents`,
        (response) => {
          console.log('[Realtime] Jobs subscription event:', response);
          // Clear timeout on successful connection
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          if (response.events.includes('create')) {
            handleJobCreate(response);
          }
        }
      );

      console.log('[Realtime] Jobs subscription established');
      retryCount.current = 0;
    } catch (error) {
      console.error('[Realtime] Failed to subscribe to jobs:', error);
      setUsePolling(true);
    }

    try {
      // Subscribe to applications collection
      applicationsUnsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${APPLICATIONS_COLLECTION_ID}.documents`,
        (response) => {
          console.log('[Realtime] Applications subscription event:', response);
          if (response.events.includes('create') || response.events.includes('update')) {
            handleApplicationUpdate(response);
          }
        }
      );

      console.log('[Realtime] Applications subscription established');
    } catch (error) {
      console.error('[Realtime] Failed to subscribe to applications:', error);
      setUsePolling(true);
    }

    return () => {
      console.log('[Realtime] Cleaning up subscriptions');
      if (connectionTimeout) clearTimeout(connectionTimeout);
      if (jobsUnsubscribe) jobsUnsubscribe();
      if (applicationsUnsubscribe) applicationsUnsubscribe();
    };
  }, [user, role, handleJobCreate, handleApplicationUpdate]);
}
