import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function FriendSelectionModal({
                                                 isOpen,
                                                 onClose,
                                                 friendsList,
                                                 onConfirm,   // 확인 버튼 클릭 시 호출될 함수 (선택된 ID 배열을 인수로 받음)
                                                 title = '멤버 선택', // 모달 제목
                                                 confirmLabel = '확인', // 확인 버튼 레이블
                                                 children, // children prop을 받도록 정의
                                             }) {
    // 내부적으로 선택된 친구 ID 목록을 관리합니다.
    const [selectedFriends, setSelectedFriends] = useState([]);

    if (!isOpen) return null;

    const toggleFriendSelection = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleConfirm = () => {
        onConfirm(selectedFriends); // 상위 컴포넌트에 선택된 친구 ID 전달
        setSelectedFriends([]); // 초기화
        onClose();
    };

    const handleClose = () => {
        setSelectedFriends([]); // 취소 시 초기화
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white">
                        <X size={24}/>
                    </button>
                </div>

                {/* 🚨 [필수] NewChatModal에서 전달된 자식 요소(토글, 입력창) 렌더링 */}
                {children}

                <div className="flex-1 overflow-y-auto mb-4">
                    <div className="text-sm text-gray-400 mb-2">친구 목록 ({friendsList.length}명)</div>
                    {friendsList.map(friend => (
                        <div
                            key={friend.id}
                            onClick={() => toggleFriendSelection(friend.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                                selectedFriends.includes(friend.id)
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            <span className="text-2xl">{friend.profileImage}</span>
                            <span className="text-white flex-1">{friend.name}</span>
                            {selectedFriends.includes(friend.id) && <Check size={20} className="text-white"/>}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={selectedFriends.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
                >
                    {selectedFriends.length}명 {confirmLabel}
                </button>
            </div>
        </div>
    );
};