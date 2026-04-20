/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import { type GroupGroupIdUrlParams } from '@/app/group/[groupId]';
import CreateContainer from '@/app-pages/group/CreateContainer';

export type GroupCreateUrlParams = UnknownOutputParams;

export interface CreateProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: GroupCreateUrlParams;
  /**
   * Sets the navigation options using navigation.setOptions()
   * @param options The options to set
   * @returns void
   */
  setNavigationOptions: (options?: Record<string, any>) => void;

  /**
   * Cancel group creation and go back
   */
  onGoBack: () => void;
  /**
   * Navigate to newly created group
   */
  onNavigateToGroupDetail: (urlParams: GroupGroupIdUrlParams) => void;
}

/**
 * Create a new group
 */
export default function CreatePage(props: CreateProps): ReactNode {
  const { urlParams, setOptions, back, navigate } = useNav<GroupCreateUrlParams>({ auth: true });
  /**
   * Cancel group creation and go back
   */
  const onGoBack = () => {
    back();
  };
  /**
   * Navigate to newly created group
   */
  const onNavigateToGroupDetail = (urlParams: GroupGroupIdUrlParams) => {
    navigate({
      pathname: '/group/[groupId]',
      params: urlParams,
    });
  };

  return (
    <CreateContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
      onNavigateToGroupDetail={onNavigateToGroupDetail}
    />
  );
}
