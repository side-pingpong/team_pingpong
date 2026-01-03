package com.team_pingpong.team_pingpong.controller;

import com.team_pingpong.team_pingpong.dto.ChatMessageDTO;
import com.team_pingpong.team_pingpong.service.ChatMessageService;
import com.team_pingpong.team_pingpong.service.RedisStreamProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * STOMP 메시지 컨트롤러
 *
 * 클라이언트가 메시지를 전송하면:
 * 1. 이 컨트롤러가 받음
 * 2. DB에 저장 (개발자 B의 API 호출)
 * 3. Redis Streams에 발행
 * 4. Consumer가 소비하여 STOMP 브로드캐스트
 *
 * 클라이언트 → 서버: /app/chat.sendMessage.{roomId}
 * 서버 → 클라이언트: /topic/room.{roomId}
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    private final RedisStreamProducer redisStreamProducer;

    /**
     * 메시지 전송 핸들러
     *
     * @MessageMapping: STOMP 메시지 라우팅
     * 클라이언트는 /app/chat.sendMessage.{roomId}로 전송
     */
    @MessageMapping("/chat.sendMessage.{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO message,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        try {
            // 세션에서 사용자 정보 추출
            String userId = (String) headerAccessor.getSessionAttributes().get("userId");
            message.setSenderId(userId);
            message.setRoomId(roomId);
            message.setTimestamp(LocalDateTime.now());
            message.setIsEdited(false);
            message.setIsDeleted(false);

            log.info("Received message from user {} in room {}", userId, roomId);

            // 1. DB에 메시지 저장 (개발자 B의 서비스 호출)
            ChatMessageDTO savedMessage = chatMessageService.saveMessage(message);

            // 2. Redis Streams에 발행 → Consumer가 브로드캐스트
            redisStreamProducer.publishMessage(savedMessage);

        } catch (Exception e) {
            log.error("Failed to send message", e);
            // 에러 메시지를 클라이언트에게 전송
            // messagingTemplate.convertAndSendToUser(userId, "/queue/errors", errorMessage);
        }
    }

    /**
     * 메시지 수정 핸들러
     */
    @MessageMapping("/chat.editMessage.{roomId}")
    public void editMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO message,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        try {
            String userId = (String) headerAccessor.getSessionAttributes().get("userId");

            // 권한 확인 (본인 메시지만 수정 가능)
            if (!message.getSenderId().equals(userId)) {
                log.warn("Unauthorized edit attempt by user {}", userId);
                return;
            }

            // 메시지 수정
            message.setIsEdited(true);
            ChatMessageDTO updatedMessage = chatMessageService.updateMessage(message);

            // Redis Streams 발행
            redisStreamProducer.publishMessage(updatedMessage);

        } catch (Exception e) {
            log.error("Failed to edit message", e);
        }
    }

    /**
     * 메시지 삭제 핸들러
     */
    @MessageMapping("/chat.deleteMessage.{roomId}")
    public void deleteMessage(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        try {
            String userId = (String) headerAccessor.getSessionAttributes().get("userId");
            Long messageId = Long.valueOf(payload.get("messageId").toString());

            // 메시지 삭제 (논리 삭제)
            ChatMessageDTO deletedMessage = chatMessageService.deleteMessage(messageId, userId);
            deletedMessage.setContent("삭제된 메시지입니다");
            deletedMessage.setType(ChatMessageDTO.MessageType.DELETED);

            // Redis Streams 발행
            redisStreamProducer.publishMessage(deletedMessage);

        } catch (Exception e) {
            log.error("Failed to delete message", e);
        }
    }

    /**
     * 읽음 표시 핸들러
     */
    @MessageMapping("/chat.markAsRead.{roomId}")
    public void markAsRead(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        try {
            String userId = (String) headerAccessor.getSessionAttributes().get("userId");
            Long messageId = Long.valueOf(payload.get("messageId").toString());

            // 읽음 처리
            chatMessageService.markAsRead(roomId, userId, messageId);

            // 읽음 이벤트 발행 (읽지 않은 수 갱신)
            redisStreamProducer.publishRoomEvent(roomId, "MESSAGE_READ", Map.of(
                    "userId", userId,
                    "messageId", messageId
            ));

        } catch (Exception e) {
            log.error("Failed to mark message as read", e);
        }
    }

    /**
     * 타이핑 중 표시
     */
    @MessageMapping("/chat.typing.{roomId}")
    public void typing(
            @DestinationVariable String roomId,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        String userId = (String) headerAccessor.getSessionAttributes().get("userId");

        // 타이핑 이벤트 발행 (DB 저장 없이 즉시 브로드캐스트)
        redisStreamProducer.publishRoomEvent(roomId, "USER_TYPING", Map.of(
                "userId", userId,
                "timestamp", LocalDateTime.now()
        ));
    }
}
