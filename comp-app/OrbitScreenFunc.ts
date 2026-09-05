import { useState, useEffect, useRef } from 'react';
import { Share } from 'react-native';

import { supabaseClient } from '@/api/supabase-client';
import {
  readOrbitData,
  sendOrbitChatMessage,
  readOrbitChatMessages,
} from '@shared/planet-merge-db';
import {
  type OrbitChatMessageV1,
  type OrbitScreenDataV1,
  type uuidstr,
} from '@shared/generated-db-types';

export type OrbitTab = 'CHAT' | 'MEMBERS';

export interface OrbitScreenProps {
  orbitData: OrbitScreenDataV1;
  onClose: () => void;
}

export interface OrbitScreenFunc {
  activeTab: OrbitTab;
  onTabChange: (tab: OrbitTab) => void;
  messages: OrbitChatMessageV1[];
  chatInput: string;
  onChatInputChange: (text: string) => void;
  onSendMessage: () => void;
  isSending: boolean;
  onShareOrbitInvite: () => void;
  currentUserId?: string;
}

export function useOrbitScreen(props: OrbitScreenProps): OrbitScreenFunc {
  const [activeTab, setActiveTab] = useState<OrbitTab>('CHAT');
  const [messages, setMessages] = useState<OrbitChatMessageV1[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const isMountedRef = useRef(true);
  const orbitChannelId = props.orbitData.orbitChannelId;

  useEffect(() => {
    isMountedRef.current = true;
    loadCurrentUserAsync().catch((err) => {
      console.error('useOrbitScreen loadUser error:', err);
    });
    if (props.orbitData.conversationId != null) {
      fetchMessagesAsync().catch((err) => {
        console.error('useOrbitScreen fetchMessages error:', err);
      });
    }
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function loadCurrentUserAsync(): Promise<void> {
    const { data } = await supabaseClient.auth.getUser();
    if (isMountedRef.current && data.user != null) {
      setCurrentUserId(data.user.id);
    }
  }

  async function fetchMessagesAsync(): Promise<void> {
    const msgs = await readOrbitChatMessages(supabaseClient, orbitChannelId);
    if (!isMountedRef.current) return;
    // Messages come in DESC order, reverse for display
    setMessages([...msgs].reverse());
  }

  function onTabChange(tab: OrbitTab): void {
    setActiveTab(tab);
  }

  function onChatInputChange(text: string): void {
    setChatInput(text);
  }

  function onSendMessage(): void {
    const text = chatInput.trim();
    if (text.length === 0 || isSending) return;
    sendMessageAsync(text).catch((err) => {
      console.error('useOrbitScreen onSendMessage error:', err);
      if (isMountedRef.current) {
        setIsSending(false);
      }
    });
  }

  async function sendMessageAsync(text: string): Promise<void> {
    setIsSending(true);
    setChatInput('');
    const msg = await sendOrbitChatMessage(supabaseClient, orbitChannelId, text);
    if (!isMountedRef.current) return;
    if (msg != null) {
      setMessages((prev) => [...prev, msg]);
    }
    setIsSending(false);
  }

  function onShareOrbitInvite(): void {
    const activityName = props.orbitData.activityName ?? 'our spot';
    const venueName = props.orbitData.activityAddress ?? 'tonight';
    Share.share({
      message: `We merged planets tonight 🌍 Join us for ${activityName} at ${venueName}. Get on the same planet.`,
    }).catch((err) => {
      console.error('useOrbitScreen onShareOrbitInvite error:', err);
    });
  }

  return {
    activeTab,
    onTabChange,
    messages,
    chatInput,
    onChatInputChange,
    onSendMessage,
    isSending,
    onShareOrbitInvite,
    currentUserId,
  };
}
