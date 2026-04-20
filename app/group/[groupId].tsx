/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type GroupIdInviteUrlParams } from '@/app/group/[groupId]/invite';
import { type GroupIdBattleUrlParams } from '@/app/group/[groupId]/battle';
import { type GroupIdResultsUrlParams } from '@/app/group/[groupId]/results';
import { type ChatUrlParams } from '@/app/chat';
import GroupGroupIdContainer from '@/app-pages/group/GroupGroupIdContainer';

export type GroupGroupIdUrlParams = UnknownOutputParams & {
  groupId: string;
};

export interface GroupGroupIdProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: GroupGroupIdUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to groups list
   */
  onGoBack: () => void;
  /**
   * Invite friends to this group
   */
  onNavigateToInvite: (urlParams: GroupIdInviteUrlParams) => void;
  /**
   * Start or join voting battle
   */
  onNavigateToBattle: (urlParams: GroupIdBattleUrlParams) => void;
  /**
   * View current battle results
   */
  onNavigateToResults: (urlParams: GroupIdResultsUrlParams) => void;
  /**
   * Open group chat
   */
  onNavigateToChat: (urlParams?: ChatUrlParams) => void;
}

/**
 * Group detail view with members and current session
 */
export default function GroupGroupIdPage(props: GroupGroupIdProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<GroupGroupIdUrlParams>({ auth: true });
  /**
   * Return to groups list
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Invite friends to this group
   */
  const onNavigateToInvite = (urlParams: GroupIdInviteUrlParams) => {
    navigate({
      pathname: '/group/[groupId]/invite',
      params: urlParams,
    });
  };
  /**
   * Start or join voting battle
   */
  const onNavigateToBattle = (urlParams: GroupIdBattleUrlParams) => {
    navigate({
      pathname: '/group/[groupId]/battle',
      params: urlParams,
    });
  };
  /**
   * View current battle results
   */
  const onNavigateToResults = (urlParams: GroupIdResultsUrlParams) => {
    navigate({
      pathname: '/group/[groupId]/results',
      params: urlParams,
    });
  };
  /**
   * Open group chat
   */
  const onNavigateToChat = (urlParams?: ChatUrlParams) => {
    navigate({
      pathname: '/chat',
      params: urlParams,
    });
  };

  return (
    <GroupGroupIdContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToInvite={onNavigateToInvite}
      onNavigateToBattle={onNavigateToBattle}
      onNavigateToResults={onNavigateToResults}
      onNavigateToChat={onNavigateToChat}
    />
  );
}
