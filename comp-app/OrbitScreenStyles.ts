import { ViewStyle, TextStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

export interface OrbitScreenStyles {
  overlay: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  closeButton: ViewStyle;
  closeButtonText: TextStyle;
  crewRow: ViewStyle;
  crewNamesText: TextStyle;
  totalMembersText: TextStyle;
  memberScrollContent: ViewStyle;
  memberAvatar: ViewStyle;
  memberAvatarOther: ViewStyle;
  memberAvatarText: TextStyle;
  planetBadge: ViewStyle;
  planetBadgeText: TextStyle;
  activityCard: ViewStyle;
  activityName: TextStyle;
  activityVenue: TextStyle;
  activityDate: TextStyle;
  activityCrews: TextStyle;
  tabBar: ViewStyle;
  tab: ViewStyle;
  tabText: TextStyle;
  tabTextActive: TextStyle;
  tabUnderline: ViewStyle;
  chatContainer: ViewStyle;
  messagesList: ViewStyle;
  messageBubble: ViewStyle;
  messageBubbleOther: ViewStyle;
  messageBubbleSelf: ViewStyle;
  messageAuthor: TextStyle;
  messageText: TextStyle;
  messageTime: TextStyle;
  chatInputRow: ViewStyle;
  chatInput: TextStyle;
  chatSendButton: CustomButtonStyles;
  membersListContent: ViewStyle;
  memberRow: ViewStyle;
  memberInfo: ViewStyle;
  memberName: TextStyle;
  memberGroupLabel: TextStyle;
  shareButton: CustomButtonStyles;
  bottomArea: ViewStyle;
}

export function useOrbitScreenStyles(): OrbitScreenStyles {
  const { buttonPresets, overrideStyles } = useStyleContext();

  const AVATAR_SIZE = 40;

  return {
    overlay: {
      flex: 1,
      backgroundColor: '#1B2A4A',
    },
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 12,
      position: 'relative',
    },
    headerTitle: {
      fontFamily: 'comba',
      fontSize: 22,
      color: '#FFF5EC',
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      right: 24,
      top: 16,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 18,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    crewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 24,
      marginBottom: 4,
    },
    crewNamesText: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: '#FFF5EC',
      textAlign: 'center',
    },
    totalMembersText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      color: '#CFFF47',
      textAlign: 'center',
      marginBottom: 16,
    },
    memberScrollContent: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      gap: 10,
      paddingBottom: 16,
      alignItems: 'center',
    },
    memberAvatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: 'rgba(255, 245, 236, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 245, 236, 0.2)',
    },
    memberAvatarOther: {
      borderColor: '#FF5C4D',
      borderWidth: 2,
    },
    memberAvatarText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    planetBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#FF5C4D',
      alignItems: 'center',
      justifyContent: 'center',
    },
    planetBadgeText: {
      fontSize: 8,
      color: '#FFF5EC',
    },
    activityCard: {
      backgroundColor: '#243660',
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 24,
      marginBottom: 16,
      gap: 4,
    },
    activityName: {
      fontFamily: 'strenuous',
      fontSize: 20,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    activityVenue: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: 'rgba(255, 245, 236, 0.6)',
    },
    activityDate: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      color: '#CFFF47',
    },
    activityCrews: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 245, 236, 0.08)',
      marginBottom: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      position: 'relative',
    },
    tabText: {
      fontFamily: 'strenuous',
      fontSize: 13,
      fontWeight: '700',
      color: 'rgba(255, 245, 236, 0.5)',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    tabTextActive: {
      color: '#FF5C4D',
    },
    tabUnderline: {
      position: 'absolute',
      bottom: 0,
      left: '20%',
      right: '20%',
      height: 2,
      backgroundColor: '#FF5C4D',
      borderRadius: 1,
    },
    chatContainer: {
      flex: 1,
    },
    messagesList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    messageBubble: {
      maxWidth: '75%',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 8,
      gap: 2,
    },
    messageBubbleOther: {
      backgroundColor: '#243660',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
    },
    messageBubbleSelf: {
      backgroundColor: '#3a5a8a',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    messageAuthor: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: '#CFFF47',
    },
    messageText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: '#FFF5EC',
      lineHeight: 20,
    },
    messageTime: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 10,
      color: 'rgba(255, 245, 236, 0.4)',
      alignSelf: 'flex-end',
    },
    chatInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 245, 236, 0.08)',
      backgroundColor: '#1B2A4A',
    },
    chatInput: {
      flex: 1,
      backgroundColor: 'rgba(255, 245, 236, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255, 245, 236, 0.12)',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: '#FFF5EC',
      minHeight: 44,
    },
    chatSendButton: overrideStyles(buttonPresets.Primary, {
      container: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#CFFF47',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: '#B8E63E',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 18,
        color: '#2D2D2D',
      },
    }),
    membersListContent: {
      flex: 1,
      paddingHorizontal: 24,
      gap: 12,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 4,
    },
    memberInfo: {
      flex: 1,
      gap: 2,
    },
    memberName: {
      fontFamily: 'strenuous',
      fontSize: 15,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    memberGroupLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    shareButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: '#FF5C4D',
        borderRadius: 14,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      pressedContainer: {
        backgroundColor: '#e04e40',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        fontSize: 16,
        color: '#FFF5EC',
      },
    }),
    bottomArea: {
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 12,
    },
  };
}
