CREATE TYPE public.notification_type AS ENUM (
  'GROUP_INVITE',
  'BATTLE_STARTED',
  'BATTLE_ENDED',
  'DEAL_EXPIRING',
  'FRIEND_JOINED',
  'GROUP_ACTIVITY',
  'MERGE_REQUEST',
  'MERGE_INITIATED',
  'MERGE_DECLINED',
  'ORBIT_ACTIVITY'
);

COMMENT ON TYPE public.notification_type IS '
description: Types of notifications in the Planet app
values:
  GROUP_INVITE: Invitation to join a group
  BATTLE_STARTED: A voting battle has begun
  BATTLE_ENDED: Battle complete with winner
  DEAL_EXPIRING: A saved deal is expiring soon
  FRIEND_JOINED: A friend joined Planet
  GROUP_ACTIVITY: Activity in a group
  MERGE_REQUEST: Two groups chose the same activity tonight
  MERGE_INITIATED: Initiating host wants to merge
  MERGE_DECLINED: Other group declined the merge
  ORBIT_ACTIVITY: A group you are orbiting has selected an activity
';
