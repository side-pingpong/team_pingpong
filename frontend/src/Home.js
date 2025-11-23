// src/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Bot, Users, Settings, ArrowRight } from 'lucide-react';

export default function Home() {
    const navigationCards = [
        {
            title: '채팅방',
            description: '실시간 채팅을 시작하세요',
            icon: MessageSquare,
            path: '/chatroom',
            color: 'blue'
        },
        {
            title: 'AI 어시스턴트',
            description: 'AI와 대화하며 도움을 받으세요',
            icon: Bot,
            path: '/ai-chat',
            color: 'purple'
        },
        {
            title: '채팅 목록',
            description: '모든 대화를 한눈에 확인하세요',
            icon: Users,
            path: '/chatListScreen',
            color: 'green'
        },
        {
            title: '로그인',
            description: '계정에 로그인하세요',
            icon: Settings,
            path: '/login',
            color: 'gray'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
            purple: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
            green: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
            gray: 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <MessageSquare className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">PingPong</h1>
                                <p className="text-xs text-gray-400">실시간 메신저 플랫폼</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm text-gray-300">온라인</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-6xl w-full">
                    {/* Welcome Section */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            환영합니다! 👋
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            PingPong에서 친구들과 실시간으로 소통하고, AI 어시스턴트의 도움을 받아보세요.
                        </p>
                    </div>

                    {/* Navigation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {navigationCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={index}
                                    to={card.path}
                                    className="group relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                                >
                                    <div className="p-6">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getColorClasses(card.color)} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="text-white" size={28} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-4">
                                            {card.description}
                                        </p>
                                        <div className="flex items-center text-blue-400 text-sm font-semibold">
                                            <span className="group-hover:mr-2 transition-all">시작하기</span>
                                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Features Section */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                            <div className="text-3xl mb-3">⚡</div>
                            <h4 className="text-lg font-semibold text-white mb-2">실시간 채팅</h4>
                            <p className="text-sm text-gray-400">빠르고 안정적인 실시간 메시징</p>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                            <div className="text-3xl mb-3">🤖</div>
                            <h4 className="text-lg font-semibold text-white mb-2">AI 지원</h4>
                            <p className="text-sm text-gray-400">Spring AI 기반 스마트 어시스턴트</p>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                            <div className="text-3xl mb-3">🔒</div>
                            <h4 className="text-lg font-semibold text-white mb-2">안전한 통신</h4>
                            <p className="text-sm text-gray-400">보안이 강화된 메시징 환경</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 py-6">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm text-gray-400">
                        © 2025 PingPong Team. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}