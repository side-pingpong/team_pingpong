//App.js는 앱 안에서 페이지를 구성하고 라우팅을 결정하는 역할
import React from 'react';
import {Route, Routes} from 'react-router-dom';
import ChatRoom from './chatroom';
import Home from './Home';
import ChatListScreen from "./pages/chatList/ChatListScreen";
import Login from './pages/auth/Login';
import Register from "./pages/auth/Register";
import FindId from "./pages/auth/FindId";
import FindPassword from "./pages/auth/FindPassword";
import ResetPassword from "./pages/auth/ResetPassword";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/chatroom" element={<ChatRoom/>}/>
            <Route path="/chatListScreen" element={<ChatListScreen/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/findId" element={<FindId/>}/>
            <Route path="/findPassword" element={<FindPassword/>}/>
            <Route path="/resetPassword" element={<ResetPassword/>}/>
        </Routes>
    );
}