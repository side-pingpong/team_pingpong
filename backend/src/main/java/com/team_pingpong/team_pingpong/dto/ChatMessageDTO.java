package com.team_pingpong.team_pingpong.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 DTO
 * Redis Streams와 STOMP 메시지 전송에 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {

    private Long id;                    // 메시지 ID (DB PK)
    private String roomId;              // 채팅방 ID
    private String senderId;            // 발신자 ID
    private String senderName;          // 발신자 이름
    private String senderProfileImage;  // 발신자 프로필 이미지

    private MessageType type;           // 메시지 타입
    private String content;             // 메시지 내용
    private String fileUrl;             // 파일/이미지 URL (선택)

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;    // 전송 시간

    private Integer readCount;          // 읽지 않은 사용자 수
    private Boolean isEdited;           // 수정 여부
    private Boolean isDeleted;          // 삭제 여부

    // 답장 기능
    private Long replyToMessageId;      // 답장 대상 메시지 ID
    private String replyToContent;      // 답장 대상 메시지 내용 (미리보기)

    // 멘션 기능
    private String[] mentionedUserIds;  // 멘션된 사용자 ID 목록

    /**
     * 메시지 타입 정의
     */
    public enum MessageType {
        TEXT,           // 일반 텍스트
        IMAGE,          // 이미지
        FILE,           // 파일
        LINK,           // 링크
        SYSTEM,         // 시스템 메시지 (입장/퇴장)
        DELETED,        // 삭제된 메시지
        SCHEDULED       // 예약 메시지
    }

    /**
     * 시스템 메시지 생성 헬퍼
     */
    public static ChatMessageDTO createSystemMessage(String roomId, String content) {
        return ChatMessageDTO.builder()
                .roomId(roomId)
                .type(MessageType.SYSTEM)
                .content(content)
                .timestamp(LocalDateTime.now())
                .isEdited(false)
                .isDeleted(false)
                .build();
    }
}