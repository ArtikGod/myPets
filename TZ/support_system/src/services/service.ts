import { AppDataSource } from '../config/database';
import { Appeal } from '../entities/entity';
import { APPEAL_STATUS, ERROR_MESSAGES } from '../config/constants';

export class AppealService {
    private appealRepository = AppDataSource.getRepository(Appeal);
  
    async createAppeal(topic: string, description: string): Promise<Appeal> {
      const appeal = new Appeal();
      appeal.topic = topic;
      appeal.description = description;
      return this.appealRepository.save(appeal);
    }

  async updateStatus(id: number, newStatus: string, resolution?: string, reason?: string): Promise<Appeal> {
    const appeal = await this.appealRepository.findOneBy({id});
    if (!appeal) throw new Error(ERROR_MESSAGES.APPEAL_NOT_FOUND);

    if (!this.isValidTransition(appeal.status, newStatus)) {
      throw new Error(ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    appeal.status = newStatus;
    
    if (newStatus === APPEAL_STATUS.COMPLETED && resolution) {
      appeal.resolutionText = resolution;
    }
    if (newStatus === APPEAL_STATUS.CANCELED && reason) {
    appeal.cancellationReason = reason;
  }
    
    return this.appealRepository.save(appeal);
  }

  async cancelAllInProgress(reason: string): Promise<void> {
    await this.appealRepository.createQueryBuilder()
      .update()
      .set({ 
        status: APPEAL_STATUS.CANCELED,
        cancellationReason: reason 
      })
      .where("status = :status", { status: APPEAL_STATUS.IN_PROGRESS })
      .execute();
  }

  private isValidTransition(currentStatus: string, newStatus: string): boolean {
    const allowedTransitions = {
      [APPEAL_STATUS.NEW]: [APPEAL_STATUS.IN_PROGRESS, APPEAL_STATUS.CANCELED],
      [APPEAL_STATUS.IN_PROGRESS]: [APPEAL_STATUS.COMPLETED, APPEAL_STATUS.CANCELED],
      [APPEAL_STATUS.COMPLETED]: [],
      [APPEAL_STATUS.CANCELED]: []
    };
    return allowedTransitions[currentStatus].includes(newStatus);
  }

  async getAppealById(id: number): Promise<Appeal | null> {
    return this.appealRepository.findOne({ 
      where: { id },
    });
  }

  async getAppeals(startDate?: Date, endDate?: Date): Promise<Appeal[]> {
    const query = this.appealRepository.createQueryBuilder('appeal').take(1000);
    
    if (startDate && endDate) {
      query.where('appeal.createdAt BETWEEN :start AND :end', { 
        start: startDate, 
        end: endDate 
      });
    } else if (startDate) {
      query.where('appeal.createdAt >= :start', { start: startDate });
    } else if (endDate) {
      query.where('appeal.createdAt <= :end', { end: endDate });
    }

    return query.getMany();
  }
}