//App.js는 앱 안에서 페이지를 구성하고 라우팅을 결정하는 역할
import React from 'react';
import {Route, Routes} from 'react-router-dom';
import ChatRoom from './chatroom';
import Home from './Home';
import ChatListScreen from "./chatList/chatListScreen";
import LoginPage from './pages/login/LoginPage';
import RegisterPage from "./pages/register/RegisterPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/chatroom" element={<ChatRoom/>}/>
            <Route path="/chatListScreen" element={<ChatListScreen/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
        </Routes>
    );
}

export default App;