import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

import ContextMenu from "../../components/chat/ContextMenu";
import ChatListItem from '../../components/chat/ChatListItem';
import NewChatModal from '../../components/chat/NewChatModal';
import Sidebar from "../../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import {handleChatRoomLeave, handleDeleteChatRoom} from "../../utils/chatUtils";

const initialMockChats = [
    { id: 1, name: '팀 프로젝트 그룹', lastMessage: '회의 자료 공유했습니다.', lastTime: '2025-11-19T11:30:00Z', isTeam: true, isFavorite: true, unreadCount: 3, profileImage: '💼', isAlertOn: true },
    { id: 2, name: '민영', lastMessage: '점심 뭐 드실 거예요?', lastTime: '2025-11-18', isTeam: false, isFavorite: false, unreadCount: 0, profileImage: '👩‍💻', isAlertOn: false },
    { id: 3, name: '영경, 성훈', lastMessage: '확인했습니다!', lastTime: '2025-11-01', isTeam: false, isFavorite: true, unreadCount: 1, profileImage: '🤝', isAlertOn: true },
];

export default function ChatListScreen() {
    const [chats, setChats] = useState(initialMockChats); // 채팅 목록 상태
    const [currentSort, setCurrentSort] = useState('latest');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const navigate = useNavigate();

    // 우클릭 메뉴 상태
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        chatId: null,
    });

    const sortDropdownRef = useRef(null);
    const chatListRef = useRef(null);

    const sortOptions = [
        { key: 'latest', label: '최신 메시지 순' },
        { key: 'unread', label: '읽지 않은 메시지' },
        { key: 'favorite', label: '즐겨찾는 채팅방' },
        { key: 'default', label: '기본방' },
        { key: 'team', label: '팀 채팅방' },
    ];

    // [추가] 페이지 이동 핸들러
    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleAddChat = (newChatData) => {
        const newChat = {
            id: Date.now(),
            name: newChatData.name,
            lastMessage: '새 채팅이 시작되었습니다.',
            lastTime: new Date().toISOString(),
            isTeam: newChatData.isTeam,
            isFavorite: false,
            unreadCount: 0,
            profileImage: newChatData.isTeam ? '👥' : newChatData.profileImage || '💬',
            isAlertOn: true,
        };
        setChats(prevChats => [newChat, ...prevChats]);
        setIsNewChatModalOpen(false);
    };

    // 우클릭 메뉴 열기 핸들러 (ChatListItem에서 호출)
    const handleContextMenu = useCallback((e, chatId) => {
        e.preventDefault();

        const rect = chatListRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // 메뉴가 화면 밖으로 나가지 않도록 조정
        const menuWidth = 200;
        const menuHeight = 250;
        if (x + menuWidth > rect.width) {
            x = rect.width - menuWidth - 20;
        }
        if (y + menuHeight > rect.height) {
            y = rect.height - menuHeight - 20;
        }

        setContextMenu({
            visible: true,
            x: x,
            y: y,
            chatId: chatId,
        });
    }, []);

    // 컨텍스트 메뉴에서 기능 실행 핸들러
    const handleMenuAction = (action, chatId) => {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;

        // 실제로는 전역 상태/prop에서 가져와야함
        const isOwner = chat.id === 1; // 임시 방장 로직
        const participants = [{ id: 'user1', name: '나', isOwner: isOwner }, { id: 'user2', name: '팀원1' }];
        const currentUser = participants[0];

        switch (action) {
            case 'open':
                alert(`${chat.name} 채팅방 열기`);
                break;
            case 'rename':
                const newName = prompt('새로운 채팅방 이름을 입력하세요:', chat.name);
                if (newName && newName.trim() !== '' && newName !== chat.name) {
                    setChats(chats.map(c => c.id === chatId ? {...c, name: newName} : c));
                }
                break;
            case 'favorite':
                setChats(chats.map(c => c.id === chatId ? {...c, isFavorite: !c.isFavorite} : c));
                alert(`${chat.name} 즐겨찾기 ${chat.isFavorite ? '해제' : '설정'}`);
                break;
            case 'toggle_alert':
                setChats(prevChats => prevChats.map(c =>
                    c.id === chatId
                        ? {...c, isAlertOn: !c.isAlertOn} // 상태 토글
                        : c
                ));
                alert(`${chat.name} 알림을 ${chat.isAlertOn ? '껐습니다' : '켰습니다'}.`);
                break;
            case 'leave':

                handleChatRoomLeave({
                    chatName: chat.name,
                    isOwner: isOwner,
                    participants: participants,
                    leaveCallback: () => setChats(chats.filter(c => c.id !== chatId)), // 채팅방 목록에서 제거
                    currentUser: currentUser,
                })
                break;
            case 'delete':
                handleDeleteChatRoom({
                    chatData: { id: chat.id, name: chat.name },
                    currentUser: currentUser,
                    deleteCallback: (deletedId) => {
                        // 삭제된 채팅방을 리스트에서 제거
                        setChats(prevChats => prevChats.filter(c => c.id !== deletedId));
                    }
                });
                break;
            default:
                break;
        }
        setContextMenu({ visible: false, x: 0, y: 0, chatId: null }); // 메뉴 닫기
    };


    // 정렬 및 필터링 로직
    const getSortedAndFilteredChats = useCallback(() => {
        let sortedChats = [...chats]; // ✔️ let 가 뭐야?

        if (currentSort === 'unread') {
            sortedChats.sort((a, b) => b.unreadCount - a.unreadCount);
        } else if (currentSort === 'favorite') { // <--- 즐겨찾기 필터링 추가
        sortedChats = sortedChats.filter(chat => chat.isFavorite);
        } else if (currentSort === 'default') { // <--- 기본방 필터링 추가 (isTeam이 아닌 것)
        sortedChats = sortedChats.filter(chat => !chat.isTeam);
        } else if (currentSort === 'team') { // <--- 팀 채팅방 필터링 추가
        sortedChats = sortedChats.filter(chat => chat.isTeam);
        }

        // 2. 검색어 필터링
        if (searchQuery.length > 0) {
            return sortedChats.filter(chat =>
                chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return sortedChats;
    }, [currentSort, searchQuery, chats]);

    const filteredChats = getSortedAndFilteredChats();

    // 드롭다운 및 컨텍스트 메뉴 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            // 정렬 드롭다운 닫기
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
            // 컨텍스트 메뉴 닫기
            if (contextMenu.visible && chatListRef.current && !chatListRef.current.contains(event.target)) {
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [contextMenu.visible]);

    return (
        <div className="flex h-screen w-full bg-gray-900 mx-auto shadow-2xl">

            {/* 1. 사이드바 */}
            <Sidebar
               activePath={window.location.pathname} // 현재 경로를 Sidebar에 전달 (하이라이팅용)
                onNavigate={handleNavigation} // 네비게이션 함수 전달
            />

            {/* 2. 메인 콘텐츠 (채팅 리스트) */}
            <div className="flex-1 flex flex-col bg-gray-900">

                {/* 헤더: 정렬, 검색, 새 채팅 */}
                <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">

                    {/* 정렬 드롭다운 */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            className="flex items-center text-xl font-bold text-white hover:text-gray-300 transition-colors"
                            onClick={() => setIsSortDropdownOpen(prev => !prev)}
                        >
                            채팅 <ChevronDown size={18}
                                            className={`ml-1 transition-transform ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'}`}/>
                        </button>
                        {isSortDropdownOpen && (
                            <div
                                className="absolute top-full left-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-10 p-1">
                                {sortOptions.map(option => (
                                    <div
                                        key={option.key}
                                        className={`px-3 py-2 cursor-pointer rounded transition-colors ${currentSort === option.key ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`} // ✔️ 여기 설명해줘
                                        onClick={() => {
                                            setCurrentSort(option.key);
                                            setIsSortDropdownOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                            onClick={() => setIsSearching(true)}
                            title="채팅 검색"
                        >
                            <Search size={20}/>
                        </button>
                        <button
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors font-semibold"
                            onClick={() => setIsNewChatModalOpen(true)}
                            title="새 채팅 만들기"
                        >
                            새 채팅
                        </button>
                    </div>
                </div>

                {/* 검색창 */}
                {isSearching && (
                    <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="채팅방, 참여자 검색 | 통합 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setIsSearching(false);
                                setSearchQuery('');
                            }}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20}/>
                        </button>
                    </div>
                )}

                {/* 채팅방 리스트 및 컨텍스트 메뉴 컨테이너 */}
                <div ref={chatListRef} className="flex-1 overflow-y-auto relative">
                    {filteredChats.length > 0 ? (
                        filteredChats.map(chat => (
                            <ChatListItem
                                key={chat.id}
                                chat={chat}
                                onContextMenu={handleContextMenu}
                            />
                        ))
                    ) : (
                        <p className="p-4 text-gray-400 text-center">검색 결과가 없습니다.</p>
                    )}

                    {/* 컨텍스트 메뉴 컴포넌트 */}
                    {contextMenu.visible && (
                        <ContextMenu
                            x={contextMenu.x}
                            y={contextMenu.y}
                            chatId={contextMenu.chatId}
                            onAction={handleMenuAction}
                            onClose={() => setContextMenu(prev => ({...prev, visible: false}))}
                            isFavorite={chats.find(c => c.id === contextMenu.chatId)?.isFavorite || false}
                        />
                    )}
                </div>
            </div>

            {/* 새 채팅 만들기 모달 */}
            {isNewChatModalOpen && (
                <NewChatModal
                    onClose={() => setIsNewChatModalOpen(false)}
                    onConfirm={handleAddChat} // 새 채팅 생성 후 리스트에 추가하는 핸들러 전달
                />
            )}
        </div>
    );
}