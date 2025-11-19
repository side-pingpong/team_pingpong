import React, { useState } from 'react';

const mockFriends = [
    { id: 'gaha', name: '가함', profileEmoji: '🧑' },
    { id: 'gamin', name: '가민', profileEmoji: '👩‍💻' },
    { id: 'ganggeon', name: '강건', profileEmoji: '🧔' },
    { id: 'gangminseo', name: '강민서', profileEmoji: '👧' },
    { id: 'gangminjeong', name: '강민정', profileEmoji: '👩' },
    { id: 'gangseulgi', name: '강슬기', profileEmoji: '👱‍♀️' },
];

const NewChatModal = React.memo(({ onClose, onConfirm }) => { // onConfirm props 추가
    const [chatType, setChatType] = useState('general');
    const [searchText, setSearchText] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [chatName, setChatName] = useState('');

    const filteredFriends = mockFriends.filter(friend =>
        friend.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSelectFriend = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    // 선택된 친구 이름 목록을 기반으로 채팅방 이름 자동 생성
    const generateChatName = (selectedIds) => {
        const names = selectedIds.map(id => mockFriends.find(f => f.id === id)?.name).filter(Boolean);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0];
        if (names.length === 2) return `${names[0]}, ${names[1]}`;
        return `${names[0]}, ${names[1]} 외 ${names.length - 2}명`;
    };

    const handleConfirm = () => {
        if (selectedFriends.length === 0) {
            alert('대화 상대를 선택해주세요.');
            return;
        }

        let finalName = chatName.trim();
        if (finalName === '') {
            finalName = generateChatName(selectedFriends);
        }

        // 메인 컴포넌트로 새 채팅 정보를 전달
        onConfirm({
            name: finalName,
            participants: selectedFriends,
            isTeam: chatType === 'team',
            profileEmoji: mockFriends.find(f => f.id === selectedFriends[0])?.profileEmoji
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-96 shadow-2xl text-white">

                <div className="flex justify-center mb-6 bg-gray-700 rounded-lg p-1">
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

                {/* 채팅방 이름 설정 (팀 채팅 또는 3인 이상일 때 유용) */}
                {(chatType === 'team' || selectedFriends.length > 1) && (
                    <input
                        type="text"
                        placeholder="채팅방 이름을 설정해주세요 (선택사항)"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
                    />
                )}

                <h3 className="text-lg font-bold mb-3">대화상대 선택 ({selectedFriends.length}명)</h3>

                <input
                    type="text"
                    placeholder="친구 검색"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"
                />
                <p className="text-sm text-gray-400 mb-3">친구 {mockFriends.length}명</p>

                <div className="friend-list h-48 overflow-y-auto bg-gray-700 rounded-lg p-2 space-y-1">
                    {filteredFriends.map(friend => (
                        <div key={friend.id} className="flex justify-between items-center p-2 hover:bg-gray-600 rounded transition-colors">
                            <span className="flex items-center gap-2">{friend.profileEmoji} {friend.name}</span>
                            <input
                                type="checkbox"
                                checked={selectedFriends.includes(friend.id)}
                                onChange={() => handleSelectFriend(friend.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-5 gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors">
                        취소
                    </button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
});

export default NewChatModal;