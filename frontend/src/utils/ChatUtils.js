export const handleChatRoomLeave = ({chatName, isOwner, participants, leaveCallback, currentUser}) => {
    if (!window.confirm(`정말 ${chatName} 채팅방을 나가시겠습니까?`)) {
        return; // 사용자가 취소함
    }

    if (isOwner && participants.length > 1) {
        // 방장이고 참여자가 남아있는 경우, 새 방장을 위임 (예: 이름순 첫 번째 참여자)
        const otherParticipants = participants.filter(p => p.id !== currentUser.id);
        const newOwner = otherParticipants.sort((a, b) => a.name.localeCompare(b.name, 'ko'))[0];

        if (newOwner) {
            alert(`${newOwner.name}님이 새로운 방장으로 위임되었습니다.`);
        }
    } else if (isOwner && participants.length === 1) {
        // 방장인데 혼자 나가는 경우 (방 폭파)
        alert(`채팅방(${chatName})이 폭파되었습니다.`);
    }

    // 목록에서 채팅방을 제거하거나 (ChatListApp), 페이지를 이동 (ChatRoom)하는 로직을 콜백으로 호출
    leaveCallback();
    alert(`'${chatName}' 채팅방에서 나갔습니다.`);
};
