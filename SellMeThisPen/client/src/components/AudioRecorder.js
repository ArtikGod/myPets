import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      alert('Не удалось получить доступ к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setTranscription('');
    setTranslation('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post('http://localhost:3001/api/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTranscription(response.data.transcription);
      setTranslation(response.data.translation);
    } catch (error) {
      console.error('Ошибка обработки аудио:', error);
      alert('Ошибка при обработке аудио');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setTranscription('');
    setTranslation('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Переводчик речи</h1>
      <p>Нажмите "Записать аудио", говорите в микрофон, затем остановите запись для получения перевода на испанский язык.</p>
      
      <div style={{ marginBottom: '20px' }}>
        {!isRecording && !audioBlob && (
          <button 
            onClick={startRecording}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '15px 30px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🎤 Записать аудио
          </button>
        )}
        
        {isRecording && (
          <button 
            onClick={stopRecording}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '15px 30px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ⏹️ Остановить запись
          </button>
        )}
        
        {audioBlob && !isProcessing && (
          <div>
            <button 
              onClick={processAudio}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '15px 30px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              🔄 Обработать аудио
            </button>
            <button 
              onClick={resetRecording}
              style={{
                backgroundColor: '#9E9E9E',
                color: 'white',
                padding: '15px 30px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🗑️ Сбросить
            </button>
          </div>
        )}
        
        {isProcessing && (
          <div style={{ textAlign: 'center' }}>
            <p>⏳ Обработка аудио...</p>
          </div>
        )}
      </div>
      
      {transcription && (
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '15px' 
        }}>
          <h3>Распознанный текст:</h3>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>{transcription}</p>
        </div>
      )}
      
      {translation && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '5px' 
        }}>
          <h3>Перевод на испанский:</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '10px 0', color: '#2e7d32' }}>
            {translation}
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;