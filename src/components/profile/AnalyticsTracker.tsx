'use client';

import { useEffect, useRef } from 'react';
import { VisitSource } from '@/types/database';

interface AnalyticsTrackerProps {
  profileId: string;
  cardId?: string | null;
  source: VisitSource;
}

export function AnalyticsTracker({ profileId, cardId, source }: AnalyticsTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    async function sendVisitEvent() {
      try {
        // Record specific source visit event
        if (source === 'nfc') {
          await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: profileId,
              card_id: cardId || null,
              event_type: 'nfc_visit',
              source: 'nfc',
            }),
          });
        } else if (source === 'qr') {
          await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: profileId,
              card_id: cardId || null,
              event_type: 'qr_visit',
              source: 'qr',
            }),
          });
        }

        // Always record base profile_view
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: profileId,
            card_id: cardId || null,
            event_type: 'profile_view',
            source,
          }),
        });
      } catch (e) {
        console.warn('Analytics logging skipped:', e);
      }
    }

    sendVisitEvent();
  }, [profileId, cardId, source]);

  return null;
}

