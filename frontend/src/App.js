//App.js는 앱 안에서 페이지를 구성하고 라우팅을 결정하는 역할
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatRoom from './chatroom';
import Home from './Home';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chatroom" element={<ChatRoom />} />
        </Routes>
    );
}

export default App;