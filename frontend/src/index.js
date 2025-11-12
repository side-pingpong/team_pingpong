// src/index.js
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>  {/* 라우터를 앱 전체에 적용 */}
        <App />         {/* 실제 앱 내용 */}
    </BrowserRouter>
);