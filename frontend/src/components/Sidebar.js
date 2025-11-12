import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>메신저</h2>
      </div>
      <ul className="chat-list">
        <li className="chat-item active">AI 챗봇</li>
        <li className="chat-item">친구 1</li>
        <li className="chat-item">그룹채팅방</li>
      </ul>
    </div>
  );
};

export default Sidebar;