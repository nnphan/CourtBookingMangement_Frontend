import type { ApiResponse } from '@/types/api';

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
  feePerPlayer: number;
}

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
