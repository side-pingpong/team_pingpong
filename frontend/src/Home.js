// src/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div>
            <h1>홈 페이지</h1>
            <Link to="/chatroom">채팅방으로 이동</Link>
        </div>
    );
}