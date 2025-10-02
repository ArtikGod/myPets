import axios from 'axios';
import { Idea, VoteResponse, ErrorResponse, VoteStatusResponse } from '../types';
import { API_ENDPOINTS, ERROR_MESSAGES, API_CONFIG } from '../constants';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || API_CONFIG.DEFAULT_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

export const apiService = {
  async getIdeas(): Promise<Idea[]> {
    try {
      const response = await api.get<Idea[]>(API_ENDPOINTS.IDEAS);
      return response.data;
    } catch (error) {
      console.error(ERROR_MESSAGES.LOADING_IDEAS_ERROR, error);
      throw new Error(ERROR_MESSAGES.FAILED_TO_LOAD_IDEAS);
    }
  },

  async voteForIdea(ideaId: number): Promise<VoteResponse> {
    try {
      const response = await api.post<VoteResponse>(API_ENDPOINTS.VOTE(ideaId));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.error || ERROR_MESSAGES.VOTING_ERROR_DEFAULT);
      }
      console.error(ERROR_MESSAGES.LOADING_IDEAS_ERROR, error);
      throw new Error(ERROR_MESSAGES.FAILED_TO_VOTE);
    }
  },

  async checkVoteStatus(ideaId: number): Promise<VoteStatusResponse> {
    try {
      const response = await api.get<VoteStatusResponse>(API_ENDPOINTS.VOTE_STATUS(ideaId));
      return response.data;
    } catch (error) {
      console.error(ERROR_MESSAGES.VOTE_STATUS_CHECK_ERROR, error);
      return { hasVoted: false };
    }
  }
};