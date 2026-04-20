import { useEffect, useState } from 'react';

import { supabaseClient } from '@/api/supabase-client';
import { TabsLayoutProps } from '@/app/(tabs)/_layout';
import { countPendingInvites } from '@shared/planet-group-db';
import { countActiveBattles } from '@shared/planet-battle-db';

const BADGE_POLL_INTERVAL_IN_MS = 30_000;

export interface TabsLayoutFunc {
  /** Number of pending group invites for badge display */
  pendingInviteCount?: number;
  /** Number of active battles for badge display */
  activeBattleCount?: number;
}

export function useTabsLayout(_props: TabsLayoutProps): TabsLayoutFunc {
  const [pendingInviteCount, setPendingInviteCount] = useState<number>(0);
  const [activeBattleCount, setActiveBattleCount] = useState<number>(0);

  useEffect(() => {
    function fetchBadgeCounts(): void {
      countPendingInvites(supabaseClient)
        .then(setPendingInviteCount)
        .catch((error) => {
          // Non-critical background poll — warn only so monitoring isn't triggered
          console.warn('Failed to fetch pending invite count:', error);
        });

      countActiveBattles(supabaseClient)
        .then(setActiveBattleCount)
        .catch((error) => {
          // Non-critical background poll — warn only so monitoring isn't triggered
          console.warn('Failed to fetch active battle count:', error);
        });
    }

    fetchBadgeCounts();

    const intervalId = setInterval(fetchBadgeCounts, BADGE_POLL_INTERVAL_IN_MS);
    return () => clearInterval(intervalId);
  }, []);

  return {
    pendingInviteCount: pendingInviteCount > 0 ? pendingInviteCount : undefined,
    activeBattleCount: activeBattleCount > 0 ? activeBattleCount : undefined,
  };
}
