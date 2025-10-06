import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Input, Select, Card, Modal, Tag, Empty, Space, Button } from 'antd';
import { SearchOutlined, TrophyOutlined, PlusOutlined } from '@ant-design/icons';
import { addTestCandidate } from '../redux/interviewSlice';
import { store } from '../redux/store';
import './InterviewerTab.css';

const { Search } = Input;
const { Option } = Select;

const InterviewerTab = () => {
  const dispatch = useDispatch();
  const { candidates } = useSelector((state) => state.interview);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  console.log('🔍 InterviewerTab Render');
  console.log('📊 All candidates:', candidates);
  console.log('📊 Candidates count:', candidates?.length || 0);

  if (candidates && candidates.length > 0) {
    console.log('📊 Candidate details:', candidates.map(c => ({
      name: c.name,
      email: c.email,
      status: c.status,
      score: c.totalScore,
      completedAt: c.completedAt
    })));
  }

  const completedCandidates = candidates?.filter(c => c.status === 'completed') || [];
  console.log('✅ Completed candidates:', completedCandidates.length);

  React.useEffect(() => {
    console.log('🔄 Candidates array updated! New count:', candidates?.length);
    if (candidates && candidates.length > 0) {
      console.log('🎉 We have candidates! Latest:', candidates[candidates.length - 1]?.name);
    }
  }, [candidates]);

  const handleAddTestCandidate = () => {
    console.log('🔵 Button clicked - Adding test candidate...');
    console.log('Before dispatch - candidates:', candidates);

    try {
      dispatch(addTestCandidate());
      console.log('✅ Dispatch successful');

      setTimeout(() => {
        console.log('After dispatch - checking candidates...');
        const state = store.getState();
        console.log('Current Redux state:', state);
      }, 100);
    } catch (error) {
      console.error('❌ Error dispatching:', error);
    }
  };

  const getFilteredCandidates = () => {
    console.log('Filtering candidates. Total candidates:', candidates?.length);

    if (!candidates || candidates.length === 0) {
      console.log('No candidates found in Redux state');
      return [];
    }

    let filtered = candidates.filter(c => c.status === 'completed');
    console.log('Completed candidates:', filtered.length);

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
      );
      console.log('After search filter:', filtered.length);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return b.totalScore - a.totalScore;
      } else if (sortBy === 'date') {
        return new Date(b.completedAt) - new Date(a.completedAt);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    console.log('Final filtered and sorted candidates:', filtered.length);
    return filtered;
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 80,
      render: (text, record, index) => {
        if (index === 0) return <TrophyOutlined style={{ fontSize: 24, color: '#FFD700' }} />;
        if (index === 1) return <TrophyOutlined style={{ fontSize: 24, color: '#C0C0C0' }} />;
        if (index === 2) return <TrophyOutlined style={{ fontSize: 24, color: '#CD7F32' }} />;
        return index + 1;
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Score',
      dataIndex: 'totalScore',
      key: 'score',
      render: (score) => (
        <Tag color={score >= 70 ? 'green' : score >= 50 ? 'orange' : 'red'}>
          {score} / 90
        </Tag>
      ),
      sorter: (a, b) => a.totalScore - b.totalScore,
    },
    {
      title: 'Completed',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.completedAt) - new Date(b.completedAt),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <a onClick={() => handleViewDetails(record)}>View Details</a>
      ),
    },
  ];

  const filteredCandidates = getFilteredCandidates();

  return (
    <div className="interviewer-container">
      <Card title="Candidate Dashboard" className="dashboard-card">
        <div className="controls-section">
          <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Search
              placeholder="Search by name or email"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              style={{ width: 400 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Space>
              <Select
                size="large"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 200 }}
              >
                <Option value="score">Sort by Score</Option>
                <Option value="date">Sort by Date</Option>
                <Option value="name">Sort by Name</Option>
              </Select>
            </Space>
          </Space>
        </div>

        <div className="stats-section">
          <Card className="stat-card">
            <h3>{filteredCandidates.length}</h3>
            <p>Total Candidates</p>
          </Card>
          <Card className="stat-card">
            <h3>
              {filteredCandidates.length > 0
                ? Math.round(
                  filteredCandidates.reduce((sum, c) => sum + c.totalScore, 0) /
                  filteredCandidates.length
                )
                : 0}
            </h3>
            <p>Average Score</p>
          </Card>
          <Card className="stat-card">
            <h3>
              {filteredCandidates.filter(c => c.totalScore >= 70).length}
            </h3>
            <p>High Performers</p>
          </Card>
        </div>

        {filteredCandidates.length === 0 ? (
          <Empty
            description="No completed interviews yet"
            style={{ margin: '40px 0' }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredCandidates}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="candidates-table"
          />
        )}
      </Card>

      <Modal
        title={`Interview Details - ${selectedCandidate?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        className="candidate-modal"
      >
        {selectedCandidate && (
          <div className="modal-content">
            <Card className="info-section">
              <h3>Candidate Information</h3>
              <p><strong>Name:</strong> {selectedCandidate.name}</p>
              <p><strong>Email:</strong> {selectedCandidate.email}</p>
              <p><strong>Phone:</strong> {selectedCandidate.phone}</p>
              <p><strong>Total Score:</strong> <Tag color={selectedCandidate.totalScore >= 70 ? 'green' : selectedCandidate.totalScore >= 50 ? 'orange' : 'red'}>{selectedCandidate.totalScore} / 90</Tag></p>
            </Card>

            <Card className="summary-section">
              <h3>AI Summary</h3>
              <p>{selectedCandidate.summary}</p>
            </Card>

            <Card className="qa-section">
              <h3>Questions & Answers</h3>
              {selectedCandidate.questionsAndAnswers.map((qa, index) => (
                <div key={index} className="qa-item">
                  <div className="qa-header">
                    <span className="question-number">Q{index + 1}</span>
                    <Tag color={qa.difficulty === 'easy' ? 'green' : qa.difficulty === 'medium' ? 'orange' : 'red'}>
                      {qa.difficulty.toUpperCase()}
                    </Tag>
                    <Tag color="blue">{qa.score} / {qa.maxScore}</Tag>
                  </div>
                  <div className="qa-content">
                    <p><strong>Question:</strong> {qa.question}</p>
                    <p><strong>Answer:</strong> {qa.answer}</p>
                    <p><strong>Feedback:</strong> {qa.feedback}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterviewerTab;