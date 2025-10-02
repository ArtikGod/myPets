import { Database } from '../models/database';
import { VOTE_LIMITS, ERROR_MESSAGES, SUCCESS_MESSAGES, LOG_MESSAGES } from '../constants';

export class VotingService {
  static async voteForIdea(ideaId: number, ipAddress: string): Promise<{ success: boolean; message: string }> {
    try {
      const idea = await Database.getIdeaById(ideaId);
      if (!idea) {
        return {
          success: false,
          message: ERROR_MESSAGES.IDEA_NOT_FOUND
        };
      }

      const hasVoted = await Database.hasVotedForIdea(ideaId, ipAddress);
      if (hasVoted) {
        return {
          success: false,
          message: ERROR_MESSAGES.ALREADY_VOTED
        };
      }

      const voteCount = await Database.getVoteCountByIP(ipAddress);
      if (voteCount >= VOTE_LIMITS.MAX_VOTES_PER_IP) {
        return {
          success: false,
          message: ERROR_MESSAGES.VOTE_LIMIT_EXCEEDED
        };
      }

      await Database.addVote(ideaId, ipAddress);

      return {
        success: true,
        message: SUCCESS_MESSAGES.VOTE_RECORDED
      };
    } catch (error) {
      console.error(LOG_MESSAGES.VOTING_ERROR, error);
      return {
        success: false,
        message: ERROR_MESSAGES.DATABASE_ERROR
      };
    }
  }

  static async getIdeas() {
    try {
      return await Database.getIdeas();
    } catch (error) {
      console.error(LOG_MESSAGES.IDEAS_FETCH_ERROR, error);
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
    }
  }

  static async hasVotedForIdea(ideaId: number, ipAddress: string): Promise<boolean> {
    try {
      return await Database.hasVotedForIdea(ideaId, ipAddress);
    } catch (error) {
      console.error(LOG_MESSAGES.VOTING_ERROR, error);
      return false;
    }
  }
}