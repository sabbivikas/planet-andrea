/**
 * AUTO-GENERATED - DO NOT MODIFY!
 * Any changes will be lost when the file is regenerated.
 */

import { type PropsWithChildren, type ReactNode } from 'react';
import { type UnknownOutputParams } from 'expo-router';

import { useNav } from '@/comp-lib/navigation/useNav';
import ChatContainer from '@/app-pages/ChatContainer';

export type ChatUrlParams = UnknownOutputParams;

export interface ChatProps extends PropsWithChildren {
  /**
   * The page's URL params. Includes path and query params.
   */
  urlParams: ChatUrlParams;
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
}

/**
 * Group chat for coordination
 */
export default function ChatPage(props: ChatProps): ReactNode {
  const { urlParams, setOptions, back } = useNav<ChatUrlParams>({ auth: true });
  /**
   * Return to group detail
   */
  const onGoBack = () => {
    back();
  };

  return (
    <ChatContainer
      children={props.children}
      urlParams={urlParams}
      setNavigationOptions={setOptions}
      onGoBack={onGoBack}
    />
  );
}
