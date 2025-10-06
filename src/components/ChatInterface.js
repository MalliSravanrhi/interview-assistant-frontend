import React from 'react';
import { Card, Avatar } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import './ChatInterface.css';

const ChatInterface = ({ messages }) => {
  return (
    <div className="chat-interface">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.type}`}>
          <Avatar
            icon={msg.type === 'bot' ? <RobotOutlined /> : <UserOutlined />}
            className="message-avatar"
          />
          <Card className="message-bubble">
            <p>{msg.content}</p>
            {msg.timestamp && (
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};

export default ChatInterface;