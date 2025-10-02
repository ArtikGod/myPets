import React from 'react';
import { Idea } from '../types';
import { UI_MESSAGES } from '../constants';
import VoteButton from './VoteButton';

interface IdeaCardProps {
  idea: Idea;
  isVoting: boolean;
  hasVoted: boolean;
  onVote: (ideaId: number) => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, isVoting, hasVoted, onVote }) => {
  return (
    <div className="idea-card">
      <h3 className="idea-title">{idea.title}</h3>
      <p className="idea-description">{idea.description}</p>
      <div className="idea-footer">
        <span className="votes-count">
          {UI_MESSAGES.VOTES_PLURAL(idea.votes_count)}
        </span>
        <VoteButton
          ideaId={idea.id}
          isVoting={isVoting}
          hasVoted={hasVoted}
          onVote={onVote}
        />
      </div>
    </div>
  );
};

export default IdeaCard;