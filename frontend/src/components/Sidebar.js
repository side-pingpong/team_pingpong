import React from 'react';
import { MessageSquare, Settings, User, Folder } from 'lucide-react';

// 사이드바 항목 정의 (경로(path) 정보 포함)
const sidebarItems = [
    { key: 'friends', label: '친구 목록', icon: User, path: '/friends' },
    { key: 'chat', label: '채팅 목록', icon: MessageSquare, path: '/ChatListScreen' },
    { key: 'fileBox', label: '파일함', icon: Folder, path: '/fileBox' },
];

// 🚨 [수정] activeSidebar 대신 activePath와 onNavigate를 props로 받습니다.
export default function Sidebar({ activePath, onNavigate }) {

    // 내부 스타일 정의 (activePath와 item.path를 비교하여 활성화 상태 확인)
    const sidebarButtonClass = (path) =>
        `flex flex-col items-center justify-center w-full h-16 rounded-lg transition-all duration-200 p-2 cursor-pointer ${
            activePath === path //  현재 경로와 버튼 경로 비교
                ? 'text-blue-400 bg-gray-700'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`;

    //  '설정' 버튼의 경로를 임의로 /settings로 가정
    const settingsPath = '/settings';

    return (
        <div className="w-20 bg-gray-800 flex flex-col items-center py-4 border-r border-gray-700">
            {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.key}
                        //  [수정] 클릭 시 onNavigate(navigate 함수)를 호출하여 페이지 이동
                        onClick={() => onNavigate(item.path)}
                        className={sidebarButtonClass(item.path)}
                        title={item.label}
                    >
                        <Icon size={24} /><span className="text-xs mt-1">{item.label}</span>
                    </button>
                );
            })}

            <div className="flex-grow"></div>

            {/* 설정 버튼 (항상 하단) */}
            <button
                onClick={() => onNavigate(settingsPath)}
                className={sidebarButtonClass(settingsPath)}
                title="환경 설정"
            >
                <Settings size={24} /><span className="text-xs mt-1">설정</span>
            </button>
        </div>
    );
}