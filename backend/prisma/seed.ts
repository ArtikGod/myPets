import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EXERCISES_DATA = [
  {
    title: 'Медитация осознанности',
    titleEn: 'Mindfulness Meditation',
    description: 'Найдите тихое место и сядьте удобно. Закройте глаза и сосредоточьтесь на своем дыхании. Наблюдайте за вдохами и выдохами в течение 5 минут, не пытаясь их контролировать.',
    descriptionEn: 'Find a quiet place and sit comfortably. Close your eyes and focus on your breathing. Observe your inhales and exhales for 5 minutes without trying to control them.',
    category: 'Медитация',
    categoryEn: 'Meditation',
    order: 1,
  },
  {
    title: 'Дневник благодарности',
    titleEn: 'Gratitude Journal',
    description: 'Запишите три вещи, за которые вы благодарны сегодня. Это могут быть как большие события, так и маленькие моменты радости.',
    descriptionEn: 'Write down three things you are grateful for today. These can be both big events and small moments of joy.',
    category: 'Благодарность',
    categoryEn: 'Gratitude',
    order: 2,
  },
  {
    title: 'Дыхательная практика 4-7-8',
    titleEn: '4-7-8 Breathing Technique',
    description: 'Вдохните через нос на 4 счета, задержите дыхание на 7 счетов, выдохните через рот на 8 счетов. Повторите 4 раза.',
    descriptionEn: 'Inhale through your nose for 4 counts, hold your breath for 7 counts, exhale through your mouth for 8 counts. Repeat 4 times.',
    category: 'Дыхание',
    categoryEn: 'Breathing',
    order: 3,
  },
  {
    title: 'Позитивные аффирмации',
    titleEn: 'Positive Affirmations',
    description: 'Повторите про себя или вслух: "Я достоин любви и уважения", "Я способен справиться с трудностями", "Я расту и развиваюсь каждый день".',
    descriptionEn: 'Repeat to yourself or out loud: "I am worthy of love and respect", "I am capable of handling difficulties", "I grow and develop every day".',
    category: 'Аффирмации',
    categoryEn: 'Affirmations',
    order: 4,
  },
  {
    title: 'Прогрессивная мышечная релаксация',
    titleEn: 'Progressive Muscle Relaxation',
    description: 'Лягте удобно. Начиная с пальцев ног, напрягите мышцы на 5 секунд, затем расслабьте. Продвигайтесь вверх по телу до головы.',
    descriptionEn: 'Lie down comfortably. Starting with your toes, tense your muscles for 5 seconds, then relax. Work your way up your body to your head.',
    category: 'Релаксация',
    categoryEn: 'Relaxation',
    order: 5,
  },
  {
    title: 'Визуализация успеха',
    titleEn: 'Success Visualization',
    description: 'Закройте глаза и представьте себя достигающим важной для вас цели. Почувствуйте эмоции успеха, увидьте детали этого момента.',
    descriptionEn: 'Close your eyes and imagine yourself achieving an important goal. Feel the emotions of success, see the details of this moment.',
    category: 'Визуализация',
    categoryEn: 'Visualization',
    order: 6,
  },
  {
    title: 'Практика самосострадания',
    titleEn: 'Self-Compassion Practice',
    description: 'Подумайте о своих недостатках с пониманием, как если бы вы говорили с хорошим другом. Скажите себе: "Все люди несовершенны, и это нормально".',
    descriptionEn: 'Think about your flaws with understanding, as if you were talking to a good friend. Tell yourself: "All people are imperfect, and that\'s okay".',
    category: 'Самосострадание',
    categoryEn: 'Self-Compassion',
    order: 7,
  },
  {
    title: 'Анализ эмоций',
    titleEn: 'Emotion Analysis',
    description: 'Определите, какие эмоции вы испытываете прямо сейчас. Назовите их и опишите, где в теле вы их чувствуете.',
    descriptionEn: 'Identify what emotions you are experiencing right now. Name them and describe where in your body you feel them.',
    category: 'Эмоции',
    categoryEn: 'Emotions',
    order: 8,
  },
  {
    title: 'Техника заземления 5-4-3-2-1',
    titleEn: '5-4-3-2-1 Grounding Technique',
    description: 'Назовите 5 вещей, которые видите, 4 - которые слышите, 3 - которые можете потрогать, 2 - которые чувствуете запах, 1 - которую можете попробовать.',
    descriptionEn: 'Name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, and 1 you can taste.',
    category: 'Заземление',
    categoryEn: 'Grounding',
    order: 9,
  },
  {
    title: 'Письмо будущему себе',
    titleEn: 'Letter to Future Self',
    description: 'Напишите короткое письмо себе через год. Поделитесь своими надеждами, целями и пожеланиями.',
    descriptionEn: 'Write a short letter to yourself one year from now. Share your hopes, goals, and wishes.',
    category: 'Рефлексия',
    categoryEn: 'Reflection',
    order: 10,
  },
  {
    title: 'Практика прощения',
    titleEn: 'Forgiveness Practice',
    description: 'Подумайте о ситуации, которая вас расстроила. Попробуйте понять мотивы другого человека и отпустить обиду.',
    descriptionEn: 'Think about a situation that upset you. Try to understand the other person\'s motives and let go of the resentment.',
    category: 'Прощение',
    categoryEn: 'Forgiveness',
    order: 11,
  },
  {
    title: 'Цели на день',
    titleEn: 'Daily Goals',
    description: 'Поставьте себе 3 небольшие, достижимые цели на сегодня. Запишите их и отмечайте выполнение.',
    descriptionEn: 'Set 3 small, achievable goals for today. Write them down and mark their completion.',
    category: 'Планирование',
    categoryEn: 'Planning',
    order: 12,
  },
  {
    title: 'Рефлексия дня',
    titleEn: 'Daily Reflection',
    description: 'Подумайте о прошедшем дне: что прошло хорошо, что можно улучшить, какие уроки вы извлекли.',
    descriptionEn: 'Think about the past day: what went well, what could be improved, what lessons you learned.',
    category: 'Рефлексия',
    categoryEn: 'Reflection',
    order: 13,
  },
  {
    title: 'Упражнение на эмпатию',
    titleEn: 'Empathy Exercise',
    description: 'Вспомните недавнее взаимодействие с другим человеком. Попробуйте понять, что он мог чувствовать в тот момент.',
    descriptionEn: 'Recall a recent interaction with another person. Try to understand what they might have been feeling at that moment.',
    category: 'Эмпатия',
    categoryEn: 'Empathy',
    order: 14,
  },
  {
    title: 'Техника "Стоп-мысль"',
    titleEn: 'Stop-Thought Technique',
    description: 'Когда заметите негативную мысль, мысленно скажите "Стоп!" и переключитесь на что-то позитивное или нейтральное.',
    descriptionEn: 'When you notice a negative thought, mentally say "Stop!" and switch to something positive or neutral.',
    category: 'Контроль мыслей',
    categoryEn: 'Thought Control',
    order: 15,
  },
];

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@psychology-bot.com' },
    update: {},
    create: {
      name: 'Администратор',
      email: process.env.ADMIN_EMAIL || 'admin@psychology-bot.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('👤 Создан администратор:', admin.email);

  for (const exerciseData of EXERCISES_DATA) {
    const existingExercise = await prisma.exercise.findFirst({
      where: { order: exerciseData.order },
    });

    if (existingExercise) {
      await prisma.exercise.update({
        where: { id: existingExercise.id },
        data: exerciseData,
      });
    } else {
      await prisma.exercise.create({
        data: exerciseData,
      });
    }
  }

  console.log(`🧘 Создано ${EXERCISES_DATA.length} упражнений`);

  const exercisesCount = await prisma.exercise.count();
  const usersCount = await prisma.user.count();

  console.log('✅ База данных заполнена успешно!');
  console.log(`📊 Статистика:`);
  console.log(`   - Пользователей: ${usersCount}`);
  console.log(`   - Упражнений: ${exercisesCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });