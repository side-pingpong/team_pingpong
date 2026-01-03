package com.team_pingpong.team_pingpong.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * 사용자 접속 상태 관리 서비스
 *
 * Redis 자료구조:
 * - user:presence:{userId} → "online" | "offline"
 * - user:sessions:{userId} → Set<sessionId> (한 유저가 여러 기기 접속 가능)
 *
 * TTL 설정으로 자동 정리 (네트워크 끊김 대응)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserPresenceService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String PRESENCE_KEY_PREFIX = "user:presence:";
    private static final String SESSIONS_KEY_PREFIX = "user:sessions:";
    private static final long PRESENCE_TTL_SECONDS = 300; // 5분

    /**
     * 사용자 온라인 상태로 설정
     */
    public void setUserOnline(String userId, String sessionId) {
        try {
            String presenceKey = PRESENCE_KEY_PREFIX + userId;
            String sessionsKey = SESSIONS_KEY_PREFIX + userId;

            // 1. 접속 상태를 "online"으로 설정
            redisTemplate.opsForValue().set(presenceKey, "online",
                    PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);

            // 2. 세션 ID 추가
            redisTemplate.opsForSet().add(sessionsKey, sessionId);
            redisTemplate.expire(sessionsKey, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);

            // 3. 온라인 상태 브로드캐스트
            broadcastPresenceUpdate(userId, "online");

            log.info("User {} is now online (session: {})", userId, sessionId);

        } catch (Exception e) {
            log.error("Failed to set user online", e);
        }
    }

    /**
     * 사용자 오프라인 상태로 설정
     */
    public void setUserOffline(String userId, String sessionId) {
        try {
            String presenceKey = PRESENCE_KEY_PREFIX + userId;
            String sessionsKey = SESSIONS_KEY_PREFIX + userId;

            // 1. 세션 제거
            redisTemplate.opsForSet().remove(sessionsKey, sessionId);

            // 2. 남은 세션 확인
            Long remainingSessions = redisTemplate.opsForSet().size(sessionsKey);

            // 3. 모든 세션이 종료되면 오프라인 처리
            if (remainingSessions == null || remainingSessions == 0) {
                redisTemplate.opsForValue().set(presenceKey, "offline",
                        Duration.ofHours(24)); // 오프라인 상태는 24시간 유지

                broadcastPresenceUpdate(userId, "offline");
                log.info("User {} is now offline", userId);
            } else {
                log.info("User {} still has {} active sessions", userId, remainingSessions);
            }

        } catch (Exception e) {
            log.error("Failed to set user offline", e);
        }
    }

    /**
     * 사용자 접속 상태 조회
     */
    public String getUserPresence(String userId) {
        String presenceKey = PRESENCE_KEY_PREFIX + userId;
        String status = (String) redisTemplate.opsForValue().get(presenceKey);
        return status != null ? status : "offline";
    }

    /**
     * 여러 사용자의 접속 상태 조회
     */
    public Map<String, String> getMultipleUserPresence(List<String> userIds) {
        Map<String, String> presenceMap = new HashMap<>();

        for (String userId : userIds) {
            presenceMap.put(userId, getUserPresence(userId));
        }

        return presenceMap;
    }

    /**
     * 온라인 사용자 목록 조회
     *
     * 참고: 실제 프로덕션에서는 Redis SCAN을 사용하여
     * 대용량 키 조회 시 성능 이슈 방지
     */
    public Set<String> getOnlineUsers() {
        Set<String> onlineUsers = new HashSet<>();

        Set<String> keys = redisTemplate.keys(PRESENCE_KEY_PREFIX + "*");
        if (keys != null) {
            for (String key : keys) {
                String status = (String) redisTemplate.opsForValue().get(key);
                if ("online".equals(status)) {
                    String userId = key.replace(PRESENCE_KEY_PREFIX, "");
                    onlineUsers.add(userId);
                }
            }
        }

        return onlineUsers;
    }

    /**
     * 접속 상태 변경 브로드캐스트
     *
     * 모든 클라이언트가 /topic/user.presence를 구독하여
     * 실시간으로 접속 상태 업데이트 받음
     */
    private void broadcastPresenceUpdate(String userId, String status) {
        Map<String, Object> presenceUpdate = Map.of(
                "userId", userId,
                "status", status,
                "timestamp", System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend("/topic/user.presence", presenceUpdate);
    }

    /**
     * Heartbeat 갱신 (클라이언트가 주기적으로 호출)
     *
     * TTL 갱신으로 네트워크 일시 단절 대응
     */
    public void refreshPresence(String userId) {
        String presenceKey = PRESENCE_KEY_PREFIX + userId;
        String sessionsKey = SESSIONS_KEY_PREFIX + userId;

        // TTL 갱신
        redisTemplate.expire(presenceKey, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
        redisTemplate.expire(sessionsKey, PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
    }
}