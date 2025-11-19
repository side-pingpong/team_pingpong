import React, { useEffect, useRef } from 'react';
import { MessageSquare, Star, Bell, LogOut, Edit3 } from 'lucide-react';

const ContextMenu = React.memo(({ x, y, chatId, onAction, onClose, isFavorite }) => {
    const menuRef = useRef(null);

    // 메뉴 항목 정의
    const menuItems = [
        { key: 'open', label: '채팅방 열기', icon: MessageSquare },
        { key: 'rename', label: '채팅방 이름 설정', icon: Edit3 },
        { key: 'favorite', label: isFavorite ? '즐겨찾기 해제' : '채팅방 즐겨찾기', icon: Star, className: isFavorite ? 'text-yellow-400' : '' },
        { key: 'toggle_alert', label: '알림 켜기/끄기', icon: Bell },
        { key: 'leave', label: '채팅방 나가기', icon: LogOut, className: 'text-red-500' },
    ];

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleItemClick = (key) => {
        onAction(key, chatId);
    };

    return (
        // position: absolute, z-index를 높여 가장 위에 표시
        <div
            ref={menuRef}
            className="absolute bg-gray-700 rounded-lg shadow-xl z-30 w-52 overflow-hidden border border-gray-600"
            style={{ top: y, left: x }}
        >
            <div className="p-1">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.key}
                            onClick={() => handleItemClick(item.key)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-white rounded transition-colors ${item.className || 'hover:bg-gray-600'}`}
                        >
                            <Icon size={16} className={item.className} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

export default ContextMenu;