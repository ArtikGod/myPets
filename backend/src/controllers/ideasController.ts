import { Request, Response } from 'express';
import { VotingService } from '../services/votingService';
import { getClientIP } from '../utils/ip';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export class IdeasController {
  static async getIdeas(req: Request, res: Response): Promise<void> {
    try {
      const ideas = await VotingService.getIdeas();
      res.json(ideas);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }

  static async voteForIdea(req: Request, res: Response): Promise<void> {
    try {
      const ideaId = parseInt(req.params.id);
      
      if (isNaN(ideaId) || ideaId <= 0) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          error: ERROR_MESSAGES.INVALID_IDEA_ID
        });
        return;
      }

      const clientIP = getClientIP(req);
      const result = await VotingService.voteForIdea(ideaId, clientIP);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        const statusCode = result.message === ERROR_MESSAGES.IDEA_NOT_FOUND 
          ? HTTP_STATUS.NOT_FOUND 
          : HTTP_STATUS.CONFLICT;
        
        res.status(statusCode).json({
          error: result.message
        });
      }
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }

  static async checkVoteStatus(req: Request, res: Response): Promise<void> {
    try {
      const ideaId = parseInt(req.params.id);
      
      if (isNaN(ideaId) || ideaId <= 0) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          error: ERROR_MESSAGES.INVALID_IDEA_ID
        });
        return;
      }

      const clientIP = getClientIP(req);
      const hasVoted = await VotingService.hasVotedForIdea(ideaId, clientIP);

      res.json({ hasVoted });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: ERROR_MESSAGES.INTERNAL_ERROR
      });
    }
  }
}