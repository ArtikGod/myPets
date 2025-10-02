import { Pool } from 'pg';
import { DATABASE_CONFIG, SQL_QUERIES } from '../constants';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: DATABASE_CONFIG.HOST,
  port: DATABASE_CONFIG.PORT,
  database: DATABASE_CONFIG.NAME,
  user: DATABASE_CONFIG.USER,
  password: DATABASE_CONFIG.PASSWORD,
  min: DATABASE_CONFIG.POOL_MIN,
  max: DATABASE_CONFIG.POOL_MAX,
});

export interface Idea {
  id: number;
  title: string;
  description: string;
  votes_count: number;
  created_at: Date;
}

export interface Vote {
  id: number;
  idea_id: number;
  ip_address: string;
  created_at: Date;
}

export class Database {
  static async getIdeas(): Promise<Idea[]> {
    const result = await pool.query(SQL_QUERIES.GET_IDEAS);
    return result.rows;
  }

  static async getIdeaById(id: number): Promise<Idea | null> {
    const result = await pool.query(SQL_QUERIES.GET_IDEA_BY_ID, [id]);
    return result.rows[0] || null;
  }

  static async hasVotedForIdea(ideaId: number, ipAddress: string): Promise<boolean> {
    const result = await pool.query(
      SQL_QUERIES.CHECK_VOTE_EXISTS,
      [ideaId, ipAddress]
    );
    return result.rows.length > 0;
  }

  static async getVoteCountByIP(ipAddress: string): Promise<number> {
    const result = await pool.query(
      SQL_QUERIES.COUNT_VOTES_BY_IP,
      [ipAddress]
    );
    return parseInt(result.rows[0].count);
  }

  static async addVote(ideaId: number, ipAddress: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query(SQL_QUERIES.BEGIN_TRANSACTION);
      
      await client.query(
        SQL_QUERIES.INSERT_VOTE,
        [ideaId, ipAddress]
      );
      
      await client.query(
        SQL_QUERIES.UPDATE_VOTE_COUNT,
        [ideaId]
      );
      
      await client.query(SQL_QUERIES.COMMIT_TRANSACTION);
    } catch (error) {
      await client.query(SQL_QUERIES.ROLLBACK_TRANSACTION);
      throw error;
    } finally {
      client.release();
    }
  }
}