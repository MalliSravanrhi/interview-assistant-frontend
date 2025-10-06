import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const interviewAPI = {
  healthCheck: async () => {
    const response = await api.get('/api/interview/health');
    return response.data;
  },

  extractResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/api/interview/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  generateQuestion: async (difficulty, questionNumber) => {
    const response = await api.post('/api/interview/question', {
      difficulty,
      questionNumber,
    });

    return response.data;
  },

  evaluateAnswer: async (question, answer, difficulty) => {
    const response = await api.post('/api/interview/evaluate', {
      question,
      answer,
      difficulty,
    });

    return response.data;
  },

  generateSummary: async (candidateData) => {
    const response = await api.post('/api/interview/summary', {
      candidateData,
    });

    return response.data;
  },
};

export default interviewAPI;