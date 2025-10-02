import React, { useState, useEffect } from 'react';
import { Idea } from './types';
import { apiService } from './services/api';
import { UI_MESSAGES } from './constants';
import { useVoting } from './hooks/useVoting';
import IdeaCard from './components/IdeaCard';
import './App.css';

const App: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { startVoting, finishVoting, isVoting, hasVoted } = useVoting();

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getIdeas();
      setIdeas(data);
      
      await checkVoteStatuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : UI_MESSAGES.ERROR_LOADING);
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatuses = async (ideas: Idea[]) => {
    try {
      const statusPromises = ideas.map(idea =>
        apiService.checkVoteStatus(idea.id)
      );
      
      const statuses = await Promise.all(statusPromises);
      
      statuses.forEach((status, index) => {
        if (status.hasVoted) {
          finishVoting(ideas[index].id, true);
        }
      });
    } catch (err) {
      console.error('Ошибка при проверке статусов голосования:', err);
    }
  };

  const handleVote = async (ideaId: number) => {
    try {
      startVoting(ideaId);
      await apiService.voteForIdea(ideaId);
      
      setIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === ideaId
            ? { ...idea, votes_count: idea.votes_count + 1 }
            : idea
        )
      );
      
      finishVoting(ideaId, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : UI_MESSAGES.ERROR_VOTING;
      
      const alreadyVoted = errorMessage.includes('уже голосовали');
      finishVoting(ideaId, alreadyVoted);
      
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          {UI_MESSAGES.LOADING}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>LogicLike - Голосование за идеи</h1>
        <p>Выберите идеи для развития нашего продукта и проголосуйте за самые интересные!</p>
      </header>

      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px' }}>
            ✕
          </button>
        </div>
      )}

      <div className="ideas-list">
        {ideas.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            isVoting={isVoting(idea.id)}
            hasVoted={hasVoted(idea.id)}
            onVote={handleVote}
          />
        ))}
      </div>

      {ideas.length === 0 && !loading && (
        <div className="loading">
          Идеи не найдены
        </div>
      )}
    </div>
  );
};

export default App;