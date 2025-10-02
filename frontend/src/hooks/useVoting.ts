import { useState, useCallback } from 'react';
import { VotingState } from '../types';

export const useVoting = () => {
  const [votingState, setVotingState] = useState<VotingState>({
    votingIds: new Set(),
    votedIds: new Set()
  });

  const startVoting = useCallback((ideaId: number) => {
    setVotingState(prev => {
      const newVotingIds = new Set(prev.votingIds);
      newVotingIds.add(ideaId);
      return {
        ...prev,
        votingIds: newVotingIds
      };
    });
  }, []);

  const finishVoting = useCallback((ideaId: number, success: boolean) => {
    setVotingState(prev => {
      const newVotingIds = new Set(prev.votingIds);
      newVotingIds.delete(ideaId);
      
      const newVotedIds = new Set(prev.votedIds);
      if (success) {
        newVotedIds.add(ideaId);
      }
      
      return {
        votingIds: newVotingIds,
        votedIds: newVotedIds
      };
    });
  }, []);

  const isVoting = useCallback((ideaId: number) => {
    return votingState.votingIds.has(ideaId);
  }, [votingState.votingIds]);

  const hasVoted = useCallback((ideaId: number) => {
    return votingState.votedIds.has(ideaId);
  }, [votingState.votedIds]);

  return {
    startVoting,
    finishVoting,
    isVoting,
    hasVoted
  };
};