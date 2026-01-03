package com.team_pingpong.team_pingpong.service;

import com.team_pingpong.team_pingpong.dto.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 채팅 메시지 서비스
 *
 * 개발자 A와 개발자 B의 협업 지점!
 *
 * 개발자 A (당신): Redis Streams, STOMP 담당
 * 개발자 B: PostgreSQL, JPA, 비즈니스 로직 담당
 *
 * 이 서비스는 개발자 B가 구현하지만,
 * 개발자 A가 호출하는 인터페이스를 정의합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageService {

    // 개발자 B가 구현할 Repository
    // private final ChatMessageRepository messageRepository;
    // private final ChatRoomRepository chatRoomRepository;
    // private final MessageReadRepository messageReadRepository;

    /**
     * 메시지 저장
     *
     * 개발자 B가 구현:
     * 1. ChatMessage 엔티티 생성
     * 2. DB INSERT
     * 3. 초기 readCount 계산 (채팅방 참여자 수 - 1)
     * 4. message_log 테이블에 로깅
     *
     * @return 저장된 메시지 (ID 포함)
     */
    @Transactional
    public ChatMessageDTO saveMessage(ChatMessageDTO message) {
        log.info("Saving message: {}", message);

        // TODO: 개발자 B가 구현
        // ChatMessage entity = messageMapper.toEntity(message);
        // entity = messageRepository.save(entity);
        // message.setId(entity.getId());
        // message.setReadCount(calculateInitialReadCount(message.getRoomId()));

        // 임시 구현 (개발 초기)
        message.setId(System.currentTimeMillis()); // 임시 ID
        message.setReadCount(1); // 임시 값

        return message;
    }

    /**
     * 메시지 수정
     *
     * 개발자 B가 구현:
     * 1. 메시지 조회
     * 2. 권한 확인 (senderId 일치)
     * 3. content 업데이트
     * 4. isEdited = true
     * 5. 수정 시간 기록
     */
    @Transactional
    public ChatMessageDTO updateMessage(ChatMessageDTO message) {
        log.info("Updating message: {}", message.getId());

        // TODO: 개발자 B가 구현
        // ChatMessage entity = messageRepository.findById(message.getId())
        //         .orElseThrow(() -> new MessageNotFoundException());
        // entity.updateContent(message.getContent());
        // return messageMapper.toDTO(entity);

        return message;
    }

    /**
     * 메시지 삭제 (논리 삭제)
     *
     * 개발자 B가 구현:
     * 1. 메시지 조회
     * 2. 권한 확인
     * 3. isDeleted = true
     * 4. content = "삭제된 메시지입니다"
     */
    @Transactional
    public ChatMessageDTO deleteMessage(Long messageId, String userId) {
        log.info("Deleting message: {}", messageId);

        // TODO: 개발자 B가 구현
        // ChatMessage entity = messageRepository.findById(messageId)
        //         .orElseThrow(() -> new MessageNotFoundException());
        // if (!entity.getSenderId().equals(userId)) {
        //     throw new UnauthorizedException();
        // }
        // entity.delete();
        // return messageMapper.toDTO(entity);

        ChatMessageDTO deleted = new ChatMessageDTO();
        deleted.setId(messageId);
        deleted.setIsDeleted(true);
        return deleted;
    }

    /**
     * 메시지 읽음 처리
     *
     * 개발자 B가 구현:
     * 1. message_read 테이블에 INSERT
     * 2. 해당 메시지의 readCount 감소
     * 3. 중복 읽음 방지 (UNIQUE 제약)
     */
    @Transactional
    public void markAsRead(String roomId, String userId, Long messageId) {
        log.info("Marking message {} as read by user {}", messageId, userId);

        // TODO: 개발자 B가 구현
        // MessageRead read = MessageRead.builder()
        //         .messageId(messageId)
        //         .userId(userId)
        //         .readAt(LocalDateTime.now())
        //         .build();
        // messageReadRepository.save(read);
        //
        // // readCount 감소
        // messageRepository.decrementReadCount(messageId);
    }

    /**
     * 채팅방의 미읽은 메시지 수 조회
     */
    public int getUnreadCount(String roomId, String userId) {
        // TODO: 개발자 B가 구현
        // return messageRepository.countUnreadMessages(roomId, userId);
        return 0;
    }

    /**
     * 초기 readCount 계산
     * 채팅방 참여자 수 - 1 (본인 제외)
     */
    private int calculateInitialReadCount(String roomId) {
        // TODO: 개발자 B가 구현
        // int participantCount = chatRoomRepository.countParticipants(roomId);
        // return participantCount - 1;
        return 1;
    }
}
