import React from 'react';
import { VOTE_BUTTON_STATES } from '../constants';

interface VoteButtonProps {
  ideaId: number;
  isVoting: boolean;
  hasVoted: boolean;
  onVote: (ideaId: number) => void;
}

const VoteButton: React.FC<VoteButtonProps> = ({ ideaId, isVoting, hasVoted, onVote }) => {
  const getButtonText = () => {
    if (isVoting) return VOTE_BUTTON_STATES.VOTING;
    if (hasVoted) return VOTE_BUTTON_STATES.VOTED;
    return VOTE_BUTTON_STATES.AVAILABLE;
  };

  const handleClick = () => {
    if (!isVoting && !hasVoted) {
      onVote(ideaId);
    }
  };

  return (
    <button
      className="vote-button"
      onClick={handleClick}
      disabled={isVoting || hasVoted}
    >
      {isVoting && <div className="spinner"></div>}
      {getButtonText()}
    </button>
  );
};

export default VoteButton;