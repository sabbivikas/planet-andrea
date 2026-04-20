CREATE TYPE public.battle_phase AS ENUM (
  'VOTING_OPEN',
  'VOTING_CLOSED',
  'CALCULATING',
  'WINNER_REVEALED'
);

COMMENT ON TYPE public.battle_phase IS '
description: Phases of a voting battle
values:
  VOTING_OPEN: Members can submit votes
  VOTING_CLOSED: Voting period ended
  CALCULATING: Processing final results
  WINNER_REVEALED: Battle complete with winner
';
