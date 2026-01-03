package com.team_pingpong.team_pingpong.service;

import com.team_pingpong.team_pingpong.dto.ChatMessageDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Redis Streams Producer
 *
 * 역할: 메시지를 Redis Streams에 발행
 *
 * 왜 Producer/Consumer 패턴인가?
 * 1. 메시지 전송과 저장을 비동기로 분리
 * 2. DB 저장 실패해도 메시지는 Stream에 보관됨 (재처리 가능)
 * 3. 다중 서버 환경에서 하나의 Consumer만 처리 (중복 방지)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStreamProducer {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Stream Key 생성 전략
     * stream:chat:{roomId} 형태로 채팅방별로 분리
     */
    private String getStreamKey(String roomId) {
        return "stream:chat:" + roomId;
    }

    /**
     * 메시지를 Redis Streams에 발행
     *
     * @param message 전송할 메시지
     * @return RecordId (메시지 고유 ID)
     */
    public RecordId publishMessage(ChatMessageDTO message) {
        try {
            String streamKey = getStreamKey(message.getRoomId());

            // ObjectRecord 생성
            ObjectRecord<String, ChatMessageDTO> record = StreamRecords
                    .newRecord()
                    .ofObject(message)
                    .withStreamKey(streamKey);

            // Redis Streams에 추가
            RecordId recordId = redisTemplate.opsForStream().add(record);

            log.info("Message published to stream: {} with ID: {}", streamKey, recordId);
            return recordId;

        } catch (Exception e) {
            log.error("Failed to publish message to Redis Streams", e);
            throw new RuntimeException("Message publish failed", e);
        }
    }

    /**
     * 채팅방 이벤트 발행 (참여자 변경, 설정 변경 등)
     *
     * @param roomId 채팅방 ID
     * @param eventType 이벤트 타입
     * @param eventData 이벤트 데이터
     */
    public RecordId publishRoomEvent(String roomId, String eventType, Object eventData) {
        try {
            String streamKey = getStreamKey(roomId);

            RoomEventDTO event = RoomEventDTO.builder()
                    .roomId(roomId)
                    .eventType(eventType)
                    .eventData(eventData)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();

            ObjectRecord<String, RoomEventDTO> record = StreamRecords
                    .newRecord()
                    .ofObject(event)
                    .withStreamKey(streamKey);

            RecordId recordId = redisTemplate.opsForStream().add(record);

            log.info("Room event published: {} - {}", roomId, eventType);
            return recordId;

        } catch (Exception e) {
            log.error("Failed to publish room event", e);
            throw new RuntimeException("Room event publish failed", e);
        }
    }
}

/**
 * 채팅방 이벤트 DTO
 */
@lombok.Getter
@lombok.Setter
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
@lombok.Builder
class RoomEventDTO {
    private String roomId;
    private String eventType;  // USER_JOINED, USER_LEFT, ROOM_UPDATED, etc.
    private Object eventData;
    private java.time.LocalDateTime timestamp;
}