import React from 'react';
import { MessageSquare, Settings, User, Folder } from 'lucide-react';

// 사이드바 항목 정의 (데이터 구조)
const sidebarItems = [
    { key: 'friends', label: '친구 목록', icon: User },
    { key: 'chat', label: '채팅 목록', icon: MessageSquare },
    { key: 'file', label: '파일함', icon: Folder },
];

export default function Sidebar({ activeSidebar, setActiveSidebar }) {
    // 내부 스타일 정의 (외부 유출 방지 및 응집력 유지)
    const sidebarButtonClass = (key) =>
        `flex flex-col items-center justify-center w-full h-16 rounded-lg transition-all duration-200 p-2 cursor-pointer ${
            activeSidebar === key
                ? 'text-blue-400 bg-gray-700'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`;

    return (
        <div className="w-20 bg-gray-800 flex flex-col items-center py-4 border-r border-gray-700">
            {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.key}
                        onClick={() => setActiveSidebar(item.key)}
                        className={sidebarButtonClass(item.key)}
                        title={item.label}
                    >
                        <Icon size={24} /><span className="text-xs mt-1">{item.label}</span>
                    </button>
                );
            })}

            <div className="flex-grow"></div>

            {/* 설정 버튼 (항상 하단) */}
            <button onClick={() => setActiveSidebar('settings')} className={sidebarButtonClass('settings')} title="환경 설정">
                <Settings size={24} /><span className="text-xs mt-1">설정</span>
            </button>
        </div>
    );
}