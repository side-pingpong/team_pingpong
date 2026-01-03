package com.team_pingpong.team_pingpong.service;

import com.team_pingpong.team_pingpong.dto.ChatMessageDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.util.Map;

/**
 * Redis Streams Consumer
 *
 * 핵심 역할:
 * 1. Redis Streams에서 메시지 소비
 * 2. STOMP를 통해 WebSocket 클라이언트에게 브로드캐스트
 * 3. ACK 처리로 메시지 유실 방지
 *
 * 이것이 개발자 A의 핵심 책임!
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStreamConsumer {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final StreamMessageListenerContainer<String, ObjectRecord<String, Object>> listenerContainer;

    @Value("${chat.redis.stream.consumer-group}")
    private String consumerGroup;

    @Value("${chat.redis.stream.consumer-name}")
    private String consumerName;

    /**
     * 애플리케이션 시작 시 Consumer 등록
     */
    @PostConstruct
    public void startConsuming() {
        log.info("Starting Redis Streams Consumer: {}", consumerName);

        // Consumer Group 생성 (이미 존재하면 무시)
        createConsumerGroupIfNotExists("stream:chat:*");

        // Listener 등록
        listenerContainer.start();

        // 모든 채팅방 stream을 소비하도록 설정
        // 실제로는 채팅방 생성 시 동적으로 등록하는 것이 좋음
        registerStreamListener("stream:chat:*");
    }

    /**
     * Consumer Group 생성
     */
    private void createConsumerGroupIfNotExists(String streamKey) {
        try {
            // "0-0"부터 소비 시작 (기존 메시지 포함)
            // ">"로 변경하면 신규 메시지만 소비
            redisTemplate.opsForStream()
                    .createGroup(streamKey, ReadOffset.from("0-0"), consumerGroup);
            log.info("Consumer group created: {}", consumerGroup);
        } catch (Exception e) {
            // 이미 존재하는 경우 무시
            log.debug("Consumer group already exists: {}", consumerGroup);
        }
    }

    /**
     * Stream Listener 등록
     */
    private void registerStreamListener(String streamKey) {
        Consumer consumer = Consumer.from(consumerGroup, consumerName);

        StreamOffset<String> streamOffset = StreamOffset.create(streamKey, ReadOffset.lastConsumed());

        listenerContainer.register(
                StreamMessageListenerContainer.StreamReadRequest.builder(streamOffset)
                        .consumer(consumer)
                        .autoAcknowledge(false)  // 수동 ACK (중요!)
                        .cancelOnError(e -> false)  // 에러 발생해도 계속 진행
                        .build(),
                this::handleMessage
        );

        log.info("Stream listener registered for: {}", streamKey);
    }

    /**
     * 메시지 처리 핸들러
     *
     * 이 메서드가 Redis Streams → STOMP 브로드캐스트의 핵심!
     */
    private void handleMessage(ObjectRecord<String, Object> record) {
        try {
            String streamKey = record.getStream();
            RecordId recordId = record.getId();
            Map<String, Object> value = (Map<String, Object>) record.getValue();

            log.debug("Processing message from stream: {} with ID: {}", streamKey, recordId);

            // 메시지 타입 확인
            if (value.containsKey("content") && value.containsKey("senderId")) {
                // 채팅 메시지 처리
                ChatMessageDTO message = objectMapper.convertValue(value, ChatMessageDTO.class);
                broadcastChatMessage(message);
            } else if (value.containsKey("eventType")) {
                // 채팅방 이벤트 처리
                broadcastRoomEvent(streamKey, value);
            }

            // ACK 전송 (메시지 처리 완료)
            redisTemplate.opsForStream().acknowledge(consumerGroup, record);
            log.debug("Message acknowledged: {}", recordId);

        } catch (Exception e) {
            log.error("Failed to process message from stream", e);
            // 실패한 메시지는 Pending Entries List에 남아있어 재처리 가능
        }
    }

    /**
     * 채팅 메시지를 STOMP를 통해 브로드캐스트
     *
     * 클라이언트는 /topic/room.{roomId}를 구독
     */
    private void broadcastChatMessage(ChatMessageDTO message) {
        String destination = "/topic/room." + message.getRoomId();
        messagingTemplate.convertAndSend(destination, message);
        log.info("Message broadcasted to: {} - {}", destination, message.getId());
    }

    /**
     * 채팅방 이벤트를 STOMP를 통해 브로드캐스트
     *
     * 참여자 변경, 설정 변경 등
     */
    private void broadcastRoomEvent(String streamKey, Map<String, Object> event) {
        String roomId = extractRoomIdFromStreamKey(streamKey);
        String destination = "/topic/room." + roomId + ".events";
        messagingTemplate.convertAndSend(destination, event);
        log.info("Room event broadcasted to: {}", destination);
    }

    /**
     * Stream Key에서 Room ID 추출
     * stream:chat:{roomId} → {roomId}
     */
    private String extractRoomIdFromStreamKey(String streamKey) {
        String[] parts = streamKey.split(":");
        return parts.length > 2 ? parts[2] : "";
    }

    /**
     * 애플리케이션 종료 시 리스너 정리
     */
    @PreDestroy
    public void stopConsuming() {
        log.info("Stopping Redis Streams Consumer");
        listenerContainer.stop();
    }

    /**
     * Pending 메시지 재처리 (장애 복구용)
     *
     * 주기적으로 호출하여 미처리된 메시지를 다시 처리
     */
    public void reprocessPendingMessages(String streamKey) {
        try {
            PendingMessagesSummary summary = redisTemplate.opsForStream()
                    .pending(streamKey, consumerGroup);

            if (summary.getTotalPendingMessages() > 0) {
                log.warn("Found {} pending messages in stream: {}",
                        summary.getTotalPendingMessages(), streamKey);

                // Pending 메시지 조회 및 재처리
                PendingMessages pending = redisTemplate.opsForStream()
                        .pending(streamKey,
                                Consumer.from(consumerGroup, consumerName),
                                Range.unbounded(),
                                10L);

                // 실제 재처리 로직 구현
                // XCLAIM 명령어로 소유권 가져와서 처리
            }
        } catch (Exception e) {
            log.error("Failed to reprocess pending messages", e);
        }
    }
}