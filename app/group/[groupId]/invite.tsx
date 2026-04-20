/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type GroupGroupIdUrlParams } from '@/app/group/[groupId]';
import InviteContainer from '@/app-pages/group/[groupId]/InviteContainer';

export type GroupIdInviteUrlParams = UnknownOutputParams & {
  groupId: string;
};

export interface InviteProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: GroupIdInviteUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Return to group detail
   */
  onGoBack: () => void;
  /**
   * Return to group after sending invites
   */
  onNavigateToGroupDetail: (urlParams: GroupGroupIdUrlParams) => void;
}

/**
 * Invite friends or open group to nearby strangers
 */
export default function InvitePage(props: InviteProps): ReactNode {
  const { urlParams, setOptions, back, dismissTo } = useNav<GroupIdInviteUrlParams>({ auth: true });
  /**
   * Return to group detail
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Return to group after sending invites
   */
  const onNavigateToGroupDetail = (urlParams: GroupGroupIdUrlParams) => {
    dismissTo({
      pathname: '/group/[groupId]',
      params: urlParams,
    });
  };

  return (
    <InviteContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToGroupDetail={onNavigateToGroupDetail}
    />
  );
}
