/**
 * Styling for the Battle page — 3-stage voting battle with mini games
 */
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { CustomButtonStyles } from '@/comp-lib/core/custom-button/CustomButtonStyles';

// ── Style interfaces ──

export interface BattleBaseStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
}

export interface BattleHeaderStyles {
  container: ViewStyle;
  backButton: ViewStyle;
  titleArea: ViewStyle;
  titleText: TextStyle;
  timerContainer: ViewStyle;
  timerText: TextStyle;
}

export interface MemberStatusStyles {
  container: ViewStyle;
  votedLabel: TextStyle;
  avatarRow: ViewStyle;
  avatarWrapper: ViewStyle;
  avatar: ViewStyle;
  avatarText: TextStyle;
  statusLabel: TextStyle;
  statusVoted: TextStyle;
  statusPlaying: TextStyle;
  statusWaiting: TextStyle;
  statusForfeited: TextStyle;
}

export interface ActivityCardStyles {
  container: ViewStyle;
  image: ImageStyle;
  infoArea: ViewStyle;
  titleText: TextStyle;
  venueText: TextStyle;
  voteCountText: TextStyle;
  progressBarTrack: ViewStyle;
  progressBarFill: ViewStyle;
  radioOuter: ViewStyle;
  radioOuterActive: ViewStyle;
  radioInner: ViewStyle;
}

export interface PlayToVoteButtonStyles {
  container: ViewStyle;
  text: TextStyle;
}

export interface AlreadyPlayedBannerStyles {
  container: ViewStyle;
  containerForfeited: ViewStyle;
  containerLocked: ViewStyle;
  containerExpired: ViewStyle;
  text: TextStyle;
}

export interface RpsStyles {
  container: ViewStyle;
  gameHeader: TextStyle;
  gameSubtitle: TextStyle;
  roundLabel: TextStyle;
  countdownText: TextStyle;
  choiceButton: ViewStyle;
  choiceEmoji: TextStyle;
  choiceLabel: TextStyle;
  resultBanner: TextStyle;
  resultBannerLose: TextStyle;
  resultBannerDraw: TextStyle;
  winLoseRow: ViewStyle;
  appChoiceLabel: TextStyle;
}

export interface TriviaStyles {
  container: ViewStyle;
  header: TextStyle;
  timerText: TextStyle;
  questionText: TextStyle;
  answerButton: ViewStyle;
  answerButtonCorrect: ViewStyle;
  answerButtonWrong: ViewStyle;
  answerText: TextStyle;
  answerTextSelected: TextStyle;
  resultText: TextStyle;
  resultTextWrong: TextStyle;
}

export interface ReactionStyles {
  container: ViewStyle;
  containerGreen: ViewStyle;
  containerRed: ViewStyle;
  readyText: TextStyle;
  readyTextGreen: TextStyle;
  hintText: TextStyle;
  tapNowText: TextStyle;
  tooEarlyText: TextStyle;
  reactionTimeText: TextStyle;
  leaderboardTitle: TextStyle;
  leaderboardItem: TextStyle;
  leaderboardItemMe: TextStyle;
  statusText: TextStyle;
  statusTextFastest: TextStyle;
  // Result (DONE phase) styles
  resultWrapper: ViewStyle;
  yourTimeLabel: TextStyle;
  yourTimeValue: TextStyle;
  statusHeadline: TextStyle;
  statusHeadlineBeaten: TextStyle;
  statusSubtext: TextStyle;
  leaderboardLabel: TextStyle;
  leaderboardRow: ViewStyle;
  leaderboardRowMe: ViewStyle;
  leaderboardLeftBar: ViewStyle;
  leaderboardContent: ViewStyle;
  leaderboardRank: TextStyle;
  leaderboardName: TextStyle;
  leaderboardTime: TextStyle;
  buttonsArea: ViewStyle;
  lockInButton: ViewStyle;
  lockInButtonText: TextStyle;
  backBattleButton: ViewStyle;
  backBattleButtonText: TextStyle;
  secondaryLinkText: TextStyle;
}

export interface WinScreenStyles {
  container: ViewStyle;
  emoji: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  activityCard: ViewStyle;
  activityCardSelected: ViewStyle;
  activityImage: ImageStyle;
  activityTitle: TextStyle;
  activityVenue: TextStyle;
  radioOuter: ViewStyle;
  radioOuterActive: ViewStyle;
  radioInner: ViewStyle;
  confirmButton: CustomButtonStyles;
}

export interface ForfeitScreenStyles {
  container: ViewStyle;
  emoji: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  backButton: CustomButtonStyles;
}

export interface ResultScreenStyles {
  container: ViewStyle;
  winnerTitle: TextStyle;
  winnerVenue: TextStyle;
  planSetText: TextStyle;
  voteRow: ViewStyle;
  voteRowName: TextStyle;
  voteBarTrack: ViewStyle;
  voteBarFill: ViewStyle;
  voteRowCount: TextStyle;
  backLink: TextStyle;
}

export interface BattleStyles {
  styles: BattleBaseStyles;
  headerStyles: BattleHeaderStyles;
  memberStatusStyles: MemberStatusStyles;
  activityCardStyles: ActivityCardStyles;
  playToVoteButtonStyles: PlayToVoteButtonStyles;
  alreadyPlayedBannerStyles: AlreadyPlayedBannerStyles;
  rpsStyles: RpsStyles;
  triviaStyles: TriviaStyles;
  reactionStyles: ReactionStyles;
  winScreenStyles: WinScreenStyles;
  forfeitScreenStyles: ForfeitScreenStyles;
  resultScreenStyles: ResultScreenStyles;
}

export function useBattleStyles(): BattleStyles {
  const { createAppPageStyles, buttonPresets, overrideStyles } = useStyleContext();

  const styles: BattleBaseStyles = {
    safeArea: {
      flex: 1,
      backgroundColor: '#1B2A4A',
    },
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
    },
  };

  const headerStyles: BattleHeaderStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleArea: {
      flex: 1,
      alignItems: 'center',
    },
    titleText: {
      fontFamily: 'strenuous',
      fontSize: 18,
      fontWeight: '700',
      color: '#FFF5EC',
      textAlign: 'center',
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timerText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: '#CFFF47',
      fontWeight: '700',
    },
  };

  const AVATAR_SIZE = 32;

  const memberStatusStyles: MemberStatusStyles = {
    container: {
      paddingHorizontal: 16,
      gap: 8,
    },
    votedLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.6)',
    },
    avatarRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      flexWrap: 'wrap',
    },
    avatarWrapper: {
      alignItems: 'center',
      gap: 2,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: '#243660',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#3a4a6b',
    },
    avatarText: {
      fontFamily: 'strenuous',
      fontSize: 13,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    statusLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 9,
    },
    statusVoted: {
      color: '#CFFF47',
    },
    statusPlaying: {
      color: '#FF5C4D',
    },
    statusWaiting: {
      color: 'rgba(255, 245, 236, 0.4)',
    },
    statusForfeited: {
      color: 'rgba(255, 92, 77, 0.6)',
    },
  };

  const activityCardStyles: ActivityCardStyles = {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      backgroundColor: '#243660',
      borderRadius: 12,
      padding: 10,
      marginBottom: 8,
      height: 72,
      gap: 10,
    },
    image: {
      width: 56,
      height: 56,
      borderRadius: 8,
    },
    infoArea: {
      flex: 1,
      gap: 2,
    },
    titleText: {
      fontFamily: 'strenuous',
      fontSize: 15,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    venueText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    voteCountText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.4)',
    },
    progressBarTrack: {
      height: 4,
      backgroundColor: '#3a4a6b',
      borderRadius: 2,
      marginTop: 2,
    },
    progressBarFill: {
      height: 4,
      backgroundColor: '#FF5C4D',
      borderRadius: 2,
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#3a4a6b',
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterActive: {
      borderColor: '#CFFF47',
      backgroundColor: '#CFFF47',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#1B2A4A',
    },
  };

  const playToVoteButtonStyles: PlayToVoteButtonStyles = {
    container: {
      marginHorizontal: 16,
      marginBottom: 40,
      marginTop: 12,
      height: 52,
      borderRadius: 14,
      backgroundColor: '#CFFF47',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontFamily: 'strenuous',
      fontWeight: '700',
      fontSize: 16,
      color: '#2D2D2D',
    },
  };

  const alreadyPlayedBannerStyles: AlreadyPlayedBannerStyles = {
    container: {
      marginHorizontal: 16,
      marginBottom: 40,
      marginTop: 12,
      height: 52,
      borderRadius: 14,
      backgroundColor: '#243660',
      borderWidth: 2,
      borderColor: '#3a4a6b',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    containerForfeited: {
      borderColor: 'rgba(255, 92, 77, 0.4)',
      backgroundColor: 'rgba(255, 92, 77, 0.1)',
    },
    containerLocked: {
      borderColor: 'rgba(207, 255, 71, 0.4)',
      backgroundColor: 'rgba(207, 255, 71, 0.08)',
    },
    containerExpired: {
      borderColor: 'rgba(255, 245, 236, 0.2)',
      backgroundColor: 'rgba(255, 245, 236, 0.05)',
    },
    text: {
      fontFamily: 'strenuous',
      fontWeight: '700',
      fontSize: 15,
      color: '#FFF5EC',
      textAlign: 'center',
    },
  };

  const rpsStyles: RpsStyles = {
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    gameHeader: {
      fontFamily: 'strenuous',
      fontSize: 20,
      fontWeight: '700',
      color: '#FFF5EC',
      textAlign: 'center',
      marginBottom: 4,
    },
    gameSubtitle: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      marginBottom: 24,
    },
    roundLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: '#CFFF47',
      textAlign: 'center',
      marginBottom: 12,
    },
    countdownText: {
      fontFamily: 'comba',
      fontSize: 80,
      color: '#CFFF47',
      textAlign: 'center',
    },
    choiceButton: {
      width: '100%',
      height: 72,
      backgroundColor: '#243660',
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 12,
    },
    choiceEmoji: {
      fontSize: 32,
    },
    choiceLabel: {
      fontFamily: 'strenuous',
      fontSize: 18,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    resultBanner: {
      fontFamily: 'strenuous',
      fontSize: 36,
      fontWeight: '700',
      color: '#CFFF47',
      textAlign: 'center',
    },
    resultBannerLose: {
      color: '#FF5C4D',
    },
    resultBannerDraw: {
      color: '#FFF5EC',
    },
    winLoseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 16,
    },
    appChoiceLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      marginTop: 8,
    },
  };

  const triviaStyles: TriviaStyles = {
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    header: {
      fontFamily: 'strenuous',
      fontSize: 22,
      fontWeight: '700',
      color: '#FFF5EC',
      textAlign: 'center',
      marginBottom: 8,
    },
    timerText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: '#CFFF47',
      position: 'absolute',
      top: 24,
      right: 16,
    },
    questionText: {
      fontFamily: 'strenuous',
      fontSize: 18,
      color: '#FFF5EC',
      textAlign: 'center',
      paddingHorizontal: 8,
      marginVertical: 24,
    },
    answerButton: {
      backgroundColor: '#243660',
      borderRadius: 14,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    answerButtonCorrect: {
      backgroundColor: '#CFFF47',
    },
    answerButtonWrong: {
      backgroundColor: '#FF5C4D',
    },
    answerText: {
      fontFamily: 'strenuous',
      fontSize: 16,
      color: '#FFF5EC',
      textAlign: 'center',
    },
    answerTextSelected: {
      color: '#2D2D2D',
    },
    resultText: {
      fontFamily: 'strenuous',
      fontSize: 18,
      color: '#CFFF47',
      textAlign: 'center',
      marginTop: 16,
    },
    resultTextWrong: {
      color: '#FF5C4D',
    },
  };

  const reactionStyles: ReactionStyles = {
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    containerGreen: {
      backgroundColor: '#CFFF47',
    },
    containerRed: {
      backgroundColor: '#FF5C4D',
    },
    readyText: {
      fontFamily: 'comba',
      fontSize: 48,
      color: '#FFF5EC',
      textAlign: 'center',
    },
    readyTextGreen: {
      color: '#2D2D2D',
    },
    hintText: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      marginTop: 8,
    },
    tapNowText: {
      fontFamily: 'comba',
      fontSize: 72,
      color: '#2D2D2D',
      textAlign: 'center',
    },
    tooEarlyText: {
      fontFamily: 'strenuous',
      fontSize: 20,
      fontWeight: '700',
      color: '#FF5C4D',
      textAlign: 'center',
    },
    reactionTimeText: {
      fontFamily: 'comba',
      fontSize: 48,
      color: '#CFFF47',
      textAlign: 'center',
    },
    leaderboardTitle: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.4)',
      textAlign: 'center',
      marginTop: 24,
      marginBottom: 4,
    },
    leaderboardItem: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 14,
      color: '#FFF5EC',
      textAlign: 'center',
      marginTop: 4,
    },
    leaderboardItemMe: {
      color: '#CFFF47',
      fontWeight: '700',
    },
    statusText: {
      fontFamily: 'strenuous',
      fontSize: 18,
      fontWeight: '700',
      color: '#CFFF47',
      textAlign: 'center',
      marginTop: 20,
    },
    statusTextFastest: {
      color: '#CFFF47',
    },
    // ── Result (DONE phase) ──
    resultWrapper: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    yourTimeLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.5)',
      textAlign: 'center',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    yourTimeValue: {
      fontFamily: 'comba',
      fontSize: 44,
      color: '#CFFF47',
      textAlign: 'center',
      marginTop: 4,
    },
    statusHeadline: {
      fontFamily: 'strenuous',
      fontSize: 20,
      fontWeight: '700',
      color: '#CFFF47',
      textAlign: 'center',
      marginTop: 16,
    },
    statusHeadlineBeaten: {
      fontSize: 18,
      color: '#FF5C4D',
    },
    statusSubtext: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      marginTop: 4,
    },
    leaderboardLabel: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 11,
      color: 'rgba(255, 245, 236, 0.4)',
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 6,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    leaderboardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      borderRadius: 8,
      marginBottom: 2,
      overflow: 'hidden',
    },
    leaderboardRowMe: {
      backgroundColor: '#2a3d6b',
    },
    leaderboardLeftBar: {
      width: 2,
      alignSelf: 'stretch',
      backgroundColor: '#FF5C4D',
    },
    leaderboardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingHorizontal: 10,
    },
    leaderboardRank: {
      fontFamily: 'strenuous',
      fontSize: 13,
      fontWeight: '700',
      color: '#CFFF47',
      width: 24,
    },
    leaderboardName: {
      fontFamily: 'strenuous',
      fontSize: 13,
      fontWeight: '700',
      color: '#FFF5EC',
      flex: 1,
      textAlign: 'center',
    },
    leaderboardTime: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 13,
      color: '#CFFF47',
    },
    buttonsArea: {
      paddingBottom: 40,
    },
    lockInButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: '#CFFF47',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    lockInButtonText: {
      fontFamily: 'strenuous',
      fontWeight: '700',
      fontSize: 16,
      color: '#2D2D2D',
    },
    backBattleButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: '#243660',
      borderWidth: 2,
      borderColor: '#3a4a6b',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    backBattleButtonText: {
      fontFamily: 'strenuous',
      fontWeight: '700',
      fontSize: 16,
      color: '#FFF5EC',
    },
    secondaryLinkText: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: '#FF5C4D',
      textAlign: 'center',
    },
  };

  const winScreenStyles: WinScreenStyles = {
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 60,
    },
    emoji: {
      fontSize: 64,
      textAlign: 'center',
      marginBottom: 16,
    },
    title: {
      fontFamily: 'comba',
      fontSize: 36,
      color: '#CFFF47',
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: 'strenuous',
      fontSize: 18,
      color: '#FFF5EC',
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 24,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      backgroundColor: '#243660',
      borderRadius: 12,
      padding: 10,
      marginBottom: 8,
      height: 72,
      gap: 10,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    activityCardSelected: {
      borderColor: '#CFFF47',
    },
    activityImage: {
      width: 56,
      height: 56,
      borderRadius: 8,
    },
    activityTitle: {
      fontFamily: 'strenuous',
      fontSize: 15,
      fontWeight: '700',
      color: '#FFF5EC',
    },
    activityVenue: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.5)',
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#3a4a6b',
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterActive: {
      borderColor: '#CFFF47',
      backgroundColor: '#CFFF47',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#1B2A4A',
    },
    confirmButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: '#CFFF47',
        height: 52,
        borderRadius: 14,
        marginTop: 16,
        width: '100%',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        color: '#2D2D2D',
        fontSize: 16,
      },
    }),
  };

  const forfeitScreenStyles: ForfeitScreenStyles = {
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    emoji: {
      fontSize: 64,
      textAlign: 'center',
      marginBottom: 16,
    },
    title: {
      fontFamily: 'comba',
      fontSize: 36,
      color: '#FF5C4D',
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: 'strenuous',
      fontSize: 16,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 32,
    },
    backButton: overrideStyles(buttonPresets.Primary, {
      container: {
        backgroundColor: '#243660',
        borderWidth: 2,
        borderColor: '#3a4a6b',
        height: 52,
        borderRadius: 14,
        width: '100%',
      },
      text: {
        fontFamily: 'strenuous',
        fontWeight: '700',
        color: '#FFF5EC',
        fontSize: 16,
      },
    }),
  };

  const resultScreenStyles: ResultScreenStyles = {
    container: {
      flex: 1,
      backgroundColor: '#1B2A4A',
      paddingHorizontal: 16,
    },
    winnerTitle: {
      fontFamily: 'comba',
      fontSize: 32,
      color: '#FFF5EC',
      textAlign: 'center',
      marginTop: 60,
    },
    winnerVenue: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 16,
      color: 'rgba(255, 245, 236, 0.6)',
      textAlign: 'center',
      marginTop: 4,
    },
    planSetText: {
      fontFamily: 'strenuous',
      fontWeight: '700',
      fontSize: 20,
      color: '#CFFF47',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 20,
    },
    voteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: 12,
      gap: 8,
    },
    voteRowName: {
      fontFamily: 'strenuous',
      fontWeight: '700',
      fontSize: 14,
      color: '#FFF5EC',
      width: 150,
      flexShrink: 1,
    },
    voteBarTrack: {
      flex: 1,
      height: 4,
      backgroundColor: '#3a4a6b',
      borderRadius: 2,
      marginTop: 6,
    },
    voteBarFill: {
      height: 4,
      backgroundColor: '#FF5C4D',
      borderRadius: 2,
    },
    voteRowCount: {
      fontFamily: 'tt-autonomous-mono',
      fontSize: 12,
      color: 'rgba(255, 245, 236, 0.4)',
      width: 50,
      textAlign: 'right',
      marginTop: 2,
    },
    backLink: {
      fontFamily: 'strenuous',
      fontSize: 15,
      color: '#FF5C4D',
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 40,
    },
  };

  return createAppPageStyles<BattleStyles>({
    styles,
    headerStyles,
    memberStatusStyles,
    activityCardStyles,
    playToVoteButtonStyles,
    alreadyPlayedBannerStyles,
    rpsStyles,
    triviaStyles,
    reactionStyles,
    winScreenStyles,
    forfeitScreenStyles,
    resultScreenStyles,
  });
}
