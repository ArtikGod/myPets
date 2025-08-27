const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Настройка multer для обработки файлов
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Маршрут для обработки аудио
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Аудио файл не найден' });
    }

    console.log('Получен аудио файл:', req.file.originalname, 'размер:', req.file.size);

    // Шаг 1: Преобразование речи в текст с помощью OpenAI Whisper
    const transcription = await transcribeAudio(req.file.buffer);
    console.log('Транскрипция:', transcription);

    // Шаг 2: Перевод текста на испанский
    const translation = await translateText(transcription);
    console.log('Перевод:', translation);

    res.json({
      transcription,
      translation
    });
  } catch (error) {
    console.error('Ошибка обработки аудио:', error);
    res.status(500).json({ error: 'Ошибка обработки аудио: ' + error.message });
  }
});

// Функция для транскрипции аудио через OpenAI Whisper
async function transcribeAudio(audioBuffer) {
  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      }
    });

    return response.data.text;
  } catch (error) {
    console.error('Ошибка транскрипции:', error.response?.data || error.message);
    throw new Error('Ошибка при транскрипции аудио');
  }
}

// Функция для перевода текста на испанский
async function translateText(text) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты переводчик. Переведи следующий текст на испанский язык. Верни только перевод без дополнительных объяснений.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Ошибка перевода:', error.response?.data || error.message);
    throw new Error('Ошибка при переводе текста');
  }
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});