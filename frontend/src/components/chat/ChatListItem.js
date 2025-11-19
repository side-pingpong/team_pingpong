import React from 'react';
import { FlagIcon, Star, BellOff } from 'lucide-react';
import {formatChatTime} from "../../utils/TimeUtils";

const ChatListItem = React.memo(({ chat, onContextMenu }) => {
    const { id, name, lastMessage, lastTime, isTeam, isFavorite, unreadCount, profileImage, isAlertOn } = chat;

    // lastTime Prop을 formatChatTime 유틸리티 함수로 변환
    const displayTime = formatChatTime(lastTime);

    return (
        <div
            className="flex items-center p-3 cursor-pointer hover:bg-gray-700 transition-colors border-b border-gray-700"
            onContextMenu={(e) => onContextMenu(e, id)} // 우클릭 시 핸들러 호출
        >

            {/* 프로필 사진 영역 (이모지로 대체) */}
            <div className="mr-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                    {profileImage}
                </div>
            </div>

            {/* 채팅 정보 영역 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center font-semibold text-white truncate">
                    {isTeam && <FlagIcon size={14} className="mr-2 text-green-50 fill-green-50" />}
                    <span className="truncate">{name}</span>
                    {isFavorite && <Star size={14} className="ml-2 text-yellow-400 fill-yellow-400" />}
                    {!isAlertOn && <BellOff size={14} className="ml-2 text-gray-500 fill-gray-500" />}
                </div>

                {/* 마지막 메시지 내용 */}
                <div className="text-sm text-gray-400 truncate mt-0.5">
                    {lastMessage}
                </div>
            </div>

            {/* 시간 및 알림/읽지 않은 메시지 영역 */}
            <div className="ml-2 text-right">
                <div className="text-xs text-gray-500 mb-1">{displayTime}</div>
                {/* 읽지 않은 메시지 수 표시 */}
                {unreadCount > 0 && (
                    <div className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                    </div>
                )}
            </div>
        </div>
    );
});

export default ChatListItem;