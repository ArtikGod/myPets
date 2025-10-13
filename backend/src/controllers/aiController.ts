import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { aiService } from '../services/aiService';
import { ERROR_MESSAGES, API_MESSAGES } from '../constants';

const prisma = new PrismaClient();

export const generateExercise = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: ERROR_MESSAGES.ADMIN_REQUIRED,
      });
      return;
    }

    const { category, difficulty, language, userContext } = req.body;

    if (!category) {
      res.status(400).json({
        success: false,
        error: 'Category is required',
      });
      return;
    }

    const validCategories = ['meditation', 'breathing', 'gratitude', 'mindfulness', 'reflection', 'relaxation'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
      return;
    }

    const validLanguages = ['ru', 'en'];
    if (language && !validLanguages.includes(language)) {
      res.status(400).json({
        success: false,
        error: 'Invalid language',
      });
      return;
    }

    if (!aiService.isConfigured()) {
      res.status(503).json({
        success: false,
        error: ERROR_MESSAGES.AI_SERVICE_ERROR,
      });
      return;
    }

    const userId = req.user!.id;

    const generatedExercise = await aiService.generateExercise({
      category,
      difficulty,
      language: language || 'ru',
      userContext,
    });

    const exercise = await prisma.exercise.create({
      data: {
        title: generatedExercise.title,
        titleEn: language === 'en' ? generatedExercise.title : undefined,
        description: generatedExercise.description,
        descriptionEn: language === 'en' ? generatedExercise.description : undefined,
        category: generatedExercise.category,
        categoryEn: language === 'en' ? generatedExercise.category : undefined,
        order: 0,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        exercise,
        generated: generatedExercise,
      },
      message: API_MESSAGES.SUCCESS.EXERCISE_CREATED,
    });
  } catch (error) {
    console.error('Error generating exercise:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.AI_SERVICE_ERROR,
    });
  }
};

export const generateCustomTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, difficulty, language, userContext } = req.body;

    if (!category) {
      res.status(400).json({
        success: false,
        error: 'Category is required',
      });
      return;
    }

    const validCategories = ['meditation', 'breathing', 'gratitude', 'mindfulness', 'reflection', 'relaxation'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        error: 'Invalid category',
      });
      return;
    }

    const validLanguages = ['ru', 'en'];
    if (language && !validLanguages.includes(language)) {
      res.status(400).json({
        success: false,
        error: 'Invalid language',
      });
      return;
    }

    if (!aiService.isConfigured()) {
      res.status(503).json({
        success: false,
        error: ERROR_MESSAGES.AI_SERVICE_ERROR,
      });
      return;
    }

    const userId = req.user!.id;

    const generatedExercise = await aiService.generateExercise({
      category,
      difficulty,
      language: language || 'ru',
      userContext,
    });

    const customTask = await prisma.customTask.create({
      data: {
        userId,
        title: generatedExercise.title,
        titleEn: language === 'en' ? generatedExercise.title : undefined,
        description: generatedExercise.description,
        descriptionEn: language === 'en' ? generatedExercise.description : undefined,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        customTask,
        generated: generatedExercise,
      },
      message: API_MESSAGES.SUCCESS.CUSTOM_TASK_CREATED,
    });
  } catch (error) {
    console.error('Error generating custom task:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.AI_SERVICE_ERROR,
    });
  }
};

export const generateBulkExercises = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: ERROR_MESSAGES.ADMIN_REQUIRED,
      });
      return;
    }

    if (!aiService.isConfigured()) {
      res.status(503).json({
        success: false,
        error: ERROR_MESSAGES.AI_SERVICE_ERROR,
      });
      return;
    }

    const { count = 5, category, difficulty, language } = req.body;

    if (count > 10) {
      res.status(400).json({
        success: false,
        error: 'Maximum 10 exercises can be generated at once',
      });
      return;
    }

    const generatedExercises = await aiService.generateMultipleExercises(count, {
      category,
      difficulty,
      language: language || 'ru',
    });

    const exercises = await Promise.all(
      generatedExercises.map((generated, index) =>
        prisma.exercise.create({
          data: {
            title: generated.title,
            titleEn: language === 'en' ? generated.title : undefined,
            description: generated.description,
            descriptionEn: language === 'en' ? generated.description : undefined,
            category: generated.category,
            categoryEn: language === 'en' ? generated.category : undefined,
            order: index,
            isActive: true,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      data: {
        exercises,
        generated: generatedExercises,
        count: exercises.length,
      },
      message: `${exercises.length} exercises generated successfully`,
    });
  } catch (error) {
    console.error('Error generating bulk exercises:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.AI_SERVICE_ERROR,
    });
  }
};

export const getAIStatus = async (req: Request, res: Response) => {
  try {
    const isConfigured = aiService.isConfigured();
    
    res.json({
      success: true,
      data: {
        aiEnabled: isConfigured,
        status: isConfigured ? 'available' : 'not_configured',
        message: isConfigured 
          ? 'AI service is available' 
          : 'AI service is not configured',
      },
    });
  } catch (error) {
    console.error('Error checking AI status:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const improveExercise = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!aiService.isConfigured()) {
      res.status(503).json({
        success: false,
        error: ERROR_MESSAGES.AI_SERVICE_ERROR,
      });
      return;
    }

    const { exerciseId } = req.params;
    const { improvementRequest, language } = req.body;

    const existingExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!existingExercise) {
      res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.EXERCISE_NOT_FOUND,
      });
      return;
    }

    const userContext = `Improve this existing exercise: "${existingExercise.title}" - "${existingExercise.description}". ${improvementRequest || 'Make it more engaging and effective.'}`;

    const improvedExercise = await aiService.generateExercise({
      category: existingExercise.category,
      language: language || 'ru',
      userContext,
    });

    res.json({
      success: true,
      data: {
        original: existingExercise,
        improved: improvedExercise,
      },
      message: 'Exercise improvement generated successfully',
    });
  } catch (error) {
    console.error('Error improving exercise:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.AI_SERVICE_ERROR,
    });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { AI_CATEGORIES } = await import('../constants');
    
    res.json({
      success: true,
      data: AI_CATEGORIES,
      message: 'Categories retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const getPrompts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const { AI_PROMPTS } = await import('../constants');
    
    let data: any = AI_PROMPTS;
    
    if (category && typeof category === 'string') {
      const categoryPrompts = AI_PROMPTS[category as keyof typeof AI_PROMPTS];
      data = categoryPrompts ? { [category]: categoryPrompts } : {};
    }
    
    res.json({
      success: true,
      data,
      message: 'Prompts retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting prompts:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};