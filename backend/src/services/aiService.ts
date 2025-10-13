import { AI_CONFIG } from '../constants';

interface GenerateExerciseRequest {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: 'ru' | 'en';
  userContext?: string;
}

interface GeneratedExercise {
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  message: OpenAIMessage;
  finish_reason: string;
  index: number;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI features will be disabled.');
    }
  }

  async generateExercise(request: GenerateExerciseRequest): Promise<GeneratedExercise> {
    if (!this.apiKey) {
      throw new Error('AI service is not configured');
    }

    const { category = 'mindfulness', difficulty = 'medium', language = 'ru', userContext } = request;

    const systemPrompt = this.buildSystemPrompt(language);
    const userPrompt = this.buildUserPrompt(category, difficulty, userContext, language);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_CONFIG.MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: AI_CONFIG.MAX_TOKENS,
          temperature: AI_CONFIG.TEMPERATURE,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json() as OpenAIResponse;
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from AI service');
      }

      return this.parseAIResponse(content, category);
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to generate exercise with AI');
    }
  }

  private buildSystemPrompt(language: string): string {
    if (language === 'en') {
      return `You are a professional psychologist and wellness coach. Create psychological exercises to improve emotional well-being. 
      
      Your response must be a valid JSON object with the following structure:
      {
        "title": "Exercise title (max 100 characters)",
        "description": "Detailed exercise description (200-500 characters)",
        "estimatedTime": number (in minutes, 5-30)
      }
      
      Make exercises practical, evidence-based, and suitable for daily practice. Focus on mindfulness, emotional regulation, stress reduction, and personal growth.`;
    }

    return `Ты профессиональный психолог и коуч по благополучию. Создавай психологические упражнения для улучшения эмоционального состояния.
    
    Твой ответ должен быть валидным JSON объектом со следующей структурой:
    {
      "title": "Название упражнения (максимум 100 символов)",
      "description": "Подробное описание упражнения (200-500 символов)",
      "estimatedTime": число (в минутах, 5-30)
    }
    
    Делай упражнения практичными, основанными на доказательствах и подходящими для ежедневной практики. Фокусируйся на осознанности, эмоциональной регуляции, снижении стресса и личностном росте.`;
  }

  private buildUserPrompt(category: string, difficulty: string, userContext: string | undefined, language: string): string {
    const categoryTranslations: Record<string, { ru: string; en: string }> = {
      meditation: { ru: 'медитация', en: 'meditation' },
      breathing: { ru: 'дыхательные практики', en: 'breathing exercises' },
      gratitude: { ru: 'благодарность', en: 'gratitude' },
      mindfulness: { ru: 'осознанность', en: 'mindfulness' },
      reflection: { ru: 'рефлексия', en: 'reflection' },
      relaxation: { ru: 'расслабление', en: 'relaxation' },
    };

    const difficultyTranslations: Record<string, { ru: string; en: string }> = {
      easy: { ru: 'простое', en: 'easy' },
      medium: { ru: 'среднее', en: 'medium' },
      hard: { ru: 'сложное', en: 'advanced' },
    };

    const categoryName = categoryTranslations[category]?.[language as 'ru' | 'en'] || category;
    const difficultyName = difficultyTranslations[difficulty]?.[language as 'ru' | 'en'] || difficulty;

    if (language === 'en') {
      let prompt = `Create a ${difficultyName} ${categoryName} exercise.`;
      
      if (userContext) {
        prompt += ` Consider this context: ${userContext}`;
      }
      
      prompt += ` The exercise should be practical and achievable for someone with any experience level.`;
      
      return prompt;
    }

    let prompt = `Создай ${difficultyName} упражнение по категории "${categoryName}".`;
    
    if (userContext) {
      prompt += ` Учти этот контекст: ${userContext}`;
    }
    
    prompt += ` Упражнение должно быть практичным и выполнимым для человека с любым уровнем опыта.`;
    
    return prompt;
  }

  private parseAIResponse(content: string, category: string): GeneratedExercise {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      const parsed = JSON.parse(jsonString);
      
      return {
        title: parsed.title || 'Generated Exercise',
        description: parsed.description || 'AI generated psychological exercise',
        category: category,
        estimatedTime: parsed.estimatedTime || 10,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      return {
        title: 'AI Generated Exercise',
        description: content.substring(0, 500),
        category: category,
        estimatedTime: 10,
      };
    }
  }

  async generateMultipleExercises(
    count: number,
    request: GenerateExerciseRequest
  ): Promise<GeneratedExercise[]> {
    const exercises: GeneratedExercise[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const exercise = await this.generateExercise(request);
        exercises.push(exercise);
        
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to generate exercise ${i + 1}:`, error);
      }
    }
    
    return exercises;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const aiService = new AIService();