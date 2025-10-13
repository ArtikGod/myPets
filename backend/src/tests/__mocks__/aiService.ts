export const mockAiService = {
  isConfigured: jest.fn(() => true),
  generateExercise: jest.fn(async (request: any) => {
    // Валидация для тестов
    if (!request.category) {
      throw new Error('Missing required fields');
    }
    if (!['meditation', 'breathing', 'gratitude', 'mindfulness', 'reflection', 'relaxation'].includes(request.category)) {
      throw new Error('Invalid category');
    }
    if (request.language && !['ru', 'en'].includes(request.language)) {
      throw new Error('Invalid language');
    }
    
    return {
      title: 'Test Exercise',
      titleEn: request.language === 'en' ? 'Test Exercise' : undefined,
      description: 'Test exercise description',
      descriptionEn: request.language === 'en' ? 'Test exercise description' : undefined,
      category: request.category || 'meditation',
      categoryEn: request.language === 'en' ? request.category || 'meditation' : undefined,
      estimatedTime: 10,
    };
  }),
  generateMultipleExercises: jest.fn(async (count: number, request: any) => {
    const exercises = [];
    for (let i = 0; i < count; i++) {
      exercises.push({
        title: `Test Exercise ${i + 1}`,
        description: `Test exercise description ${i + 1}`,
        category: request.category || 'meditation',
        estimatedTime: 10,
      });
    }
    return exercises;
  }),
};

// Мокаем весь модуль
jest.mock('../../services/aiService', () => ({
  aiService: mockAiService,
}));

export { mockAiService as aiService };