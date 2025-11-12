import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, Calendar, User, Menu, Send, MessageCircle } from 'lucide-react';

export default function ChatRoom() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);

    // 현재 사용자
    const currentUser = {
        id: 'user1',
        name: '나',
        avatar: '👤'
    };

    // 채팅방 참여자
    const participants = [
        { id: 'user2', name: '김철수', avatar: '🧑' },
        { id: 'user3', name: '이영희', avatar: '👩' },
        { id: 'user4', name: '박지성', avatar: '🧔' }
    ];

    // 메시지 데이터 (실제로는 상태 관리로 처리)
    const [messages, setMessages] = useState([
        {
            id: 1,
            userId: 'user2',
            userName: '김철수',
            avatar: '🧑',
            content: '사진찍 메시지 잘 호비시, 댓글 달기 아이로 등.',
            timestamp: '2025년 11월 04일 화요일',
            date: '2025-11-04',
            replies: []
        },
        {
            id: 2,
            userId: 'user1',
            userName: '나',
            avatar: '👤',
            content: '네, 알겠습니다!',
            timestamp: '2025년 11월 04일 화요일',
            date: '2025-11-04',
            replies: []
        },
        {
            id: 3,
            userId: 'user3',
            userName: '이영희',
            avatar: '👩',
            content: '회의는 몇 시에 시작하나요?',
            timestamp: '2025년 11월 05일 수요일',
            date: '2025-11-05',
            replies: []
        }
    ]);

    // 메시지 필터링
    const filteredMessages = messages.filter(msg => {
        const matchesSearch = !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUser = !selectedUser || msg.userId === selectedUser;
        const matchesDate = !selectedDate || msg.date === selectedDate;
        return matchesSearch && matchesUser && matchesDate;
    });

    // 날짜별 그룹화
    const groupedMessages = filteredMessages.reduce((acc, msg) => {
        if (!acc[msg.timestamp]) {
            acc[msg.timestamp] = [];
        }
        acc[msg.timestamp].push(msg);
        return acc;
    }, {});

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            userId: currentUser.id,
            userName: currentUser.name,
            avatar: currentUser.avatar,
            content: messageInput,
            timestamp: '2025년 11월 05일 수요일',
            date: '2025-11-05',
            replies: []
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
    };

    const handleAddReply = (messageId, replyContent) => {
        setMessages(messages.map(msg => {
            if (msg.id === messageId) {
                return {
                    ...msg,
                    replies: [...msg.replies, {
                        id: Date.now(),
                        userId: currentUser.id,
                        userName: currentUser.name,
                        content: replyContent
                    }]
                };
            }
            return msg;
        }));
        setReplyingTo(null);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* 헤더 */}
            <div className={`bg-gray-800 text-white transition-all duration-300 ${isSearchOpen ? 'h-32' : 'h-16'}`}>
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            💬
                        </div>
                        <div>
                            <div className="font-semibold">채팅방 프로필</div>
                            <div className="text-xs text-gray-400">채팅방 인원수</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Search size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                {/* 검색창 영역 */}
                {isSearchOpen && (
                    <div className="px-4 pb-4 flex items-center gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="대화내용 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <ChevronUp size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <ChevronDown size={20} />
                        </button>
                        <button
                            onClick={() => {
                                const date = prompt('날짜를 입력하세요 (YYYY-MM-DD):');
                                if (date) setSelectedDate(date);
                            }}
                            className={`p-2 rounded-lg transition-colors ${selectedDate ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                        >
                            <Calendar size={20} />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className={`p-2 rounded-lg transition-colors ${selectedUser ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                            >
                                <User size={20} />
                            </button>

                            {/* 인물 검색 드롭다운 */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-10">
                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(null);
                                                setIsUserDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded transition-colors"
                                        >
                                            전체 보기
                                        </button>
                                        {participants.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => {
                                                    setSelectedUser(user.id);
                                                    setIsUserDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded transition-colors flex items-center gap-2"
                                            >
                                                <span className="text-2xl">{user.avatar}</span>
                                                <span>{user.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 필터 상태 표시 */}
            {(selectedUser || selectedDate) && (
                <div className="bg-gray-800 px-4 py-2 flex gap-2">
                    {selectedUser && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {participants.find(p => p.id === selectedUser)?.name}
                            <button onClick={() => setSelectedUser(null)}>✕</button>
            </span>
                    )}
                    {selectedDate && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {selectedDate}
                            <button onClick={() => setSelectedDate('')}>✕</button>
            </span>
                    )}
                </div>
            )}

            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                        {/* 날짜 구분선 */}
                        <div className="flex items-center justify-center my-4">
                            <div className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm">
                                {date}
                            </div>
                        </div>

                        {/* 메시지 목록 */}
                        {msgs.map((message) => {
                            const isCurrentUser = message.userId === currentUser.id;
                            return (
                                <div key={message.id} className="mb-4">
                                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                                        {/* 다른 사용자의 아바타 */}
                                        {!isCurrentUser && (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                                                    {message.avatar}
                                                </div>
                                                <div className="text-xs text-gray-400">{message.userName}</div>
                                            </div>
                                        )}

                                        {/* 메시지 박스 */}
                                        <div className="max-w-xl relative group">
                                            <div
                                                className={`px-4 py-3 rounded-lg ${
                                                    isCurrentUser
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-700 text-white'
                                                }`}
                                                onMouseEnter={() => setHoveredMessageId(message.id)}
                                                onMouseLeave={() => setHoveredMessageId(null)}
                                            >
                                                {message.content}

                                                {/* 댓글 달기 버튼 (다른 사용자 메시지에만) */}
                                                {!isCurrentUser && hoveredMessageId === message.id && (
                                                    <button
                                                        onClick={() => {
                                                            const reply = prompt('댓글을 입력하세요:');
                                                            if (reply) handleAddReply(message.id, reply);
                                                        }}
                                                        className="absolute -right-10 top-1/2 -translate-y-1/2 bg-gray-600 p-2 rounded-full hover:bg-gray-500 transition-colors"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* 댓글 표시 */}
                                            {message.replies && message.replies.length > 0 && (
                                                <div className="mt-2 ml-4 space-y-1">
                                                    {message.replies.map(reply => (
                                                        <div key={reply.id} className="bg-gray-800 px-3 py-2 rounded text-sm">
                                                            <span className="text-blue-400 font-semibold">{reply.userName}: </span>
                                                            <span className="text-gray-300">{reply.content}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* 메시지 입력창 */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="메시지 입력"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}