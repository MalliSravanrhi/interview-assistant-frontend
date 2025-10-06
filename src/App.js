import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, Modal } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerTab from './components/InterviewerTab';
import { setShowWelcomeBack } from './redux/interviewSlice';
import './App.css';

const { TabPane } = Tabs;

function App() {
  const dispatch = useDispatch();
  const { currentCandidate, showWelcomeBack } = useSelector((state) => state.interview);

  useEffect(() => {
    if (currentCandidate && 
        currentCandidate.status === 'in-progress' && 
        currentCandidate.currentQuestionIndex < 6) {
      dispatch(setShowWelcomeBack(true));
    }
  }, []);

  const handleWelcomeBackOk = () => {
    dispatch(setShowWelcomeBack(false));
  };

  return (
    <div className="App">
      <Modal
        title="Welcome Back!"
        open={showWelcomeBack}
        onOk={handleWelcomeBackOk}
        onCancel={handleWelcomeBackOk}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p>You have an unfinished interview session. Would you like to continue?</p>
        <p><strong>Candidate:</strong> {currentCandidate?.name || 'Unknown'}</p>
        <p><strong>Progress:</strong> Question {currentCandidate?.currentQuestionIndex || 0} of 6</p>
      </Modal>

      <div className="app-header">
        <h1>AI-Powered Interview Assistant</h1>
      </div>

      <Tabs defaultActiveKey="1" centered className="main-tabs">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Interviewee
            </span>
          } 
          key="1"
        >
          <IntervieweeTab />
        </TabPane>
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Interviewer Dashboard
            </span>
          } 
          key="2"
        >
          <InterviewerTab />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default App;