import React, { useState, useEffect, useRef, useCallback } from 'react';
import FriendSelectionModal from "../../components/chat/FriendSelectionModal";
import {handleChatRoomLeave, handleDeleteChatRoom} from "../../utils/chatUtils";
import {isSameDay, formatDate} from "../../utils/timeUtils";
import {uploadFileApi, fetchFilesApi} from "../../api/file";
import {handleFileDownload as utilsHandleFileDownload, groupFilesByDate} from "../../utils/fileUtils";
import { Search, ChevronUp, ChevronDown, Calendar, User, Menu, Send, MessageCircle, X, Settings, LogOut, Trash2, UserPlus, Edit, Paperclip, Download, FileText, Video, Folder, Image } from 'lucide-react'; // [수정] 사용하지 않는 아이콘 제거

export default function ChatRoom() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [replyingToMessage, setReplyingToMessage] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    const [isEditingRoomName, setIsEditingRoomName] = useState(false);
    const [roomName, setRoomName] = useState('채팅방 프로필');
    const [roomThumbnail, setRoomThumbnail] = useState('💬');
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    // 추가 : 파일 관련
    const [chatFiles, setChatFiles] = useState([]); // 현재 채팅방 파일 목록
    const [downloadProgress, setDownloadProgress] = useState({}); // 다운로드 진행 상태 관리
    const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률 상태 (0:초기, 1~100: 진행 중)
    // 추가: 메시지 스크롤을 위한 Ref
    const messagesEndRef = useRef(null);

    // 추가 : 현재 채팅방 정보
    const currentChatData = {
        id: 101,
        name: '프로젝트 팀방',
        // 실제로는 이 정보도 상위 컴포넌트(ChatListApp)로부터 props로 받아와야함
    };

    // 현재 사용자
    const currentUser = {
        id: 'user1',
        name: '나',
        profileImage: '👤',
        isOwner: true // 방장 여부
    };

    // 채팅방 참여자
    const [participants, setParticipants] = useState([
        { id: 'user2', name: '김철수', profileImage: '🧑', isOwner: false },
        { id: 'user3', name: '이영희', profileImage: '👩', isOwner: false },
        { id: 'user4', name: '박지성', profileImage: '🧔', isOwner: false }
    ]);

    // 친구 목록 (가나다순 정렬)
    const [friendsList] = useState([
        { id: 'friend1', name: '강민수', profileImage: '🧑‍💼' },
        { id: 'friend2', name: '권지은', profileImage: '👩‍💼' },
        { id: 'friend3', name: '김영수', profileImage: '🧑‍🎓' },
        { id: 'friend4', name: '박서현', profileImage: '👩‍🎨' },
        { id: 'friend5', name: '송민호', profileImage: '🧑‍🔬' },
        { id: 'friend6', name: '이수진', profileImage: '👩‍⚕️' },
        { id: 'friend7', name: '정대현', profileImage: '🧑‍🍳' },
        { id: 'friend8', name: '최유리', profileImage: '👩‍🏫' }
    ].filter(friend => !participants.find(p => p.id === friend.id)));

    // 메시지 데이터
    const [messages, setMessages] = useState([
        {
            id: 1,
            userId: 'user2',
            userName: '김철수',
            profileImage: '🧑',
            content: '사진찍 메시지 잘 호비시, 댓글 달기 아이로 등.',
            timestamp: new Date('2025-11-04T10:30:00'),
            replies: [],
            replyTo: null, // 답장 대상 메시지 정보
            files: [] // 첨부 파일
        },
        {
            id: 2,
            userId: 'user1',
            userName: '나',
            profileImage: '👤',
            content: '네, 알겠습니다!',
            timestamp: new Date('2025-11-04T10:32:00'),
            replies: [],
            replyTo: null,
            files: []
        },
        {
            id: 3,
            userId: 'user3',
            userName: '이영희',
            profileImage: '👩',
            content: '회의는 몇 시에 시작하나요?',
            timestamp: new Date('2025-11-05T09:15:00'),
            replies: [],
            replyTo: null,
            files: []
        }
    ]);

    // 메시지 필터링
    const filteredMessages = messages.filter(msg => {
        const matchesSearch = !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUser = !selectedUser || msg.userId === selectedUser;
        const matchesDate = !selectedDate || isSameDay(msg.timestamp, new Date(selectedDate));
        return matchesSearch && matchesUser && matchesDate;
    });

    // 날짜별 그룹화
    const groupedMessages = filteredMessages.reduce((acc, msg) => {
        const dateKey = formatDate(msg.timestamp);
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(msg);
        return acc;
    }, {});

    // ----------------------------------------------------------------
    // [수정] handleSendReply 함수 정의
    // ----------------------------------------------------------------
    const handleSendReply = () => {
        if (!messageInput.trim() || !replyingToMessage) return;

        const replyMessage = {
            id: messages.length + 1,
            userId: currentUser.id,
            userName: currentUser.name,
            profileImage: currentUser.profileImage,
            content: messageInput,
            timestamp: new Date(),
            replies: [],
            replyTo: {
                id: replyingToMessage.id,
                userName: replyingToMessage.userName,
                content: replyingToMessage.content,
            },
            files: []
        };

        setMessages(prevMessages => [...prevMessages, replyMessage]);
        setMessageInput('');
        setReplyingToMessage(null); // 답장 모드 해제
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() && uploadedFiles.length === 0 && !replyingToMessage) return;

        // 덧글 전송
        if (replyingToMessage) {
            handleSendReply(); // 정의된 함수 호출
            return;
        }

        const newMessage = {
            id: messages.length + 1,
            userId: currentUser.id,
            userName: currentUser.name,
            profileImage: currentUser.profileImage,
            content: messageInput,
            timestamp: new Date(),
            replies: [],
            replyTo: null,
            files: uploadedFiles.map((file, index) => ({
                id: Date.now() + index,
                name: file.name,
                type: file.type,
                url: URL.createObjectURL(file) // 임시 URL 생성
            })),
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
        setUploadedFiles([]); // 파일 목록 초기화
    };

    // [수정] 사용되지 않는 handleAddReply 함수 제거 (경고 해결)
    // const handleAddReply = (messageId, replyContent) => { ... };

    // ----------------------------------------------------------------
    // [추가] 누락된 함수 정의 (화면 정상화를 위해 필수)
    // ----------------------------------------------------------------

    // 메시지 스크롤 함수
    const scrollToMessage = (messageId) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // ----------------------------------------------------
    // [수정] 파일 다운로드 Wrapper (상태 관리 로직은 여기에 남음)
    const handleFileDownload = useCallback((fileId, url, fileName) => {
        setDownloadProgress(prev => ({ ...prev, [fileId]: 1 })); // 다운로드 시작

        // 순수 유틸리티 함수 호출
        utilsHandleFileDownload(url, fileName);

        // 다운로드 완료 목업 로직 (실제는 API 응답 헤더나 웹소켓으로 처리)
        setTimeout(() => {
            setDownloadProgress(prev => ({ ...prev, [fileId]: 100 }));
            // 완료 후 0.5초 뒤 상태 제거
            setTimeout(() => {
                setDownloadProgress(prev => {
                    const newState = { ...prev };
                    delete newState[fileId];
                    return newState;
                });
            }, 500);
        }, 1500);
    }, []);


    // [수정] 파일 목록 가져오기 로직 (API 호출 및 가공)
    const loadFiles = useCallback(async () => {
        try {
            //  API 호출
            const files = await fetchFilesApi(currentChatData.id);
            setChatFiles(files);
        } catch (error) {
            alert('파일 목록을 불러오는 데 실패했습니다.');
            console.error(error);
        }
    }, [currentChatData.id]); // currentChatData.id가 변경될 때마다 호출

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);


    // [수정] 파일 업로드 로직 (API 호출)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', currentChatData.id.toString());

        let interval;
        try {
            // 업로드 시작 상태 (진행률 상태 표시 시작)
            setUploadProgress(1);

            // 진행률 시뮬레이션 시작 (실제는 API의 onProgress 이벤트로 대체)
            interval = setInterval(() => {
                setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10));
            }, 300);

            // API 호출
            const newFileInfo = await uploadFileApi(formData);

            // API 완료 후 처리
            clearInterval(interval);
            setUploadProgress(100); // 100% 완료 표시

            // 업로드 성공 후 파일 목록에 추가
            setChatFiles(prev => [...prev, newFileInfo]);
            // alert(`${file.name} 파일 업로드 완료!`);
            // 메시지 전송 로직도 여기에 추가될 수 있음

        } catch (error) {
            alert('파일 업로드 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setTimeout(() => setUploadProgress(0), 500);
        }
    };

    //  [수정] 날짜별 그룹화 로직 (유틸리티 함수 사용)
    const groupedChatFiles = groupFilesByDate(chatFiles, formatDate);

    // ----------------------------------------------------------------
    // [추가] 스크롤 자동 이동
    // ----------------------------------------------------------------
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // 친구 초대
    const handleInviteFriends = (selectedFriendIds) => {
        // 변경: selectedFriends 상태 대신 인수로 받은 selectedFriendIds를 사용
        const newParticipants = friendsList
            .filter(friend => selectedFriendIds.includes(friend.id))
            .map(friend => ({ ...friend, isOwner: false }));

        setParticipants([...participants, ...newParticipants]);
        setIsInviteModalOpen(false);
        alert(`${newParticipants.length}명의 친구를 초대했습니다.`);
    };

    // 채팅방 나가기
    const handleLeaveChatRoom = () => {
        const chatName = roomName; // 채팅방 이름상태
        const isOwner = currentUser.isOwner;

        handleChatRoomLeave({
            chatName: chatName,
            isOwner: isOwner,
            participants: participants,
            leaveCallback: () => {
                // 실제 페이지 이동 로직: window.location.href = '/chatlist';
            },
            currentUser: currentUser,
        });
    };

    // 채팅방 삭제 (방장만)
    const handleDelete = () => {
        handleDeleteChatRoom({
            // 유틸리티 함수가 요구하는 형식에 맞게 데이터를 전달합니다.
            chatData: {
                id: currentChatData.id,
                name: currentChatData.name
            },
            currentUser: currentUser,
            deleteCallback: () => {
                console.log('채팅방 목록 페이지로 이동해야 함');
                // navigate('/chatlist'); 실행
            }
        });
    };

    // 채팅방 이미지 업로드
    const handleThumbnailUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setRoomThumbnail(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 채팅방 이름 수정
    const handleUpdateRoomName = () => {
        if (!currentUser.isOwner) {
            alert('방장만 채팅방 이름을 수정할 수 있습니다.');
            return;
        }
        setIsEditingRoomName(false);
        alert('채팅방 이름이 변경되었습니다.');
    };

    // 알림 토글
    const toggleNotification = () => {
        setIsNotificationEnabled(!isNotificationEnabled);
        if (!isNotificationEnabled) {
            // 알림 권한 요청 (브라우저 API)
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    };

    // 새 메시지 알림 (실제 구현 시)
    useEffect(() => {
        if (isNotificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
            // 새 메시지가 왔을 때 알림 표시
            // 실제로는 WebSocket이나 폴링으로 새 메시지 감지
        }
    }, [messages, isNotificationEnabled]);

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* 헤더 */}
            <div className={`bg-gray-800 text-white transition-all duration-300 ${isSearchOpen ? 'h-32' : 'h-16'}`}>
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                            {roomThumbnail.startsWith('data:') ? (
                                <img src={roomThumbnail} alt="채팅방" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl">{roomThumbnail}</span>
                            )}
                        </div>
                        <div>
                            <div className="font-semibold">{roomName}</div>

                            <button
                                onClick={() => setIsParticipantsModalOpen(true)}
                                className="text-xs text-gray-400 hover:text-blue-400 cursor-pointer transition-colors"
                            >
                                {participants.length + 1}명
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Search size={20} />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                {/* 검색창 영역 */}
                {isSearchOpen && (
                    <div className="px-4 pb-4 flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="메시지 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        {/* 필터링 드롭다운 */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-600 transition-colors"
                            >
                                <User size={18} />
                                {selectedUser ? participants.find(p => p.id === selectedUser)?.name || '사용자' : '사용자'}
                                {isUserDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-lg shadow-xl z-10">
                                    <button
                                        onClick={() => {
                                            setSelectedUser(null);
                                            setIsUserDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-600 rounded-t-lg"
                                    >
                                        전체
                                    </button>
                                    {[currentUser, ...participants].map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => {
                                                setSelectedUser(user.id);
                                                setIsUserDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-600"
                                        >
                                            {user.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 날짜 필터 */}
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-600 transition-colors appearance-none"
                            />
                            <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* 검색 초기화 버튼 */}
                        {(searchQuery || selectedUser || selectedDate) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedUser(null);
                                    setSelectedDate('');
                                }}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* 메뉴 드롭다운 */}
                {isMenuOpen && (
                    <div className="absolute right-4 top-16 mt-2 w-60 bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-700">
                        <button
                            onClick={() => {
                                setIsInviteModalOpen(true);
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-t-lg transition-colors flex items-center gap-3"
                        >
                            <UserPlus size={20} />
                            <span>멤버 초대</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsSettingsModalOpen(true);
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                            <Settings size={20} />
                            <span>채팅방 설정</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsDrawerOpen(true);
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                        >
                            <Folder size={20} />
                            <span>채팅방 서랍</span>
                        </button>
                        <div className="border-t border-gray-700 my-1" />
                        <button
                            onClick={handleLeaveChatRoom}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center gap-3 text-yellow-400"
                        >
                            <LogOut size={20} />
                            <span>채팅방 나가기</span>
                        </button>
                        {currentUser.isOwner && (
                            <button
                                onClick={handleDelete}
                                className="w-full text-left px-4 py-3 hover:bg-red-700 rounded-b-lg transition-colors flex items-center gap-3 text-red-400"
                            >
                                <Trash2 size={20} />
                                <span>채팅방 삭제</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {Object.entries(groupedMessages).map(([date, messages]) => (
                    <div key={date}>
                        {/* 날짜 구분선 */}
                        <div className="flex items-center justify-center my-4">
                            <span className="bg-gray-700 text-gray-400 text-xs px-3 py-1 rounded-full">{date}</span>
                        </div>

                        {messages.map((message, index) => {
                            const isCurrentUser = message.userId === currentUser.id;
                            // [수정] isFirstMessageOfDay 변수 사용 제거 (경고 해결)
                            // const isFirstMessageOfDay = index === 0 || !isSameDay(message.timestamp, messages[index - 1].timestamp);
                            const isNewUserMessage = index === 0 || message.userId !== messages[index - 1].userId || !isSameDay(message.timestamp, messages[index - 1].timestamp);

                            // 연속된 메시지 처리
                            const isContinuous = index > 0 && message.userId === messages[index - 1].userId && isSameDay(message.timestamp, messages[index - 1].timestamp);

                            return (
                                <div
                                    key={message.id}
                                    id={`message-${message.id}`} // 스크롤 이동을 위한 ID
                                    className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}
                                    onMouseEnter={() => setHoveredMessageId(message.id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-3/4 gap-2`}>

                                        {/* 아바타 (연속 메시지가 아닐 때만 표시) */}
                                        {!isCurrentUser && isNewUserMessage && (
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xl mt-1">
                                                {message.profileImage}
                                            </div>
                                        )}
                                        {!isCurrentUser && !isNewUserMessage && (
                                            <div className="w-8 h-8" /> // 공간 유지
                                        )}

                                        <div className="flex flex-col">
                                            {/* 사용자 이름 (연속 메시지가 아닐 때만 표시) */}
                                            {!isCurrentUser && isNewUserMessage && (
                                                <div className="text-sm text-gray-400 mb-1">{message.userName}</div>
                                            )}

                                            <div className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>

                                                {/* 메시지 내용 */}
                                                <div className={`relative p-3 rounded-xl max-w-full break-words ${
                                                    isCurrentUser
                                                        ? 'bg-blue-600 text-white rounded-br-none'
                                                        : 'bg-gray-700 text-white rounded-tl-none'
                                                }`}>

                                                    {/* 답장 대상 메시지 표시 */}
                                                    {message.replyTo && (
                                                        <div
                                                            onClick={() => scrollToMessage(message.replyTo.id)}
                                                            className="bg-gray-600 p-2 mb-2 rounded-lg border-l-4 border-blue-400 cursor-pointer hover:bg-gray-500 transition-colors"
                                                        >
                                                            <div className="text-xs text-blue-300 font-semibold">{message.replyTo.userName}에게 답장</div>
                                                            <div className="text-sm text-gray-300 truncate">{message.replyTo.content}</div>
                                                        </div>
                                                    )}

                                                    {message.content}

                                                    {/* 첨부 파일 표시 (더미) */}
                                                    {message.files && message.files.length > 0 && (
                                                        <div className="mt-2 space-y-2">
                                                            {message.files.map(file => (
                                                                <div key={file.id} className="flex items-center gap-2 bg-gray-600 p-2 rounded-lg">
                                                                    {file.type.startsWith('image/') ? <Image size={16} /> : <FileText size={16} />}
                                                                    <span className="text-sm flex-1 truncate">{file.name}</span>
                                                                    <button
                                                                        onClick={() => handleFileDownload(file.id, file.url, file.name)}
                                                                        className="text-blue-300 hover:text-blue-100"
                                                                    >
                                                                        <Download size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 타임스탬프 (호버 시 또는 마지막 메시지일 때만 표시) */}
                                                {(hoveredMessageId === message.id || !isContinuous) && (
                                                    <div className={`text-xs text-gray-500 ${isCurrentUser ? 'mr-1' : 'ml-1'}`}>
                                                        {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 댓글 표시 (원래 코드의 댓글 로직을 유지) */}
                                            {message.replies && message.replies.length > 0 && (
                                                <div className={`mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          <span className="text-xs text-gray-500 cursor-pointer hover:text-blue-400">
                            댓글 {message.replies.length}개
                          </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* 메시지 액션 버튼 (호버 시 표시) */}
                                        <div className="relative">
                                            {hoveredMessageId === message.id && (
                                                <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 ${isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'}`}>
                                                    {/* 답장 버튼 */}
                                                    <button
                                                        onClick={() => setReplyingToMessage(message)}
                                                        className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors text-gray-300"
                                                        title="답장하기"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                    {/* 메시지 삭제 버튼 (더미) */}
                                                    {isCurrentUser && (
                                                        <button
                                                            onClick={() => alert('메시지 삭제 (더미)')}
                                                            className="bg-gray-700 p-2 rounded-full hover:bg-red-600 transition-colors text-gray-300 hover:text-white"
                                                            title="삭제"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* 스크롤 위치를 잡기 위한 Ref */}
                        <div ref={messagesEndRef} />
                    </div>
                ))}
            </div>

            {/* 메시지 입력창 */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
                {/* 덧글 달기 표시 */}
                {replyingToMessage && (
                    <div className="mb-3 bg-gray-700 rounded-lg p-3 flex items-start justify-between">
                        <div className="flex-1">
                            <div className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                                <MessageCircle size={14} />
                                <span>{replyingToMessage.userName}님에게 답장</span>
                            </div>
                            <div
                                onClick={() => scrollToMessage(replyingToMessage.id)}
                                className="text-sm text-gray-300 cursor-pointer hover:text-blue-400 truncate"
                            >
                                {replyingToMessage.content.length > 50
                                    ? replyingToMessage.content.substring(0, 50) + '...'
                                    : replyingToMessage.content}
                            </div>
                        </div>
                        <button
                            onClick={() => setReplyingToMessage(null)}
                            className="text-gray-400 hover:text-white ml-2"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* 🚨 업로드 진행률 표시 영역 */}
                {uploadProgress > 0 && uploadProgress <= 100 && (
                    <div className="p-3">
                        <div className="text-xs text-blue-400 mb-2">
                            {uploadProgress < 100 ? '파일 업로드 중...' : '파일 업로드 완료!'}
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-right">{uploadProgress}%</div>
                    </div>
                )}

                {/* 🚨 [수정] 파일 업로드 버튼과 메시지 입력 필드를 하나의 Flex 컨테이너로 통합 */}
                <div className="flex items-center gap-2 p-1"> {/* p-1은 파일 진행률과의 간격 조정 */}
                    {/* 파일 업로드 버튼 */}
                    <label htmlFor="file-upload" className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors cursor-pointer">
                        <Paperclip size={20} />
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploadProgress > 0}
                        />
                    </label>

                    {/* 메시지 입력 필드 */}
                    <input
                        type="text"
                        placeholder={replyingToMessage ? "답장 입력" : "메시지 입력"}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={uploadProgress > 0} // 파일 업로드 중 입력 방지
                    />

                    {/* 전송 버튼 */}
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                        disabled={uploadProgress > 0} // 파일 업로드 중 전송 방지
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            {/* 멤버 초대 모달 */}
            {isInviteModalOpen && (
                <FriendSelectionModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    friendsList={friendsList} // 초대 가능한 친구 목록 전달
                    onConfirm={handleInviteFriends} // 선택된 ID를 처리하는 함수 전달
                    title="멤버 초대하기"
                    confirmLabel="초대하기"
                />
            )}

            {/* 채팅방 설정 모달 */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">채팅방 설정</h2>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">팀 채팅방 정보</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="thumbnailUpload"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                        className="hidden"
                                        disabled={!currentUser.isOwner}
                                    />
                                    <label
                                        htmlFor="thumbnailUpload"
                                        className={`w-20 h-20 bg-gray-600 rounded-lg flex items-center justify-center text-4xl overflow-hidden ${
                                            currentUser.isOwner ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed'
                                        }`}
                                    >
                                        {roomThumbnail.startsWith('data:') ? (
                                            <img src={roomThumbnail} alt="채팅방" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{roomThumbnail}</span>
                                        )}
                                        {currentUser.isOwner && (
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all">
                                                <Edit size={24} className="opacity-0 group-hover:opacity-100 text-white" />
                                            </div>
                                        )}
                                    </label>
                                </div>
                                <div className="flex-1">
                                    {isEditingRoomName ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={roomName}
                                                onChange={(e) => setRoomName(e.target.value)}
                                                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={handleUpdateRoomName}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                            >
                                                저장
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="text-white font-semibold">{roomName}</div>
                                            {currentUser.isOwner && (
                                                <button
                                                    onClick={() => setIsEditingRoomName(true)}
                                                    className="text-gray-400 hover:text-white p-1"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-400 mt-1">참여자 {participants.length + 1}명</div>
                                </div>
                            </div>
                            {!currentUser.isOwner && (
                                <div className="text-sm text-yellow-500 mt-2">※ 방장만 채팅방 정보를 수정할 수 있습니다.</div>
                            )}
                        </div>

                        <div className="border-t border-gray-700 pt-4">
                            <h3 className="text-lg font-semibold text-white mb-3">참여자 목록</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                                    <span className="text-2xl">{currentUser.profileImage}</span>
                                    <span className="text-white flex-1">{currentUser.name}</span>
                                    {currentUser.isOwner && <span className="text-xs bg-yellow-600 px-2 py-1 rounded">방장</span>}
                                </div>
                                {participants.map(participant => (
                                    <div key={participant.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                                        <span className="text-2xl">{participant.profileImage}</span>
                                        <span className="text-white flex-1">{participant.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 참여자 목록 모달 */}
            {isParticipantsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[600px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">참여자 ({participants.length + 1}명)</h2>
                            <button onClick={() => setIsParticipantsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                                    <span className="text-2xl">{currentUser.profileImage}</span>
                                    <span className="text-white flex-1">{currentUser.name}</span>
                                    {currentUser.isOwner && <span className="text-xs bg-yellow-600 px-2 py-1 rounded">방장</span>}
                                </div>
                                {participants.map(participant => (
                                    <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                                        <span className="text-2xl">{participant.profileImage}</span>
                                        <span className="text-white flex-1">{participant.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsParticipantsModalOpen(false);
                                setIsInviteModalOpen(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <UserPlus size={20} />
                            <span>멤버 초대하기</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 이미지 확대 모달 */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="확대 이미지"
                        className="max-w-[90%] max-h-[90%] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* 채팅방 서랍 모달 */}
            {isDrawerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-[800px] max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">채팅방 서랍</h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* 🚨 [수정] groupedChatFiles 데이터 사용 */}
                            {Object.keys(groupedChatFiles).length === 0 ? (
                                <div className="text-center text-gray-400 py-10">
                                    <Folder size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>공유된 파일이 없습니다</p>
                                </div>
                            ) : (
                                Object.entries(groupedChatFiles).map(([date, files]) => (
                                    <div key={date} className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-3">{date}</h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {files.map(file => (
                                                <div key={file.id} className="bg-gray-700 rounded-lg p-3 relative">

                                                    {/* 🚨 [수정] 파일 타입 검사 (목업 데이터 타입: image, video, pdf 등 사용) */}
                                                    {file.type === 'image' ? ( // Image check
                                                        <div
                                                            onClick={() => setSelectedImage(file.url)}
                                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                                        >
                                                            <img
                                                                src={file.url || "https://via.placeholder.com/150?text=Image"}
                                                                alt={file.name}
                                                                className="w-full h-32 object-cover rounded mb-2"
                                                            />
                                                            <div className="text-xs text-gray-300 truncate">{file.name}</div>
                                                        </div>
                                                    ) : file.type === 'video' ? ( // Video check
                                                        <div>
                                                            <div className="w-full h-32 bg-gray-600 rounded mb-2 flex items-center justify-center">
                                                                <Video size={40} className="text-blue-400" />
                                                            </div>
                                                            <div className="text-xs text-gray-300 truncate mb-2">{file.name}</div>
                                                            <button
                                                                onClick={() => handleFileDownload(file.id, file.url, file.name)}
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded transition-colors"
                                                                disabled={downloadProgress[file.id] > 0}
                                                            >
                                                                {downloadProgress[file.id] ? (
                                                                    downloadProgress[file.id] < 100 ? `${downloadProgress[file.id]}% 다운로드 중` : '완료'
                                                                ) : (
                                                                    <>
                                                                        <Download size={12} className="inline mr-1" />
                                                                        다운로드
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (file.type === 'pdf' || file.type === 'doc' || file.type === 'xlsx' || file.type === 'docx') ? ( // Document check
                                                        <div>
                                                            <div className="w-full h-32 bg-gray-600 rounded mb-2 flex items-center justify-center">
                                                                <FileText size={40} className="text-red-400" />
                                                            </div>
                                                            <div className="text-xs text-gray-300 truncate mb-2">{file.name}</div>
                                                            <button
                                                                onClick={() => handleFileDownload(file.id, file.url, file.name)}
                                                                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 rounded transition-colors"
                                                                disabled={downloadProgress[file.id] > 0}
                                                            >
                                                                {downloadProgress[file.id] ? (
                                                                    downloadProgress[file.id] < 100 ? `${downloadProgress[file.id]}% 다운로드 중` : '완료'
                                                                ) : (
                                                                    <>
                                                                        <Download size={12} className="inline mr-1" />
                                                                        다운로드
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 이미지 미리보기 모달 */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Preview" className="max-w-4/5 max-h-4/5 object-contain" onClick={e => e.stopPropagation()} />
                    <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white hover:text-gray-300"><X size={32} /></button>
                </div>
            )}
        </div>
    );
}