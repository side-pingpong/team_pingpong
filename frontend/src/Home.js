// src/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import FileBox from "./pages/FileBox";

export default function Home() {
    return (
        <div>
            <h1>홈 페이지</h1>
            <Link to="/chatroom">채팅방으로 이동</Link>
            <br/><Link to="/chatListScreen">채팅리스트로 이동</Link>
            <br/><Link to="/FileBox">파일함으로 이동</Link>
        </div>
    );
}