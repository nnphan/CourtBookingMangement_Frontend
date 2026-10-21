import type { ApiResponse, ApiSuccessResponse } from '@/types/api';

export type SkillLevel =
  'All' | 'Beginner' | 'Beginner+' | 'Intermediate' | 'Advanced' | 'Professional';

export type MatchGender = 'All' | 'Male' | 'Female' | 'Mixed' | 'Any';

export type MatchStatus = 'OPEN' | 'FULL' | 'CANCELLED' | 'EXPIRED';

export type PlayerMatchSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
export type PlayerMatchGenderPreference = 'MALE' | 'FEMALE' | 'BOTH';

export interface CreatePlayerMatchRequest {
  bookingId: string;
  branchId: string;
  courtId: string;
  title: string;
  description?: string;
  matchDate: string;
  startTime: string;
  endTime: string;
  skillLevel: PlayerMatchSkillLevel;
  genderPreference: PlayerMatchGenderPreference;
  maxPlayers: number;
  currentPlayers: number;
  feePerPlayer: number;
}

export type PlayerMatchSort = 'latest' | 'oldest' | 'match_date_asc' | 'match_date_desc';

export interface PlayerMatchSearchParams {
  keyword?: string;
  matchDate?: string;
  startTime?: string;
  endTime?: string;
  skillLevel?: PlayerMatchSkillLevel;
  genderPreference?: PlayerMatchGenderPreference;
  city?: string;
  district?: string;
  sortBy?: PlayerMatchSort;
  page: number;
  pageSize: number;
}

export interface PlayerMatchListItem {
  id: string;
  title: string;
  branchId: string;
  bookingId: string | null;
  branchName: string;
  courtName: string;
  matchDate: string;
  startTime: string;
  endTime: string;
  skillLevel: string;
  genderPreference: string;
  maxPlayers: number;
  currentPlayers: number;
  remainingSlots: number;
  feePerPlayer: number;
  status: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface JoinPlayerMatchResponse {
  matchId: string;
  joinRequestId: string;
  status: string;
  message: string;
}

export interface HostedPlayerMatch {
  id: string;
  title: string;
  branchId: string;
  branchName: string;
  courtId: string | null;
  courtName: string | null;
  matchDate: string;
  startTime: string;
  endTime: string;
  skillLevel: string;
  genderPreference: string;
  maxPlayers: number;
  currentPlayers: number;
  remainingSlots: number;
  feePerPlayer: number | null;
  status: string;
  pendingRequestCount: number;
  isFull: boolean;
}

export interface PlayerMatchJoinRequest {
  requestId: string;
  matchId: string;
  userId: string;
  fullName: string;
  skillLevel?: PlayerMatchSkillLevel | null;
  status: string;
  requestedAt: string;
}

export interface ProcessJoinRequestVariables {
  matchId: string;
  requestId: string;
  fullName: string;
}

export interface ParticipatingPlayerMatch {
  matchId: string;
  title: string;
  branchId: string;
  branchName: string;
  courtId: string | null;
  courtName: string | null;
  matchDate: string;
  startTime: string;
  endTime: string;
  skillLevel: string;
  genderPreference: string;
  maxPlayers: number;
  currentPlayers: number;
  remainingSlots: number;
  feePerPlayer: number | null;
  matchStatus: string;
  participationStatus: string;
  requestId: string | null;
  requestedAt: string | null;
  createdByName: string;
  canCancelRequest: boolean;
}

export interface HostedPlayerMatchesParams {
  status?: string;
  keyword?: string;
  matchDate?: string;
  page: number;
  pageSize: number;
}

export interface ParticipatingPlayerMatchesParams {
  participationStatus?: string;
  matchStatus?: string;
  fromDate?: string;
  page: number;
  pageSize: number;
}

export interface PlayerMatchParticipant {
  userId: string;
  fullName: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface PlayerMatchDetail {
  id: string;
  title: string;
  description: string | null;
  branchId: string;
  bookingId: string | null;
  branchName: string;
  city: string;
  district: string;
  courtName: string | null;
  matchDate: string;
  startTime: string;
  endTime: string;
  skillLevel: string;
  genderPreference: string;
  maxPlayers: number;
  currentPlayers: number;
  remainingSlots: number;
  feePerPlayer: number;
  status: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  participantCount: number;
  isFull: boolean;
  canJoin: boolean;
  participants: PlayerMatchParticipant[];
}

export type PlayerMatchListResponse = ApiSuccessResponse<PlayerMatchListItem[]>;

export interface MatchHost {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  skillLevel?: SkillLevel;
}

export interface MatchItem {
  id: string;
  host: MatchHost;
  branchId: string;
  branchName: string;
  courtId: string;
  courtName: string;
  date: string; // ISO date string: YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  skillLevel: SkillLevel;
  gender: MatchGender;
  currentPlayers: number;
  requiredPlayers: number;
  remainingSlots: number;
  status: MatchStatus;
  description: string;
  feePerPlayer?: number;
  createdAt?: string;
}

export interface PlayerMatchingStats {
  openMatches: number;
  activePlayers?: number;
  completedMatches?: number;
}

export interface PlayerMatchingFilterParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  branchId?: string;
  matchDate?: string;
  skillLevel?: string;
  gender?: string;
  availableSlots?: number;
  status?: string;
}

export type PlayerMatchingResponse = ApiResponse<MatchItem[]>;
export type PlayerMatchingStatsResponse = ApiResponse<PlayerMatchingStats>;
