# AI-Powered Interview Assistant (Crisp)

A full-stack React application that conducts AI-powered technical interviews for Full Stack Developer positions.

## 🎯 Features

- **Resume Upload & Parsing**: Supports PDF and DOCX formats
- **Intelligent Data Extraction**: Automatically extracts Name, Email, and Phone
- **Dynamic Question Generation**: AI generates questions based on difficulty level
- **Timed Assessments**: 
  - Easy: 20 seconds
  - Medium: 60 seconds
  - Hard: 120 seconds
- **Real-time Evaluation**: AI scores and provides feedback on answers
- **Dual Interface**:
  - **Interviewee Tab**: Interactive chat-based interview flow
  - **Interviewer Dashboard**: View all candidates, scores, and detailed reports
- **Persistent State**: Redux Persist ensures data survives page refreshes
- **Welcome Back Modal**: Resume unfinished interviews seamlessly

## 🛠️ Tech Stack

### Frontend
- React 18
- Redux Toolkit + Redux Persist
- Ant Design (UI Components)
- Axios (API calls)

### Backend
- Node.js + Express
- OpenAI API (GPT-3.5-turbo)
- Multer (File uploads)
- pdf-parse & mammoth (Document parsing)

## 📁 Project Structure

```
interview-assistant/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── IntervieweeTab.js
│   │   │   ├── IntervieweeTab.css
│   │   │   ├── InterviewerTab.js
│   │   │   ├── InterviewerTab.css
│   │   │   ├── ChatInterface.js
│   │   │   └── ChatInterface.css
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── interviewSlice.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   └── package.json
└── backend/
    ├── src/
    │   ├── controllers/
    │   │   └── interviewController.js
    │   ├── routes/
    │   │   └── interviewRoutes.js
    │   ├── services/
    │   │   ├── fileService.js
    │   │   └── aiService.js
    │   └── server.js
    ├── .env
    └── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

Application will open at `http://localhost:3000`

## 📝 Usage Guide

### For Candidates (Interviewee Tab)

1. **Upload Resume**: Click "Upload Resume" and select your PDF/DOCX file
2. **Complete Profile**: If any information is missing, provide it in the form
3. **Answer Questions**: You'll receive 6 questions (2 Easy, 2 Medium, 2 Hard)
4. **Watch the Timer**: Each question has a specific time limit
5. **Submit Answers**: Click "Submit Answer" or wait for auto-submission
6. **View Results**: See your final score and AI-generated summary

### For Interviewers (Dashboard Tab)

1. **View All Candidates**: See a ranked list of all completed interviews
2. **Search & Filter**: Find candidates by name or email
3. **Sort Results**: Sort by score, date, or name
4. **View Details**: Click on any candidate to see:
   - Complete profile
   - All questions and answers
   - Individual scores and feedback
   - AI-generated performance summary

## 🎨 Key Components

### Interview Flow
1. Resume upload and parsing
2. Missing field collection
3. 6 timed questions (progressive difficulty)
4. AI evaluation after each answer
5. Final score calculation and summary generation

### Scoring System
- Easy Questions: 10 points each
- Medium Questions: 15 points each
- Hard Questions: 20 points each
- **Total**: 90 points maximum

## 🔧 API Endpoints

### POST `/api/interview/extract-resume`
Extracts name, email, and phone from uploaded resume

### POST `/api/interview/generate-question`
Generates a new interview question based on difficulty

### POST `/api/interview/evaluate-answer`
Evaluates candidate's answer and returns score + feedback

### POST `/api/interview/generate-summary`
Creates final performance summary for candidate

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Render/Railway/Heroku)
```bash
cd backend
# Follow your platform's deployment guide
```

## 📊 Features Breakdown

✅ Resume upload (PDF/DOCX)  
✅ Automatic field extraction  
✅ Missing field collection  
✅ Dynamic question generation  
✅ Difficulty progression (Easy → Medium → Hard)  
✅ Individual timers per question  
✅ Auto-submit on timeout  
✅ Real-time AI evaluation  
✅ Candidate dashboard with search/sort  
✅ Detailed candidate profiles  
✅ Redux Persist for state management  
✅ Welcome Back modal for resumed sessions  
✅ Responsive design  
✅ Error handling  

## 🔐 Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: development/production

### Frontend
- `REACT_APP_API_URL`: Backend API URL

## 🤝 Contributing

This project is part of Swipe's internship assignment.

## 📄 License

MIT License

## 👨‍💻 Author

Built for Swipe Internship Assignment

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Note**: Make sure to never commit your `.env` files or expose your OpenAI API key!