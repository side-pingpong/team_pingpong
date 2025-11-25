import React, { useState } from 'react';
import FriendSelectionModal from "./FriendSelectionModal";
import {ChevronLeft, X} from "lucide-react";

const mockFriends = [
    { id: 'gaha', name: '은우', profileImage: '🧑' },
    { id: 'gamin', name: '가민', profileImage: '👩‍💻' },
    { id: 'ganggeon', name: '정우', profileImage: '🧔' },
    { id: 'gangminseo', name: '이진', profileImage: '👧' },
    { id: 'gangminjeong', name: '강민정', profileImage: '👩' },
    { id: 'gangseulgi', name: '강슬기', profileImage: '👱‍♀️' },
];

// 선택된 친구 이름 목록을 기반으로 채팅방 이름 자동 생성
const generateChatName = (selectedFriendIds, customName) => {
    if (customName && customName.trim() !== '') return customName.trim();

    const names = selectedFriendIds.map(id => mockFriends.find(f => f.id === id)?.name).filter(Boolean);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, ${names[1]}`;
    return `${names[0]}, ${names[1]} 외 ${names.length - 2}명`;
};

const NewChatModal = React.memo(({ onClose, onConfirm }) => {
    const [chatType, setChatType] = useState('general');
    const [chatName, setChatName] = useState('');
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);

    // [추가] FriendSelectionModal에서 호출될 때 상태를 업데이트하는 함수
    const handleFriendSelectionChange = (selectedIds) => {
        setSelectedFriendIds(selectedIds);
    };

    // 최종 확인 버튼 클릭 시 호출
    const handleFriendSelectionConfirm = (selectedFriendIds) => {
        if (selectedFriendIds.length === 0) {
            alert('대화 상대를 선택해주세요.');
            return;
        }

        const finalName = generateChatName(selectedFriendIds, chatName);

        // 상위의 onConfrim으로 최종 데이터 전달
        onConfirm({
            name: finalName,
            participants: selectedFriendIds,
            isTeam: chatType === 'team',
            profileImage: mockFriends.find(f => f.id === selectedFriendIds[0])?.profileImage
        });
        onClose();
    };

    return (
        <FriendSelectionModal
            isOpen={true} // NewChatModal이 렌더링되면 FriendSelectionModal은 항상 열림
            onClose={onClose}
            friendsList={mockFriends}
            onConfirm={handleFriendSelectionConfirm}
            title={chatType === 'team' ? '팀 채팅 멤버 선택' : '일반 채팅 상대 선택'}
            confirmLabel={chatType === 'team' ? '팀 채팅방 만들기' : '새 채팅 만들기'}

            // 상태 끌어올리기: 친구 선택 변경 시 상위 상태 업데이트
            onSelectionChange={handleFriendSelectionChange}
        >
            {/* FriendSelectionModal 위에 채팅 유형 설정 UI (children) */}
            <div className="flex justify-center mb-4 bg-gray-700 rounded-lg p-1">
                <button
                    className={`flex-1 p-2 rounded-lg transition-colors font-semibold ${chatType === 'general' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    onClick={() => setChatType('general')}
                >
                    일반 채팅
                </button>
                <button
                    className={`flex-1 p-2 rounded-lg transition-colors font-semibold ${chatType === 'team' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    onClick={() => setChatType('team')}
                >
                    팀 채팅
                </button>
            </div>

            {/* 채팅방 이름 설정 (팀 채팅 또는 2인 이상일 때 노출) */}
            {(chatType === 'team' || selectedFriendIds.length > 1) && (
                <input
                    type="text"
                    placeholder="채팅방 이름을 설정해주세요 (선택사항)"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
                />
            )}
        </FriendSelectionModal>
    );
});

export default NewChatModal;