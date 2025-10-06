import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  candidates: [],
  currentCandidate: null,
  showWelcomeBack: false
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startNewInterview: (state, action) => {
      const { name, email, phone, resumeText } = action.payload;
      const newCandidate = {
        id: uuidv4(),
        name,
        email,
        phone,
        resumeText,
        status: 'in-progress',
        currentQuestionIndex: 0,
        questionsAndAnswers: [],
        totalScore: 0,
        summary: '',
        createdAt: new Date().toISOString()
      };
      state.currentCandidate = newCandidate;
      console.log('Started new interview:', newCandidate);
    },

    addQuestion: (state, action) => {
      if (state.currentCandidate) {
        state.currentCandidate.questionsAndAnswers.push(action.payload);
        console.log('Added question:', action.payload);
      }
    },

    updateAnswer: (state, action) => {
      const { questionIndex, answer, score, feedback } = action.payload;
      if (state.currentCandidate && state.currentCandidate.questionsAndAnswers[questionIndex]) {
        state.currentCandidate.questionsAndAnswers[questionIndex].answer = answer;
        state.currentCandidate.questionsAndAnswers[questionIndex].score = score;
        state.currentCandidate.questionsAndAnswers[questionIndex].feedback = feedback;
        state.currentCandidate.totalScore += score;
        console.log('Updated answer. Total score:', state.currentCandidate.totalScore);
      }
    },

    nextQuestion: (state) => {
      if (state.currentCandidate) {
        state.currentCandidate.currentQuestionIndex += 1;
        console.log('Next question index:', state.currentCandidate.currentQuestionIndex);
      }
    },

    completeInterview: (state, action) => {
      if (state.currentCandidate) {
        state.currentCandidate.status = 'completed';
        state.currentCandidate.summary = action.payload.summary;
        state.currentCandidate.completedAt = new Date().toISOString();

        console.log('Completing interview for:', state.currentCandidate.name);

        const existingIndex = state.candidates.findIndex(
          c => c.id === state.currentCandidate.id
        );

        if (existingIndex >= 0) {
          state.candidates[existingIndex] = state.currentCandidate;
          console.log('Updated existing candidate');
        } else {
          state.candidates.push(state.currentCandidate);
          console.log('Added new candidate. Total candidates:', state.candidates.length);
        }

        console.log('All candidates:', state.candidates);

        state.currentCandidate = null;
      }
    },

    resetInterview: (state) => {
      state.currentCandidate = null;
      console.log('Interview reset');
    },

    setShowWelcomeBack: (state, action) => {
      state.showWelcomeBack = action.payload;
    },

    updateCandidateInfo: (state, action) => {
      if (state.currentCandidate) {
        state.currentCandidate = {
          ...state.currentCandidate,
          ...action.payload
        };
      }
    },

    addTestCandidate: (state) => {
      const testCandidate = {
        id: 'test-' + Date.now(),
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1-555-0123',
        resumeText: 'Test resume',
        status: 'completed',
        currentQuestionIndex: 6,
        questionsAndAnswers: [
          {
            question: 'What is React?',
            answer: 'React is a JavaScript library.',
            difficulty: 'easy',
            score: 8,
            maxScore: 10,
            feedback: 'Good answer',
            timeLimit: 20
          },
          {
            question: 'Explain hooks',
            answer: 'Hooks are functions that let you use state.',
            difficulty: 'easy',
            score: 9,
            maxScore: 10,
            feedback: 'Excellent',
            timeLimit: 20
          },
          {
            question: 'What is Redux?',
            answer: 'Redux is a state management library.',
            difficulty: 'medium',
            score: 12,
            maxScore: 15,
            feedback: 'Good understanding',
            timeLimit: 60
          },
          {
            question: 'Explain middleware',
            answer: 'Middleware extends Redux functionality.',
            difficulty: 'medium',
            score: 13,
            maxScore: 15,
            feedback: 'Very good',
            timeLimit: 60
          },
          {
            question: 'Design scalable API',
            answer: 'Use microservices and caching.',
            difficulty: 'hard',
            score: 18,
            maxScore: 20,
            feedback: 'Excellent design',
            timeLimit: 120
          },
          {
            question: 'Implement JWT auth',
            answer: 'Use tokens with refresh mechanism.',
            difficulty: 'hard',
            score: 17,
            maxScore: 20,
            feedback: 'Strong security knowledge',
            timeLimit: 120
          }
        ],
        totalScore: 77,
        summary: 'Strong technical skills demonstrated across React and Node.js.',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      state.candidates.push(testCandidate);
      console.log('Test candidate added. Total:', state.candidates.length);
    }
  }
});

export const {
  startNewInterview,
  addQuestion,
  updateAnswer,
  nextQuestion,
  completeInterview,
  resetInterview,
  setShowWelcomeBack,
  updateCandidateInfo,
  addTestCandidate
} = interviewSlice.actions;

export default interviewSlice.reducer;