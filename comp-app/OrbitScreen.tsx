import { type ReactNode } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  FlatList,
  TextInput,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomTextField } from '@/comp-lib/core/custom-text-field/CustomTextField';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';
import { useOrbitScreenStyles } from './OrbitScreenStyles';
import { useOrbitScreen, type OrbitScreenProps, type OrbitTab } from './OrbitScreenFunc';
import type { OrbitChatMessageV1, OrbitMemberV1 } from '@shared/generated-db-types';

// ── Constants ──

const TODAY_DATE = new Date().toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

// ── Sub-components ──

interface MemberAvatarProps {
  initial: string;
  isFromOtherGroup: boolean;
  styles: ReturnType<typeof useOrbitScreenStyles>;
}

function MemberAvatar(props: MemberAvatarProps): ReactNode {
  return (
    <View style={{ position: 'relative' }}>
      <View
        style={[
          props.styles.memberAvatar,
          props.isFromOtherGroup ? props.styles.memberAvatarOther : undefined,
        ]}
      >
        <CustomTextField styles={props.styles.memberAvatarText} title={props.initial ?? '?'} />
      </View>
      {props.isFromOtherGroup && (
        <View style={props.styles.planetBadge}>
          <CustomTextField styles={props.styles.planetBadgeText} title="🌍" />
        </View>
      )}
    </View>
  );
}

interface TabBarProps {
  styles: ReturnType<typeof useOrbitScreenStyles>;
  activeTab: OrbitTab;
  onTabChange: (tab: OrbitTab) => void;
}

function TabBar(props: TabBarProps): ReactNode {
  return (
    <View style={props.styles.tabBar}>
      <Pressable style={props.styles.tab} onPress={() => props.onTabChange('CHAT')}>
        <CustomTextField
          styles={[
            props.styles.tabText,
            props.activeTab === 'CHAT' ? props.styles.tabTextActive : undefined,
          ]}
          title="CHAT"
        />
        {props.activeTab === 'CHAT' && <View style={props.styles.tabUnderline} />}
      </Pressable>
      <Pressable style={props.styles.tab} onPress={() => props.onTabChange('MEMBERS')}>
        <CustomTextField
          styles={[
            props.styles.tabText,
            props.activeTab === 'MEMBERS' ? props.styles.tabTextActive : undefined,
          ]}
          title="MEMBERS"
        />
        {props.activeTab === 'MEMBERS' && <View style={props.styles.tabUnderline} />}
      </Pressable>
    </View>
  );
}

interface MessageBubbleProps {
  message: OrbitChatMessageV1;
  isSelf: boolean;
  styles: ReturnType<typeof useOrbitScreenStyles>;
}

function MessageBubble(props: MessageBubbleProps): ReactNode {
  const { message, isSelf } = props;
  const timeLabel = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View
      style={[
        props.styles.messageBubble,
        isSelf ? props.styles.messageBubbleSelf : props.styles.messageBubbleOther,
      ]}
    >
      {!isSelf && message.authorName != null && (
        <CustomTextField styles={props.styles.messageAuthor} title={message.authorName} />
      )}
      <CustomTextField styles={props.styles.messageText} title={message.contentText ?? ''} />
      <CustomTextField styles={props.styles.messageTime} title={timeLabel} />
    </View>
  );
}

// ── Main Component ──

export default function OrbitScreen(props: OrbitScreenProps): ReactNode {
  const styles = useOrbitScreenStyles();
  const {
    activeTab,
    onTabChange,
    messages,
    chatInput,
    onChatInputChange,
    onSendMessage,
    isSending,
    onShareOrbitInvite,
    currentUserId,
  } = useOrbitScreen(props);

  const { orbitData } = props;
  const group1Name = orbitData.group1Name ?? 'Crew 1';
  const group2Name = orbitData.group2Name ?? 'Crew 2';
  const totalMembers = orbitData.group1MemberCount + orbitData.group2MemberCount;
  const members = orbitData.members ?? [];

  const renderMessage: ListRenderItem<OrbitChatMessageV1> = (info) => (
    <MessageBubble
      message={info.item}
      isSelf={info.item.authorUserId === currentUserId}
      styles={styles}
    />
  );

  const renderMember: ListRenderItem<OrbitMemberV1> = (info) => {
    const groupName = info.item.groupId === orbitData.group1Id ? group1Name : group2Name;
    return (
      <View style={styles.memberRow}>
        <View style={{ position: 'relative' }}>
          <View
            style={[
              styles.memberAvatar,
              info.item.isFromOtherGroup ? styles.memberAvatarOther : undefined,
            ]}
          >
            <CustomTextField
              styles={styles.memberAvatarText}
              title={info.item.initial ?? '?'}
            />
          </View>
          {info.item.isFromOtherGroup && (
            <View style={styles.planetBadge}>
              <CustomTextField styles={styles.planetBadgeText} title="🌍" />
            </View>
          )}
        </View>
        <View style={styles.memberInfo}>
          <CustomTextField
            styles={styles.memberName}
            title={info.item.displayName ?? 'Member'}
          />
          <CustomTextField styles={styles.memberGroupLabel} title={groupName} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <CustomTextField styles={styles.headerTitle} title="🌍 ORBIT" />
          <Pressable style={styles.closeButton} onPress={props.onClose}>
            <CustomTextField styles={styles.closeButtonText} title="✕" />
          </Pressable>
        </View>

        {/* Crew names */}
        <View style={styles.crewRow}>
          <CustomTextField styles={styles.crewNamesText} title={group1Name} />
          <CustomTextField styles={{ ...styles.crewNamesText, color: '#FF5C4D' }} title="⊕" />
          <CustomTextField styles={styles.crewNamesText} title={group2Name} />
        </View>
        <CustomTextField
          styles={styles.totalMembersText}
          title={`${totalMembers} people total · 2 crews`}
        />

        {/* Member avatars scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.memberScrollContent}
        >
          {members.map((member, index) => (
            <MemberAvatar
              key={`${member.userId}-${index}`}
              initial={member.initial ?? '?'}
              isFromOtherGroup={member.isFromOtherGroup}
              styles={styles}
            />
          ))}
        </ScrollView>

        {/* Activity card */}
        {orbitData.activityName != null && (
          <View style={styles.activityCard}>
            <CustomTextField styles={styles.activityName} title={orbitData.activityName} />
            {orbitData.activityAddress != null && (
              <CustomTextField styles={styles.activityVenue} title={orbitData.activityAddress} />
            )}
            <CustomTextField styles={styles.activityDate} title={TODAY_DATE} />
            <CustomTextField styles={styles.activityCrews} title="2 crews going" />
          </View>
        )}

        {/* Tab bar */}
        <TabBar styles={styles} activeTab={activeTab} onTabChange={onTabChange} />

        {/* Tab content */}
        {activeTab === 'CHAT' ? (
          <View style={styles.chatContainer}>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 4 }}
              showsVerticalScrollIndicator={false}
              inverted={false}
            />
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                value={chatInput}
                onChangeText={onChatInputChange}
                placeholder="Say something..."
                placeholderTextColor="rgba(255, 245, 236, 0.3)"
                multiline
              />
              <CustomButton
                styles={styles.chatSendButton}
                title="↑"
                onPress={onSendMessage}
                disabled={isSending || chatInput.trim().length === 0}
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 8, gap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Share button */}
        <View style={styles.bottomArea}>
          <CustomButton
            styles={styles.shareButton}
            title="SHARE ORBIT INVITE"
            onPress={onShareOrbitInvite}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
