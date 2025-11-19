import React, { useState } from 'react';
import FriendSelectionModal from "../../components/chat/FriendSelectionModal";

const mockFriends = [
    { id: 'gaha', name: '가함', profileImage: '🧑' },
    { id: 'gamin', name: '가민', profileImage: '👩‍💻' },
    { id: 'ganggeon', name: '강건', profileImage: '🧔' },
    { id: 'gangminseo', name: '강민서', profileImage: '👧' },
    { id: 'gangminjeong', name: '강민정', profileImage: '👩' },
    { id: 'gangseulgi', name: '강슬기', profileImage: '👱‍♀️' },
];

const NewChatModal = React.memo(({ onClose, onConfirm }) => { // onConfirm props 추가
    const [chatType, setChatType] = useState('general');
    const [chatName, setChatName] = useState('');

    // 선택된 친구 이름 목록을 기반으로 채팅방 이름 자동 생성
    const generateChatName = (selectedFriendIds) => {
        const names = selectedFriendIds.map(id => mockFriends.find(f => f.id === id)?.name).filter(Boolean);
        if (names.length === 1) return names[0];
        if (names.length === 2) return `${names[0]}, ${names[1]}`;
        return `${names[0]}, ${names[1]} 외 ${names.length - 2}명`;
    };

    const handleFriendSelectionConfirm = (selectedFriendIds) => {
        if (selectedFriendIds.length === 0) {
            alert('대화 상대를 선택해주세요.');
            return;
        }

        let finalName = chatName.trim();
        if (finalName === '') {
            finalName = generateChatName(selectedFriendIds);
        }

        // 메인 컴포넌트(ChatListScreen)의 onConfirm으로 최종 데이터 전달
        onConfirm({
            name: finalName,
            participants: selectedFriendIds,
            isTeam: chatType === 'team',
            profileImage: mockFriends.find(f => f.id === selectedFriendIds[0])?.profileImage
        });
    };

    return (
        <FriendSelectionModal
            isOpen={true} // NewChatModal이 렌더링되면 FriendSelectionModal은 항상 열림
            onClose={onClose}
            friendsList={mockFriends}
            onConfirm={handleFriendSelectionConfirm}
            title={chatType === 'team' ? '팀 채팅 멤버 선택' : '일반 채팅 상대 선택'}
            confirmLabel={chatType === 'team' ? '팀 채팅방 만들기' : '새 채팅 만들기'}
        >
            {/* FriendSelectionModal 위에 채팅 유형 설정 UI 추가 */}
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
        </FriendSelectionModal>
    );
});

export default NewChatModal;