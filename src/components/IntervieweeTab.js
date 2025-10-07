import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, Button, Input, Card, Progress, message, Space, Typography } from 'antd';
import { UploadOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import interviewAPI from '../services/api';
import {
  startNewInterview,
  addQuestion,
  updateAnswer,
  nextQuestion,
  completeInterview as completeInterviewAction,
  resetInterview
} from '../redux/interviewSlice';

const { Text } = Typography;

const IntervieweeTab = () => {
  const dispatch = useDispatch();
  const { currentCandidate } = useSelector((state) => state.interview);

  const [messages, setMessages] = useState([
    { text: 'Welcome! Please upload your resume (PDF or DOCX) to begin.', sender: 'bot', timestamp: Date.now() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const QUESTIONS_CONFIG = [
    { difficulty: 'easy', time: 20, maxScore: 10 },
    { difficulty: 'easy', time: 20, maxScore: 10 },
    { difficulty: 'medium', time: 60, maxScore: 15 },
    { difficulty: 'medium', time: 60, maxScore: 15 },
    { difficulty: 'hard', time: 120, maxScore: 20 },
    { difficulty: 'hard', time: 120, maxScore: 20 }
  ];

  useEffect(() => {
    if (isInterviewActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isInterviewActive && timeLeft === 0 && currentQuestion) {
      handleTimeUp();
    }
  }, [timeLeft, isInterviewActive]);

  const addMessage = (text, sender = 'bot') => {
    setMessages(prev => [...prev, { text, sender, timestamp: Date.now() }]);
  };

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const response = await fetch('https://interview-assistant-backend-k119.onrender.com');
      const data = await response.json();
      console.log('Backend connected:', data);
    } catch (error) {
      console.error('Backend connection failed:', error.message);
      message.error('Cannot connect to backend. Make sure server is running on port 5000.');
    }
  };

  const handleFileUpload = async (file) => {
    console.log('Uploading file:', file.name);

    setUploadedFile(file);
    addMessage('Uploading resume...', 'bot');
    setIsProcessing(true);

    try {
      const result = await interviewAPI.extractResume(file);
      console.log('Extraction result:', result);

      if (result.success) {
        setExtractedData({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          resumeText: result.resumeText || ''
        });

        const missing = [];
        if (!result.data.name) missing.push('name');
        if (!result.data.email) missing.push('email');
        if (!result.data.phone) missing.push('phone');

        setMissingFields(missing);

        if (missing.length > 0) {
          addMessage(
            `I found: ${result.data.name || '(no name)'}, ${result.data.email || '(no email)'}, ${result.data.phone || '(no phone)'}. Please provide your ${missing[0]}.`,
            'bot'
          );
        } else {
          addMessage(
            `Great! I have all your details:\nName: ${result.data.name}\nEmail: ${result.data.email}\nPhone: ${result.data.phone}\n\nType "start" to begin the interview!`,
            'bot'
          );
        }
        message.success('Resume uploaded successfully!');
      } else {
        throw new Error(result.error || 'Failed to extract data');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to process resume';
      addMessage(`Error: ${errorMsg}. Please try again with a different file.`, 'bot');
      message.error(errorMsg);
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }

    return false;
  };

  const handleUserMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const input = userInput.trim();
    addMessage(input, 'user');
    setUserInput('');

    if (missingFields.length > 0) {
      const field = missingFields[0];
      setExtractedData(prev => ({ ...prev, [field]: input }));
      setMissingFields(prev => prev.slice(1));

      if (missingFields.length === 1) {
        addMessage('Perfect! All information collected. Type "start" to begin the interview.', 'bot');
      } else {
        addMessage(`Thanks! Now please provide your ${missingFields[1]}.`, 'bot');
      }
      return;
    }

    if (input.toLowerCase() === 'start' && !isInterviewActive) {
      console.log('Starting interview with data:', extractedData);
      dispatch(startNewInterview({
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        resumeText: extractedData.resumeText || ''
      }));

      startInterview();
      return;
    }

    if (isInterviewActive && currentQuestion) {
      await submitAnswer(input);
    }
  };

  const startInterview = async () => {
    setIsInterviewActive(true);
    setQuestionIndex(0);
    addMessage('Starting interview! Preparing your first question...', 'bot');
    await loadQuestion(0);
  };

  const loadQuestion = async (index) => {
    setIsProcessing(true);

    try {
      const config = QUESTIONS_CONFIG[index];

      const previousQuestions = currentCandidate?.questionsAndAnswers?.map(qa => qa.question) || [];

      const result = await interviewAPI.generateQuestion(
        config.difficulty,
        index + 1,
        previousQuestions,
        extractedData?.resumeText || ''
      );

      if (result.success) {
        const questionData = {
          question: result.question,
          answer: '',
          difficulty: config.difficulty,
          score: 0,
          maxScore: config.maxScore,
          feedback: '',
          timeLimit: config.time
        };

        dispatch(addQuestion(questionData));

        setCurrentQuestion({
          question: result.question,
          difficulty: config.difficulty,
          index
        });
        setTimeLeft(config.time);

        addMessage(`Question ${index + 1} of 6 [${config.difficulty.toUpperCase()}]:`, 'bot');
        addMessage(result.question, 'bot');
        addMessage(`You have ${config.time} seconds to answer.`, 'bot');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      addMessage('Error loading question. Please try again.', 'bot');
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAnswer = async (answer) => {
    setIsProcessing(true);

    try {
      const answerToSubmit = answer || "(No answer provided - time expired)";

      const result = await interviewAPI.evaluateAnswer(
        currentQuestion.question,
        answerToSubmit,
        currentQuestion.difficulty
      );

      const score = result.evaluation?.score || 0;
      const feedback = result.evaluation?.feedback || 'No feedback';

      dispatch(updateAnswer({
        questionIndex: currentQuestion.index,
        answer: answerToSubmit,
        score: score,
        feedback: feedback
      }));

      addMessage(`Answer submitted! Score: ${score}/${QUESTIONS_CONFIG[currentQuestion.index].maxScore}`, 'bot');
      addMessage(`Feedback: ${feedback}`, 'bot');

      dispatch(nextQuestion());

      if (currentQuestion.index < 5) {
        setQuestionIndex(currentQuestion.index + 1);
        setTimeout(() => {
          loadQuestion(currentQuestion.index + 1);
        }, 2000);
      } else {
        await completeInterview();
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      addMessage('Error evaluating answer. Moving to next question...', 'bot');

      if (currentQuestion.index < 5) {
        setQuestionIndex(currentQuestion.index + 1);
        setTimeout(() => loadQuestion(currentQuestion.index + 1), 2000);
      } else {
        await completeInterview();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTimeUp = async () => {
    addMessage("Time's up! Submitting your answer...", 'bot');
    await submitAnswer('');
  };

  const completeInterview = async () => {
    setIsInterviewActive(false);

    try {
      console.log('Completing interview for:', currentCandidate);

      const result = await interviewAPI.generateSummary(
        currentCandidate.name,
        currentCandidate.questionsAndAnswers,
        currentCandidate.totalScore
      );

      dispatch(completeInterviewAction({
        summary: result.summary || 'Interview completed successfully.'
      }));

      const percentage = Math.round((currentCandidate.totalScore / 90) * 100);

      addMessage('Interview completed!', 'bot');
      addMessage(`Your Score: ${currentCandidate.totalScore}/90 (${percentage}%)`, 'bot');
      addMessage(`Summary: ${result.summary}`, 'bot');
      addMessage('Thank you! Check the Interviewer Dashboard to view your details.', 'bot');

      message.success('Interview completed and saved to dashboard!');

    } catch (error) {
      console.error('Error completing interview:', error);

      dispatch(completeInterviewAction({
        summary: 'Interview completed successfully.'
      }));

      addMessage('Interview completed!', 'bot');
      message.success('Interview saved to dashboard!');
    }
  };

  const handleReset = () => {
    dispatch(resetInterview());
    setMessages([{ text: 'Welcome! Please upload your resume (PDF or DOCX) to begin.', sender: 'bot', timestamp: Date.now() }]);
    setUserInput('');
    setUploadedFile(null);
    setExtractedData(null);
    setMissingFields([]);
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setTimeLeft(0);
    setIsInterviewActive(false);
    setIsProcessing(false);
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {!uploadedFile && (
          <Upload
            beforeUpload={handleFileUpload}
            accept=".pdf,.docx"
            maxCount={1}
            showUploadList={false}
          >
            <Button
              icon={<UploadOutlined />}
              size="large"
              type="primary"
              block
              loading={isProcessing}
            >
              Upload Resume (PDF/DOCX)
            </Button>
          </Upload>
        )}

        {isInterviewActive && (
          <Card size="small" style={{ backgroundColor: '#f0f5ff' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Question {questionIndex + 1} of 6</Text>
                <Text type="danger">
                  <ClockCircleOutlined /> {timeLeft}s
                </Text>
              </div>
              <Progress
                percent={((questionIndex + 1) / 6) * 100}
                showInfo={false}
                status={timeLeft < 10 ? 'exception' : 'active'}
              />
            </Space>
          </Card>
        )}

        <Card
          style={{
            height: '400px',
            overflowY: 'auto',
            backgroundColor: '#fafafa'
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: msg.sender === 'user' ? '#1890ff' : '#fff',
                  color: msg.sender === 'user' ? '#fff' : '#000',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </Card>

        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onPressEnter={handleUserMessage}
            placeholder={
              !uploadedFile
                ? 'Upload resume first...'
                : isInterviewActive
                  ? 'Type your answer...'
                  : 'Type your response...'
            }
            disabled={!uploadedFile || isProcessing}
            size="large"
          />
          <Button
            type="primary"
            onClick={handleUserMessage}
            disabled={!uploadedFile || isProcessing}
            icon={<SendOutlined />}
            size="large"
            loading={isProcessing}
          >
            Send
          </Button>
        </Space.Compact>

        {!isInterviewActive && uploadedFile && currentCandidate === null && (

          <Button
            onClick={handleReset}
            type="primary"
            size="large"
            style={{ width: 200, display: 'block', margin: '0 auto' }}
          >
            Start New Interview
          </Button>


        )}
      </Space>
    </Card>
  );
};

export default IntervieweeTab;