export interface Idea {
  id: number;
  title: string;
  description: string;
  votes_count: number;
  created_at: string;
}

export interface VoteResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface VoteStatusResponse {
  hasVoted: boolean;
}

export interface VotingState {
  votingIds: Set<number>;
  votedIds: Set<number>;
}