export type bigserialnum = number & { _type: "bigserial" }
export type smallserialnum = number & { _type: "smallserial" }
export type serialnum = number & { _type: "serial" }

export type smallintnum = number & { _type: "smallint" }
export type intnum = number & { _type: "int" }
export type bigintnum = number & { _type: "bigint" }
export type floatnum = number & { _type: "real" }
export type doublenum = number & { _type: "double" }
export type moneynum = number & { _type: "money" }

export type byteastr = string & { _type: "bytea" }
export type bpcharstr = string & { _type: "bpchar" }
export type varcharstr = string & { _type: "varchar" }
export type datestr = string & { _type: "date" }
// case insensitive text
export type citextstr = string & { _type: "citext" }
// time without timezone
export type timestr = string & { _type: "time" }
// time with timezone
export type timetzstr = string & { _type: "timetz" }
// timestamp without timezone
export type timestampstr = string & { _type: "timestamp" }
// timestamp with timezone
export type timestamptzstr = string & { _type: "timestamptz" }
export type uuidstr = string & { _type: "uuid" }
export type vectorstr = string & { _type: "vector" }

export type emailstr = string & { _type: "email" }
export type urlstr = string & { _type: "url" }

export const toBigSerialNum = (n: number): bigserialnum => n as bigserialnum
export const toSmallSerialNum = (n: number): smallserialnum =>
  n as smallserialnum
export const toSerialNum = (n: number): serialnum => n as serialnum

export const toSmallIntNum = (n: number): smallintnum => n as smallintnum
export const toIntNum = (n: number): intnum => n as intnum
export const toBigIntNum = (n: number): bigintnum => n as bigintnum
export const toFloatNum = (n: number): floatnum => n as floatnum
export const toDoubleNum = (n: number): doublenum => n as doublenum
export const toMoneyNum = (n: number): moneynum => n as moneynum

export const toByteaStr = (s: string): byteastr => s as byteastr
export const toBpcharStr = (s: string): bpcharstr => s as bpcharstr
export const toVarcharStr = (s: string): varcharstr => s as varcharstr
export const toDateStr = (s: string): datestr => s as datestr
export const toCitextStr = (s: string): citextstr => s as citextstr
export const toTimeStr = (s: string): timestr => s as timestr
export const toTimetzStr = (s: string): timetzstr => s as timetzstr
export const toTimestampStr = (s: string): timestampstr => s as timestampstr
export const toTimestamptzStr = (s: string): timestamptzstr =>
  s as timestamptzstr
export const toUuidStr = (s: string): uuidstr => s as uuidstr
export const toVectorStr = (s: string): vectorstr => s as vectorstr

export const toEmailStr = (s: string): emailstr => s as emailstr
export const toUrlStr = (s: string): urlstr => s as urlstr

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum exports
export type ActivityCategory =
  | "NIGHTLIFE"
  | "FOOD_AND_DRINKS"
  | "OUTDOOR"
  | "LIVE_MUSIC"
  | "SPORTS"
  | "ARTS"
  | "GAMING"
  | "WELLNESS"
  | "COMEDY"

export type ActivityStatus = "ACTIVE" | "PAUSED" | "PENDING_REVIEW"

export type BattlePhase =
  | "VOTING_OPEN"
  | "VOTING_CLOSED"
  | "CALCULATING"
  | "WINNER_REVEALED"

export type DealStatus = "ACTIVE" | "EXPIRED" | "SCHEDULED"

export type DealType = "PERCENTAGE_OFF" | "FIXED_AMOUNT" | "BOGO" | "FREE_ITEM"

export type EntityType = "PERSON" | "SYSTEM" | "BOT"

export type GenderType = "MALE" | "FEMALE" | "NON_BINARY"

export type GroupVisibility = "PUBLIC" | "PRIVATE"

export type MergeRequestStatus = "PENDING" | "INITIATED" | "MERGED" | "DECLINED"

export type NotificationType =
  | "GROUP_INVITE"
  | "BATTLE_STARTED"
  | "BATTLE_ENDED"
  | "DEAL_EXPIRING"
  | "FRIEND_JOINED"
  | "GROUP_ACTIVITY"
  | "MERGE_REQUEST"
  | "MERGE_INITIATED"
  | "MERGE_DECLINED"
  | "ORBIT_ACTIVITY"

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER"

export type PriceRange = "FREE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"

export type SwipeAction = "LIKE" | "PASS" | "SUPER_LIKE"

export type VerificationStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "VERIFIED"
  | "FAILED"

// Composite Type exports
export type ActivityBoostV1 = {
  id: uuidstr
  activityId: uuidstr
  isActive: boolean
  tier: string | null
  dailyBudgetInCents: intnum
  remainingBudgetInCents: intnum
  boostedImpressions: intnum
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
}

export type ActivityDiscoverCardV1 = {
  activity: ActivityV1 | null
  deal: DealV1 | null
  businessName: string | null
}

export type ActivityEditDetailV1 = {
  activity: ActivityV1 | null
  deal: DealV1 | null
  metrics: ActivityMetricsV1 | null
  boost: ActivityBoostV1 | null
  businessDeals: DealV1[] | null
}

export type ActivityMetricsV1 = {
  activityId: uuidstr
  totalImpressions: intnum
  totalSwipes: intnum
  conversionRatePercent: doublenum | null
  updatedAt: timestamptzstr
}

export type ActivityV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  businessId: uuidstr
  title: string | null
  description: string | null
  category: ActivityCategory | null
  primaryImageUrl: string | null
  additionalImageUrls: string[] | null
  priceRange: PriceRange | null
  operatingHours: string | null
  tags: string[] | null
  status: ActivityStatus | null
  latitude: doublenum | null
  longitude: doublenum | null
  address: string | null
  rating: doublenum | null
}

export type ActivityWithDealV1 = {
  activity: ActivityV1 | null
  deal: DealV1 | null
}

export type AssetV1 = {
  id: uuidstr
  bucketId: string | null
  name: string | null
  ownerId: string | null
  mimeType: string | null
}

export type BattleDetailV1 = {
  battle: BattleV1 | null
  groupName: string | null
  totalParticipants: intnum
  votedParticipants: intnum
  finalists: BattleFinalistDetailV1[] | null
  winnerTitle: string | null
  winnerImageUrl: string | null
}

export type BattleFinalistDetailV1 = {
  activityId: uuidstr
  title: string | null
  primaryImageUrl: string | null
  voteCount: intnum
  dealHeadline: string | null
  address: string | null
}

export type BattleFinalistV1 = {
  id: uuidstr
  battleId: uuidstr
  activityId: uuidstr
  voteCount: intnum
}

export type BattleMemberStatusV1 = {
  userId: uuidstr
  displayName: string | null
  avatarInitial: string | null
  hasVoted: boolean
}

export type BattleMemberVoteV1 = {
  userId: uuidstr
  displayName: string | null
  avatarInitial: string | null
  votedActivityId: uuidstr | null
}

export type BattleMiniGameResultV1 = {
  userId: uuidstr
  displayName: string | null
  gameType: string | null
  won: boolean | null
  reactionTimeInMs: intnum | null
}

export type BattleResultsV1 = {
  battle: BattleV1 | null
  groupName: string | null
  winnerActivity: ActivityV1 | null
  winnerDeal: DealV1 | null
  finalists: BattleFinalistDetailV1[] | null
  memberVotes: BattleMemberVoteV1[] | null
}

export type BattleV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  groupId: uuidstr
  phase: BattlePhase | null
  durationInMin: intnum
  startedAt: timestamptzstr
  endsAt: timestamptzstr
  winningActivityId: uuidstr | null
}

export type BattleWithFinalistsV1 = {
  battle: BattleV1 | null
  finalists: BattleFinalistV1[] | null
}

export type BizActivityAnalyticsV1 = {
  activityId: uuidstr
  title: string | null
  impressions: intnum
  swipes: intnum
  conversionPercent: doublenum | null
}

export type BizAnalyticsDailyV1 = {
  date: datestr
  impressions: intnum
  uniqueViewers: intnum
  swipes: intnum
  dealRedemptions: intnum
  revenueEstimateInCents: intnum
}

export type BizAnalyticsOverviewV1 = {
  totalImpressions: intnum
  totalUniqueViewers: intnum
  totalSwipes: intnum
  swipeRatePercent: doublenum | null
  totalDealRedemptions: intnum
  revenueEstimateInCents: intnum
  prevTotalImpressions: intnum
  prevTotalUniqueViewers: intnum
  prevTotalSwipes: intnum
  prevSwipeRatePercent: doublenum | null
  prevTotalDealRedemptions: intnum
  prevRevenueEstimateInCents: intnum
}

export type BizDealAnalyticsV1 = {
  dealId: uuidstr
  headline: string | null
  redemptionRatePercent: doublenum | null
  peakHour: intnum
  totalRedemptions: intnum
}

export type BusinessV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  ownerId: uuidstr
  name: string | null
  logoUrl: string | null
  isVerified: boolean
  subscriptionTier: string | null
}

export type ConversationMessageAssetV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  conversationMessageId: uuidstr
  objectId: uuidstr
  orderIndex: smallintnum
}

export type ConversationMessageAssetWithDetailsV1 = {
  objectId: uuidstr
  orderIndex: smallintnum
  bucketId: string | null
  name: string | null
  mimeType: string | null
}

export type ConversationMessageAssetWithObjectV1 = {
  objectId: uuidstr
  orderIndex: smallintnum
  bucketId: string | null
  name: string | null
  mimeType: string | null
}

export type ConversationMessageV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  conversationId: uuidstr
  prevMessageId: uuidstr | null
  authorEntityId: uuidstr
  contentText: string | null
  context: Json | null
}

export type ConversationMessageWithDetailsV1 = {
  message: ConversationMessageV1 | null
  entityType: EntityType | null
  assets: ConversationMessageAssetWithDetailsV1[] | null
}

export type ConversationMessageWithEntityTypeV1 = {
  message: ConversationMessageV1 | null
  entityType: EntityType | null
}

export type ConversationParticipantV1 = {
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  conversationId: uuidstr
  entityId: uuidstr
  deactivatedAt: timestamptzstr | null
}

export type ConversationParticipantWithDetailsV1 = {
  participant: ConversationParticipantV1 | null
  entityType: EntityType | null
  profile: ProfileV1 | null
}

export type ConversationV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  ownerEntityId: uuidstr
  subject: string | null
}

export type ConversationWithContentV1 = {
  conversation: ConversationV1 | null
  messages: ConversationMessageWithDetailsV1[] | null
  participants: ConversationParticipantWithDetailsV1[] | null
}

export type ConversationWithMessagesAndEntityTypeV1 = {
  conversation: ConversationV1 | null
  messages: ConversationMessageWithEntityTypeV1[] | null
}

export type DealActivityV1 = {
  id: uuidstr
  dealId: uuidstr
  activityId: uuidstr
}

export type DealMetricsV1 = {
  dealId: uuidstr
  totalViews: intnum
  totalRedemptions: intnum
  conversionRatePercent: doublenum | null
  updatedAt: timestamptzstr
}

export type DealRedeemDetailV1 = {
  deal: DealV1 | null
  businessName: string | null
  redemptionsUsed: intnum
  userAlreadyRedeemed: boolean
}

export type DealRedemptionV1 = {
  id: uuidstr
  dealId: uuidstr
  userId: uuidstr
  redeemedAt: timestamptzstr
}

export type DealV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  businessId: uuidstr
  headline: string | null
  dealType: DealType | null
  discountValueInPercent: doublenum | null
  discountValueInCents: intnum | null
  termsAndConditions: string | null
  minimumGroupSize: intnum | null
  minimumSpendInCents: intnum | null
  startDate: datestr
  endDate: datestr
  validTimeStart: timestr | null
  validTimeEnd: timestr | null
  totalRedemptionLimit: intnum | null
  perUserRedemptionLimit: intnum
  status: DealStatus | null
  redemptionCode: string | null
}

export type DealWithMetricsV1 = {
  deal: DealV1 | null
  totalViews: intnum
  totalRedemptions: intnum
  conversionRatePercent: doublenum | null
  linkedActivitiesCount: intnum
}

export type EntityV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  entityType: EntityType | null
  userId: uuidstr | null
  name: string | null
}

export type GroupChatDataV1 = {
  groupName: string | null
  memberCount: intnum
  messages: GroupChatMessageV1[] | null
}

export type GroupChatMessageV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  contentText: string | null
  isCurrentUser: boolean
  messageType: string | null
  senderName: string | null
  senderInitial: string | null
  senderColor: string | null
  reactions: GroupChatReactionV1[] | null
  sharedActivityId: uuidstr | null
  sharedActivityTitle: string | null
  sharedActivityVenue: string | null
  sharedActivityImageUrl: string | null
  sharedActivityDealLabel: string | null
}

export type GroupChatPreviewV1 = {
  senderName: string | null
  lastMessage: string | null
  sentAt: timestamptzstr | null
}

export type GroupChatReactionV1 = {
  emoji: string | null
  count: intnum
  hasReacted: boolean
}

export type GroupMemberV1 = {
  id: uuidstr
  groupId: uuidstr
  userId: uuidstr
  isOwner: boolean
  joinedAt: timestamptzstr
  isOnline: boolean
}

export type GroupMemberWithProfileV1 = {
  member: GroupMemberV1 | null
  displayName: string | null
  avatarUrl: string | null
  isVerified: boolean
}

export type GroupRankedActivityV1 = {
  activityId: uuidstr
  title: string | null
  thumbnailUrl: string | null
  swipeCount: intnum
  hasDeal: boolean
}

export type GroupSwipeActivityV1 = {
  id: uuidstr
  memberName: string | null
  memberInitial: string | null
  action: SwipeAction | null
  activityTitle: string | null
  activityThumbnailUrl: string | null
  createdAt: timestamptzstr
}

export type InviteV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  groupId: uuidstr
  invitedByUserId: uuidstr
  invitedUserId: uuidstr | null
  inviteCode: string | null
  expiresAt: timestamptzstr | null
  isAccepted: boolean
}

export type InviteWithProfileV1 = {
  invite: InviteV1 | null
  inviteeName: string | null
  inviteeAvatarUrl: string | null
  inviterName: string | null
}

export type MemberReadinessV1 = {
  userId: uuidstr
  swipeCount: intnum
  isReady: boolean
  wasNudgedRecently: boolean
}

export type MergeOpportunityV1 = {
  mergeRequestId: uuidstr
  otherGroupId: uuidstr
  otherGroupName: string | null
  activityName: string | null
}

export type MergeRequestV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  initiatingGroupId: uuidstr
  otherGroupId: uuidstr
  activityId: uuidstr | null
  battleId: uuidstr | null
  status: MergeRequestStatus | null
}

export type MergeScreenDataV1 = {
  mergeRequest: MergeRequestV1 | null
  initiatingGroupName: string | null
  initiatingGroupMemberCount: intnum
  otherGroupName: string | null
  otherGroupMemberCount: intnum
  activityName: string | null
  activityAddress: string | null
  isInitiatingGroup: boolean
}

export type NearbyUserV1 = {
  userId: uuidstr
  displayName: string | null
  avatarUrl: string | null
  isVerified: boolean
  distanceInKm: doublenum | null
}

export type NotificationV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  userId: uuidstr
  type: NotificationType | null
  title: string | null
  body: string | null
  linkedGroupId: uuidstr | null
  linkedActivityId: uuidstr | null
  linkedBattleId: uuidstr | null
  linkedMergeRequestId: uuidstr | null
  isRead: boolean
}

export type OpenPlanetCardV1 = {
  id: uuidstr
  name: string | null
  memberCount: intnum
  maxGroupSize: intnum
  memberInitials: string[] | null
  distanceInMiles: doublenum | null
  featuredActivityName: string | null
  isVoting: boolean
  hasOrbited: boolean
  hasRequestedToJoin: boolean
}

export type OrbitChatMessageV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  authorUserId: uuidstr
  authorName: string | null
  authorInitial: string | null
  contentText: string | null
  authorGroupId: uuidstr
}

export type OrbitMemberV1 = {
  userId: uuidstr
  displayName: string | null
  initial: string | null
  groupId: uuidstr
  isFromOtherGroup: boolean
}

export type OrbitScreenDataV1 = {
  orbitChannelId: uuidstr
  mergeRequestId: uuidstr
  group1Id: uuidstr
  group1Name: string | null
  group1MemberCount: intnum
  group2Id: uuidstr
  group2Name: string | null
  group2MemberCount: intnum
  activityName: string | null
  activityAddress: string | null
  conversationId: uuidstr | null
  members: OrbitMemberV1[] | null
}

export type OrganizationMembershipV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  organizationId: uuidstr
  entityId: uuidstr
  role: OrganizationRole | null
}

export type OrganizationV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  name: string | null
  logoUrl: string | null
  ownerEntityId: uuidstr | null
}

export type PlanetGroupDetailV1 = {
  group: PlanetGroupV1 | null
  members: GroupMemberWithProfileV1[] | null
}

export type PlanetGroupSummaryV1 = {
  group: PlanetGroupV1 | null
  memberCount: intnum
  memberInitials: string[] | null
  status: string | null
  lastActivityAt: timestamptzstr
}

export type PlanetGroupV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  name: string | null
  photoUrl: string | null
  isOpenToStrangers: boolean
  maxGroupSize: intnum
  visibility: GroupVisibility | null
  createdById: uuidstr
  conversationId: uuidstr | null
  nextPlanAt: timestamptzstr | null
}

export type PlanetGroupWithMembersV1 = {
  group: PlanetGroupV1 | null
  members: GroupMemberV1[] | null
}

export type PlanetUserSearchResultV1 = {
  userId: uuidstr
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  isVerified: boolean
}

export type ProfileUpdateV1 = {
  updatedAt: timestamptzstr | null
  username: string | null
  fullName: string | null
  avatarUrl: string | null
  gender: GenderType | null
  givenName: string | null
  familyName: string | null
  birthDate: datestr | null
}

export type ProfileV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  username: string | null
  fullName: string | null
  avatarUrl: string | null
  gender: GenderType | null
  givenName: string | null
  familyName: string | null
  birthDate: datestr | null
}

export type ProfileWithEmailV1 = {
  profile: ProfileV1 | null
  email: emailstr | null
}

export type SwipeV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  userId: uuidstr
  activityId: uuidstr
  groupId: uuidstr | null
  action: SwipeAction | null
}

export type SwipeWithActivityV1 = {
  swipe: SwipeV1 | null
  activityTitle: string | null
  activityImageUrl: string | null
  activityCategory: ActivityCategory | null
}

export type UserAppProfileV1 = {
  userId: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  isVerified: boolean
  verificationStatus: VerificationStatus | null
  isOnboarded: boolean
  isBusinessOwner: boolean
  locationLatitude: doublenum | null
  locationLongitude: doublenum | null
  phoneNumber: string | null
}

export type UserPreferenceV1 = {
  userId: uuidstr
  createdAt: timestamptzstr
  updatedAt: timestamptzstr
  activityCategories: ActivityCategory[] | null
  locationPermissionGranted: boolean
  pushNotificationsEnabled: boolean
  battleNotificationsEnabled: boolean
  groupActivityNotificationsEnabled: boolean
  dealNotificationsEnabled: boolean
  friendActivityNotificationsEnabled: boolean
}

export type UserStatsV1 = {
  groupsCount: intnum
  battlesWon: intnum
  activitiesDiscovered: intnum
}

export type UserV1 = {
  id: uuidstr
  email: emailstr | null
  role: varcharstr | null
  emailConfirmedAt: timestamptzstr | null
  lastSignInAt: timestamptzstr | null
  createdAt: timestamptzstr | null
  updatedAt: timestamptzstr | null
  phone: string | null
  isSsoUser: boolean
  deletedAt: timestamptzstr | null
}

export type VerificationDocumentV1 = {
  id: uuidstr
  userId: uuidstr
  idDocumentUrl: string | null
  selfieUrl: string | null
  submittedAt: timestamptzstr
  reviewedAt: timestamptzstr | null
}

export type VoteV1 = {
  id: uuidstr
  createdAt: timestamptzstr
  battleId: uuidstr
  userId: uuidstr
  activityId: uuidstr
  rank: intnum | null
}

export type Database = {
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      "admin:assets:user:read": {
        Args: { ownerId: uuidstr | null }
        Returns: AssetV1[]
      }
      "admin:conversation:readWithMessagesAndEntityTypes": {
        Args: { conversationId: uuidstr | null }
        Returns: ConversationWithMessagesAndEntityTypeV1
      }
      "admin:conversation:user:create": {
        Args: {
          authorEntityId: uuidstr | null
          otherEntityIds: uuidstr[] | null
        }
        Returns: uuidstr
      }
      "admin:entity:getByEmail": {
        Args: { userEmail: string | null }
        Returns: {
          entityId: uuidstr
          email: string
        }[]
      }
      "admin:planetNotif:create": {
        Args: {
          userId: uuidstr | null
          type: NotificationType | null
          title: string | null
          body: string | null
          linkedGroupId?: uuidstr | null
          linkedActivityId?: uuidstr | null
          linkedBattleId?: uuidstr | null
          linkedMergeRequestId?: uuidstr | null
        }
        Returns: NotificationV1
      }
      "admin:planetSwipe:deleteAll": {
        Args: Record<PropertyKey, never>
        Returns: intnum
      }
      "admin:planetUser:updateVerification": {
        Args: {
          userId: uuidstr | null
          newVerificationStatus: VerificationStatus | null
        }
        Returns: undefined
      }
      "admin:planetVerify:review": {
        Args: { documentId: uuidstr | null; approved: boolean | null }
        Returns: undefined
      }
      "admin:user:deleteRelatedData": {
        Args: { userId: uuidstr | null }
        Returns: undefined
      }
      "app:assets:user:read": {
        Args: Record<PropertyKey, never>
        Returns: AssetV1[]
      }
      "app:conversation:message:asset:user:readAllWithObject": {
        Args: { conversationMessageId: uuidstr | null }
        Returns: ConversationMessageAssetWithObjectV1[]
      }
      "app:conversation:message:create": {
        Args: {
          conversationId: uuidstr | null
          contentText: string | null
          botEntityId: uuidstr | null
          prevMessageId?: uuidstr | null
        }
        Returns: ConversationMessageV1
      }
      "app:conversation:message:upsertAllWithAssets": {
        Args: {
          messages: ConversationMessageV1[] | null
          assets: ConversationMessageAssetV1[] | null
        }
        Returns: {
          messageCount: intnum
          assetCount: intnum
        }[]
      }
      "app:conversation:user:create": {
        Args: { otherEntityIds: uuidstr[] | null }
        Returns: uuidstr
      }
      "app:conversation:user:readAll": {
        Args: Record<PropertyKey, never>
        Returns: ConversationV1[]
      }
      "app:conversation:user:readWithContent": {
        Args: { conversationId: uuidstr | null }
        Returns: ConversationWithContentV1
      }
      "app:conversation:user:readWithMessagesAndEntityTypes": {
        Args: { conversationId: uuidstr | null }
        Returns: ConversationWithMessagesAndEntityTypeV1
      }
      "app:conversation:user:readWithOtherParticipantsExact": {
        Args: { otherParticipantEntityIds: uuidstr[] | null }
        Returns: ConversationV1[]
      }
      "app:entity:exists": {
        Args: { entityId: uuidstr | null }
        Returns: boolean
      }
      "app:entity:user:create": {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      "app:entity:user:read": {
        Args: Record<PropertyKey, never>
        Returns: EntityV1
      }
      "app:entity:user:update": {
        Args: { newEntityType?: EntityType | null; newName?: string | null }
        Returns: boolean
      }
      "app:organization:membership:user:readAll": {
        Args: Record<PropertyKey, never>
        Returns: OrganizationMembershipV1[]
      }
      "app:organization:user:create": {
        Args: { name: string | null }
        Returns: uuidstr
      }
      "app:planetActivity:create": {
        Args: {
          businessId: uuidstr | null
          title: string | null
          description: string | null
          category: ActivityCategory | null
          primaryImageUrl: string | null
          priceRange: PriceRange | null
          address: string | null
          latitude: doublenum | null
          longitude: doublenum | null
          additionalImageUrls?: string[] | null
          operatingHours?: string | null
          tags?: string[] | null
        }
        Returns: ActivityV1
      }
      "app:planetActivity:delete": {
        Args: { activityId: uuidstr | null }
        Returns: boolean
      }
      "app:planetActivity:readAllActive": {
        Args: {
          userLatitude?: doublenum | null
          userLongitude?: doublenum | null
          limitCount?: intnum | null
          offsetCount?: intnum | null
        }
        Returns: ActivityWithDealV1[]
      }
      "app:planetActivity:readAllByBusiness": {
        Args: { businessId: uuidstr | null }
        Returns: ActivityV1[]
      }
      "app:planetActivity:readById": {
        Args: { activityId: uuidstr | null }
        Returns: ActivityWithDealV1
      }
      "app:planetActivity:readDiscoverFeed": {
        Args: {
          userLatitude?: doublenum | null
          userLongitude?: doublenum | null
          limitCount?: intnum | null
          offsetCount?: intnum | null
        }
        Returns: ActivityDiscoverCardV1[]
      }
      "app:planetActivity:readEditDetail": {
        Args: { activityId: uuidstr | null }
        Returns: ActivityEditDetailV1
      }
      "app:planetActivity:update": {
        Args: {
          activityId: uuidstr | null
          title?: string | null
          description?: string | null
          category?: ActivityCategory | null
          primaryImageUrl?: string | null
          priceRange?: PriceRange | null
          address?: string | null
          latitude?: doublenum | null
          longitude?: doublenum | null
          additionalImageUrls?: string[] | null
          operatingHours?: string | null
          tags?: string[] | null
          status?: ActivityStatus | null
        }
        Returns: ActivityV1
      }
      "app:planetBattle:completeMiniGame": {
        Args: {
          battleId: uuidstr | null
          won: boolean | null
          reactionTimeInMs?: intnum | null
        }
        Returns: boolean
      }
      "app:planetBattle:countActive": {
        Args: Record<PropertyKey, never>
        Returns: intnum
      }
      "app:planetBattle:create": {
        Args: {
          groupId: uuidstr | null
          durationInMin?: intnum | null
          activityIds?: uuidstr[] | null
        }
        Returns: BattleWithFinalistsV1
      }
      "app:planetBattle:lockInVotes": {
        Args: { battleId: uuidstr | null; activityIds: uuidstr[] | null }
        Returns: VoteV1[]
      }
      "app:planetBattle:readActiveByGroup": {
        Args: { groupId: uuidstr | null }
        Returns: BattleDetailV1
      }
      "app:planetBattle:readAllActive": {
        Args: Record<PropertyKey, never>
        Returns: BattleWithFinalistsV1[]
      }
      "app:planetBattle:readAllActiveWithDetails": {
        Args: Record<PropertyKey, never>
        Returns: BattleDetailV1[]
      }
      "app:planetBattle:readAllRecent": {
        Args: { sinceHours?: intnum | null }
        Returns: BattleWithFinalistsV1[]
      }
      "app:planetBattle:readAllRecentWithDetails": {
        Args: { sinceHours?: intnum | null }
        Returns: BattleDetailV1[]
      }
      "app:planetBattle:readMemberStatuses": {
        Args: { battleId: uuidstr | null }
        Returns: BattleMemberStatusV1[]
      }
      "app:planetBattle:readMiniGameResults": {
        Args: { battleId: uuidstr | null }
        Returns: BattleMiniGameResultV1[]
      }
      "app:planetBattle:readResultsByGroup": {
        Args: { groupId: uuidstr | null }
        Returns: BattleResultsV1
      }
      "app:planetBattle:readWithFinalists": {
        Args: { battleId: uuidstr | null }
        Returns: BattleWithFinalistsV1
      }
      "app:planetBattle:startMiniGame": {
        Args: { battleId: uuidstr | null; gameType: string | null }
        Returns: boolean
      }
      "app:planetBattle:updatePhase": {
        Args: {
          battleId: uuidstr | null
          phase: BattlePhase | null
          winningActivityId?: uuidstr | null
        }
        Returns: BattleV1
      }
      "app:planetBiz:create": {
        Args: { name: string | null; logoUrl?: string | null }
        Returns: BusinessV1
      }
      "app:planetBiz:read": {
        Args: Record<PropertyKey, never>
        Returns: BusinessV1
      }
      "app:planetBiz:update": {
        Args: {
          businessId: uuidstr | null
          name?: string | null
          logoUrl?: string | null
        }
        Returns: BusinessV1
      }
      "app:planetBizDash:readActivityBreakdown": {
        Args: { businessId: uuidstr | null }
        Returns: BizActivityAnalyticsV1[]
      }
      "app:planetBizDash:readDailyMetrics": {
        Args: {
          businessId: uuidstr | null
          startDate: datestr | null
          endDate: datestr | null
        }
        Returns: BizAnalyticsDailyV1[]
      }
      "app:planetBizDash:readDealPerformance": {
        Args: { businessId: uuidstr | null }
        Returns: BizDealAnalyticsV1[]
      }
      "app:planetBizDash:readOverview": {
        Args: {
          businessId: uuidstr | null
          startDate: datestr | null
          endDate: datestr | null
        }
        Returns: BizAnalyticsOverviewV1
      }
      "app:planetDeal:create": {
        Args: {
          businessId: uuidstr | null
          headline: string | null
          dealType: DealType | null
          termsAndConditions: string | null
          startDate: datestr | null
          endDate: datestr | null
          redemptionCode: string | null
          discountValueInPercent?: doublenum | null
          discountValueInCents?: intnum | null
          minimumGroupSize?: intnum | null
          minimumSpendInCents?: intnum | null
          validTimeStart?: timestr | null
          validTimeEnd?: timestr | null
          totalRedemptionLimit?: intnum | null
          perUserRedemptionLimit?: intnum | null
          activityIds?: uuidstr[] | null
        }
        Returns: DealV1
      }
      "app:planetDeal:delete": {
        Args: { dealId: uuidstr | null }
        Returns: boolean
      }
      "app:planetDeal:duplicate": {
        Args: { dealId: uuidstr | null }
        Returns: DealV1
      }
      "app:planetDeal:linkActivity": {
        Args: { dealId: uuidstr | null; activityId: uuidstr | null }
        Returns: boolean
      }
      "app:planetDeal:readActivities": {
        Args: { dealId: uuidstr | null }
        Returns: DealActivityV1[]
      }
      "app:planetDeal:readAllByBusiness": {
        Args: { businessId: uuidstr | null }
        Returns: DealV1[]
      }
      "app:planetDeal:readAllByBusinessWithMetrics": {
        Args: { businessId: uuidstr | null }
        Returns: DealWithMetricsV1[]
      }
      "app:planetDeal:readById": {
        Args: { dealId: uuidstr | null }
        Returns: DealV1
      }
      "app:planetDeal:readRedeemDetailByActivity": {
        Args: { activityId: uuidstr | null }
        Returns: DealRedeemDetailV1
      }
      "app:planetDeal:redeem": {
        Args: { dealId: uuidstr | null }
        Returns: DealRedemptionV1
      }
      "app:planetDeal:unlinkActivity": {
        Args: { dealId: uuidstr | null; activityId: uuidstr | null }
        Returns: boolean
      }
      "app:planetDeal:updateStatus": {
        Args: { dealId: uuidstr | null; newStatus: DealStatus | null }
        Returns: DealV1
      }
      "app:planetGroup:chat:addReaction": {
        Args: { messageId: uuidstr | null; emoji: string | null }
        Returns: boolean
      }
      "app:planetGroup:chat:removeReaction": {
        Args: { messageId: uuidstr | null; emoji: string | null }
        Returns: boolean
      }
      "app:planetGroup:chat:sendMessage": {
        Args: {
          groupId: uuidstr | null
          contentText: string | null
          context?: Json | null
        }
        Returns: GroupChatMessageV1
      }
      "app:planetGroup:chat:shareActivity": {
        Args: {
          groupId: uuidstr | null
          activityId: uuidstr | null
          contentText?: string | null
        }
        Returns: GroupChatMessageV1
      }
      "app:planetGroup:create": {
        Args: {
          name: string | null
          photoUrl?: string | null
          isOpenToStrangers?: boolean | null
          maxGroupSize?: intnum | null
          visibility?: GroupVisibility | null
        }
        Returns: PlanetGroupV1
      }
      "app:planetGroup:delete": {
        Args: { groupId: uuidstr | null }
        Returns: boolean
      }
      "app:planetGroup:ensureChat": {
        Args: { groupId: uuidstr | null }
        Returns: boolean
      }
      "app:planetGroup:leave": {
        Args: { groupId: uuidstr | null }
        Returns: boolean
      }
      "app:planetGroup:member:readAll": {
        Args: { groupId: uuidstr | null }
        Returns: GroupMemberV1[]
      }
      "app:planetGroup:member:remove": {
        Args: { groupId: uuidstr | null; targetUserId: uuidstr | null }
        Returns: boolean
      }
      "app:planetGroup:nudgeAll": {
        Args: { groupId: uuidstr | null }
        Returns: intnum
      }
      "app:planetGroup:nudgeMember": {
        Args: { groupId: uuidstr | null; recipientId: uuidstr | null }
        Returns: boolean
      }
      "app:planetGroup:readAll": {
        Args: Record<PropertyKey, never>
        Returns: PlanetGroupV1[]
      }
      "app:planetGroup:readAllWithSummary": {
        Args: Record<PropertyKey, never>
        Returns: PlanetGroupSummaryV1[]
      }
      "app:planetGroup:readChatData": {
        Args: { groupId: uuidstr | null }
        Returns: GroupChatDataV1
      }
      "app:planetGroup:readChatPreview": {
        Args: { groupId: uuidstr | null }
        Returns: GroupChatPreviewV1
      }
      "app:planetGroup:readDetailWithMembers": {
        Args: { groupId: uuidstr | null }
        Returns: PlanetGroupDetailV1
      }
      "app:planetGroup:readMemberReadiness": {
        Args: { groupId: uuidstr | null }
        Returns: MemberReadinessV1[]
      }
      "app:planetGroup:readOpenPlanets": {
        Args: {
          userLatitude?: doublenum | null
          userLongitude?: doublenum | null
        }
        Returns: OpenPlanetCardV1[]
      }
      "app:planetGroup:readRankedActivities": {
        Args: { groupId: uuidstr | null; limitCount?: intnum | null }
        Returns: GroupRankedActivityV1[]
      }
      "app:planetGroup:readSwipeActivity": {
        Args: { groupId: uuidstr | null; limitCount?: intnum | null }
        Returns: GroupSwipeActivityV1[]
      }
      "app:planetGroup:readWithMembers": {
        Args: { groupId: uuidstr | null }
        Returns: PlanetGroupWithMembersV1
      }
      "app:planetGroup:requestToJoin": {
        Args: { groupId: uuidstr | null; message?: string | null }
        Returns: boolean
      }
      "app:planetGroup:reschedule": {
        Args: {
          groupId: uuidstr | null
          nextPlanAt: timestamptzstr | null
          dateLabel: string | null
        }
        Returns: boolean
      }
      "app:planetGroup:schedulePlan": {
        Args: {
          groupId: uuidstr | null
          nextPlanAt: timestamptzstr | null
          dateLabel: string | null
        }
        Returns: boolean
      }
      "app:planetGroup:toggleOrbit": {
        Args: { groupId: uuidstr | null }
        Returns: boolean
      }
      "app:planetGroup:update": {
        Args: {
          groupId: uuidstr | null
          name?: string | null
          photoUrl?: string | null
          isOpenToStrangers?: boolean | null
          maxGroupSize?: intnum | null
          visibility?: GroupVisibility | null
        }
        Returns: PlanetGroupV1
      }
      "app:planetGroup:updateNextPlanAt": {
        Args: { groupId: uuidstr | null; nextPlanAt: timestamptzstr | null }
        Returns: boolean
      }
      "app:planetInvite:accept": {
        Args: { inviteCode: string | null }
        Returns: GroupMemberV1
      }
      "app:planetInvite:countPending": {
        Args: Record<PropertyKey, never>
        Returns: intnum
      }
      "app:planetInvite:create": {
        Args: {
          groupId: uuidstr | null
          inviteCode: string | null
          invitedUserId?: uuidstr | null
          expiresAt?: timestamptzstr | null
        }
        Returns: InviteV1
      }
      "app:planetInvite:readAllByGroup": {
        Args: { groupId: uuidstr | null }
        Returns: InviteV1[]
      }
      "app:planetInvite:readAllByGroupWithProfile": {
        Args: { groupId: uuidstr | null }
        Returns: InviteWithProfileV1[]
      }
      "app:planetMerge:create": {
        Args: { otherGroupId: uuidstr | null }
        Returns: MergeRequestV1
      }
      "app:planetMerge:readOrbitByMergeRequest": {
        Args: { mergeRequestId: uuidstr | null }
        Returns: OrbitScreenDataV1
      }
      "app:planetMerge:readOrbitData": {
        Args: { orbitChannelId: uuidstr | null }
        Returns: OrbitScreenDataV1
      }
      "app:planetMerge:readPendingByGroup": {
        Args: { groupId: uuidstr | null }
        Returns: MergeOpportunityV1
      }
      "app:planetMerge:readScreenData": {
        Args: { mergeRequestId: uuidstr | null }
        Returns: MergeScreenDataV1
      }
      "app:planetMerge:updateStatus": {
        Args: {
          mergeRequestId: uuidstr | null
          newStatus: MergeRequestStatus | null
        }
        Returns: MergeRequestV1
      }
      "app:planetNotif:countUnread": {
        Args: Record<PropertyKey, never>
        Returns: intnum
      }
      "app:planetNotif:dismiss": {
        Args: { notificationId: uuidstr | null }
        Returns: boolean
      }
      "app:planetNotif:markAllRead": {
        Args: Record<PropertyKey, never>
        Returns: intnum
      }
      "app:planetNotif:markRead": {
        Args: { notificationId: uuidstr | null }
        Returns: boolean
      }
      "app:planetNotif:readAll": {
        Args: { limitCount?: intnum | null; offsetCount?: intnum | null }
        Returns: NotificationV1[]
      }
      "app:planetOrbit:chat:readMessages": {
        Args: { orbitChannelId: uuidstr | null; limitCount?: intnum | null }
        Returns: OrbitChatMessageV1[]
      }
      "app:planetOrbit:chat:sendMessage": {
        Args: { orbitChannelId: uuidstr | null; contentText: string | null }
        Returns: OrbitChatMessageV1
      }
      "app:planetPref:read": {
        Args: Record<PropertyKey, never>
        Returns: UserPreferenceV1
      }
      "app:planetPref:update": {
        Args: {
          activityCategories?: ActivityCategory[] | null
          locationPermissionGranted?: boolean | null
          pushNotificationsEnabled?: boolean | null
          battleNotificationsEnabled?: boolean | null
          groupActivityNotificationsEnabled?: boolean | null
          dealNotificationsEnabled?: boolean | null
          friendActivityNotificationsEnabled?: boolean | null
        }
        Returns: UserPreferenceV1
      }
      "app:planetSwipe:create": {
        Args: {
          activityId: uuidstr | null
          action: SwipeAction | null
          groupId?: uuidstr | null
        }
        Returns: SwipeV1
      }
      "app:planetSwipe:deleteByUser": {
        Args: Record<PropertyKey, never>
        Returns: intnum
      }
      "app:planetSwipe:readAllByGroup": {
        Args: { groupId: uuidstr | null }
        Returns: SwipeV1[]
      }
      "app:planetSwipe:readAllByUser": {
        Args: { limitCount?: intnum | null; offsetCount?: intnum | null }
        Returns: SwipeV1[]
      }
      "app:planetSwipe:readRecentWithActivity": {
        Args: { limitCount?: intnum | null }
        Returns: SwipeWithActivityV1[]
      }
      "app:planetSwipe:undoLast": {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      "app:planetUser:read": {
        Args: Record<PropertyKey, never>
        Returns: UserAppProfileV1
      }
      "app:planetUser:readNearby": {
        Args: {
          userLatitude: doublenum | null
          userLongitude: doublenum | null
          radiusInKm?: doublenum | null
          excludeGroupId?: uuidstr | null
          limitCount?: intnum | null
        }
        Returns: NearbyUserV1[]
      }
      "app:planetUser:readStats": {
        Args: Record<PropertyKey, never>
        Returns: UserStatsV1
      }
      "app:planetUser:search": {
        Args: {
          query: string | null
          excludeGroupId?: uuidstr | null
          limitCount?: intnum | null
        }
        Returns: PlanetUserSearchResultV1[]
      }
      "app:planetUser:update": {
        Args: {
          isOnboarded?: boolean | null
          isBusinessOwner?: boolean | null
          locationLatitude?: doublenum | null
          locationLongitude?: doublenum | null
          phoneNumber?: string | null
        }
        Returns: UserAppProfileV1
      }
      "app:planetVerify:read": {
        Args: Record<PropertyKey, never>
        Returns: VerificationDocumentV1
      }
      "app:planetVerify:submit": {
        Args: { idDocumentUrl: string | null; selfieUrl: string | null }
        Returns: VerificationDocumentV1
      }
      "app:planetVote:create": {
        Args: {
          battleId: uuidstr | null
          activityId: uuidstr | null
          rank?: intnum | null
        }
        Returns: VoteV1
      }
      "app:planetVote:readAllByBattle": {
        Args: { battleId: uuidstr | null }
        Returns: VoteV1[]
      }
      "app:profile:user:read": {
        Args: Record<PropertyKey, never>
        Returns: ProfileV1
      }
      "app:profile:user:readWithEmail": {
        Args: Record<PropertyKey, never>
        Returns: ProfileWithEmailV1
      }
      "app:profile:user:update": {
        Args: {
          avatarUrl?: string | null
          username?: string | null
          fullName?: string | null
          givenName?: string | null
          familyName?: string | null
          birthDate?: datestr | null
          gender?: GenderType | null
          updatedAt?: timestamptzstr | null
        }
        Returns: ProfileV1
      }
      int_id_from_millis: {
        Args: { millis_since_1970: bigintnum | null }
        Returns: intnum
      }
      int_id_from_timestamp: {
        Args: { ts?: timestamptzstr | null }
        Returns: intnum
      }
      uuid_add_millis_and_id: {
        Args: {
          uuid1: uuidstr | null
          millis_since1970?: bigintnum | null
          uuid2?: uuidstr | null
        }
        Returns: uuidstr
      }
      uuid_add_timestamp_and_id: {
        Args: {
          uuid1: uuidstr | null
          ts?: timestamptzstr | null
          uuid2?: uuidstr | null
        }
        Returns: uuidstr
      }
      uuid_at: {
        Args: { time_id: bigintnum | null; space_id?: bigintnum | null }
        Returns: uuidstr
      }
      uuid_from_base64: {
        Args: { uuid_base64: string | null }
        Returns: uuidstr
      }
      uuid_from_longs: {
        Args: { msb: bigintnum | null; lsb: bigintnum | null }
        Returns: uuidstr
      }
      uuid_from_millis: {
        Args: { millis_since_1970: bigintnum | null; uuid1: uuidstr | null }
        Returns: uuidstr
      }
      uuid_from_timestamp: {
        Args: { ts?: timestamptzstr | null; uuid1?: uuidstr | null }
        Returns: uuidstr
      }
      uuid_to_base64: {
        Args: { uuid1: uuidstr | null }
        Returns: string
      }
      uuid_to_millis: {
        Args: { uuid1: uuidstr | null }
        Returns: bigintnum
      }
    }
    Enums: {
      activity_category: ActivityCategory
      activity_status: ActivityStatus
      battle_phase: BattlePhase
      deal_status: DealStatus
      deal_type: DealType
      entity_type: EntityType
      gender_type: GenderType
      group_visibility: GroupVisibility
      merge_request_status: MergeRequestStatus
      notification_type: NotificationType
      organization_role: OrganizationRole
      price_range: PriceRange
      swipe_action: SwipeAction
      verification_status: VerificationStatus
    }
    CompositeTypes: {
      ActivityBoostV1: ActivityBoostV1
      ActivityDiscoverCardV1: ActivityDiscoverCardV1
      ActivityEditDetailV1: ActivityEditDetailV1
      ActivityMetricsV1: ActivityMetricsV1
      ActivityV1: ActivityV1
      ActivityWithDealV1: ActivityWithDealV1
      AssetV1: AssetV1
      BattleDetailV1: BattleDetailV1
      BattleFinalistDetailV1: BattleFinalistDetailV1
      BattleFinalistV1: BattleFinalistV1
      BattleMemberStatusV1: BattleMemberStatusV1
      BattleMemberVoteV1: BattleMemberVoteV1
      BattleMiniGameResultV1: BattleMiniGameResultV1
      BattleResultsV1: BattleResultsV1
      BattleV1: BattleV1
      BattleWithFinalistsV1: BattleWithFinalistsV1
      BizActivityAnalyticsV1: BizActivityAnalyticsV1
      BizAnalyticsDailyV1: BizAnalyticsDailyV1
      BizAnalyticsOverviewV1: BizAnalyticsOverviewV1
      BizDealAnalyticsV1: BizDealAnalyticsV1
      BusinessV1: BusinessV1
      ConversationMessageAssetV1: ConversationMessageAssetV1
      ConversationMessageAssetWithDetailsV1: ConversationMessageAssetWithDetailsV1
      ConversationMessageAssetWithObjectV1: ConversationMessageAssetWithObjectV1
      ConversationMessageV1: ConversationMessageV1
      ConversationMessageWithDetailsV1: ConversationMessageWithDetailsV1
      ConversationMessageWithEntityTypeV1: ConversationMessageWithEntityTypeV1
      ConversationParticipantV1: ConversationParticipantV1
      ConversationParticipantWithDetailsV1: ConversationParticipantWithDetailsV1
      ConversationV1: ConversationV1
      ConversationWithContentV1: ConversationWithContentV1
      ConversationWithMessagesAndEntityTypeV1: ConversationWithMessagesAndEntityTypeV1
      DealActivityV1: DealActivityV1
      DealMetricsV1: DealMetricsV1
      DealRedeemDetailV1: DealRedeemDetailV1
      DealRedemptionV1: DealRedemptionV1
      DealV1: DealV1
      DealWithMetricsV1: DealWithMetricsV1
      EntityV1: EntityV1
      GroupChatDataV1: GroupChatDataV1
      GroupChatMessageV1: GroupChatMessageV1
      GroupChatPreviewV1: GroupChatPreviewV1
      GroupChatReactionV1: GroupChatReactionV1
      GroupMemberV1: GroupMemberV1
      GroupMemberWithProfileV1: GroupMemberWithProfileV1
      GroupRankedActivityV1: GroupRankedActivityV1
      GroupSwipeActivityV1: GroupSwipeActivityV1
      InviteV1: InviteV1
      InviteWithProfileV1: InviteWithProfileV1
      MemberReadinessV1: MemberReadinessV1
      MergeOpportunityV1: MergeOpportunityV1
      MergeRequestV1: MergeRequestV1
      MergeScreenDataV1: MergeScreenDataV1
      NearbyUserV1: NearbyUserV1
      NotificationV1: NotificationV1
      OpenPlanetCardV1: OpenPlanetCardV1
      OrbitChatMessageV1: OrbitChatMessageV1
      OrbitMemberV1: OrbitMemberV1
      OrbitScreenDataV1: OrbitScreenDataV1
      OrganizationMembershipV1: OrganizationMembershipV1
      OrganizationV1: OrganizationV1
      PlanetGroupDetailV1: PlanetGroupDetailV1
      PlanetGroupSummaryV1: PlanetGroupSummaryV1
      PlanetGroupV1: PlanetGroupV1
      PlanetGroupWithMembersV1: PlanetGroupWithMembersV1
      PlanetUserSearchResultV1: PlanetUserSearchResultV1
      ProfileUpdateV1: ProfileUpdateV1
      ProfileV1: ProfileV1
      ProfileWithEmailV1: ProfileWithEmailV1
      SwipeV1: SwipeV1
      SwipeWithActivityV1: SwipeWithActivityV1
      UserAppProfileV1: UserAppProfileV1
      UserPreferenceV1: UserPreferenceV1
      UserStatsV1: UserStatsV1
      UserV1: UserV1
      VerificationDocumentV1: VerificationDocumentV1
      VoteV1: VoteV1
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_category: [
        "NIGHTLIFE",
        "FOOD_AND_DRINKS",
        "OUTDOOR",
        "LIVE_MUSIC",
        "SPORTS",
        "ARTS",
        "GAMING",
        "WELLNESS",
        "COMEDY",
      ],
      activity_status: ["ACTIVE", "PAUSED", "PENDING_REVIEW"],
      battle_phase: [
        "VOTING_OPEN",
        "VOTING_CLOSED",
        "CALCULATING",
        "WINNER_REVEALED",
      ],
      deal_status: ["ACTIVE", "EXPIRED", "SCHEDULED"],
      deal_type: ["PERCENTAGE_OFF", "FIXED_AMOUNT", "BOGO", "FREE_ITEM"],
      entity_type: ["PERSON", "SYSTEM", "BOT"],
      gender_type: ["MALE", "FEMALE", "NON_BINARY"],
      group_visibility: ["PUBLIC", "PRIVATE"],
      merge_request_status: ["PENDING", "INITIATED", "MERGED", "DECLINED"],
      notification_type: [
        "GROUP_INVITE",
        "BATTLE_STARTED",
        "BATTLE_ENDED",
        "DEAL_EXPIRING",
        "FRIEND_JOINED",
        "GROUP_ACTIVITY",
        "MERGE_REQUEST",
        "MERGE_INITIATED",
        "MERGE_DECLINED",
        "ORBIT_ACTIVITY",
      ],
      organization_role: ["OWNER", "ADMIN", "MEMBER"],
      price_range: ["FREE", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"],
      swipe_action: ["LIKE", "PASS", "SUPER_LIKE"],
      verification_status: ["NOT_STARTED", "PENDING", "VERIFIED", "FAILED"],
    },
  },
} as const
