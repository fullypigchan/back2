package com.app.globalgates.task;

import com.app.globalgates.repository.chat.ChatMessageDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DisappearMessageTask {
    private final ChatMessageDAO chatMessageDAO;

    // 매 20초마다 실행 - 사라진 메시지 설정에 따라 만료된 메시지 soft delete
    @Scheduled(cron = "0/20 * * * * ?")
    public void deleteExpiredMessages() {
        List<Map<String, Object>> settings = chatMessageDAO.findActiveDisappearSettings();
        if (settings.isEmpty()) return;

        log.info("[사라진 메시지] 활성 설정 {}건 처리 시작", settings.size());
        int totalDeleted = 0;

        for (Map<String, Object> setting : settings) {
            Long conversationId = ((Number) setting.get("conversationid")).longValue();
            String disappearMessage = (String) setting.get("disappearmessage");
            java.sql.Timestamp activatedTs = (java.sql.Timestamp) setting.get("settingactivatedat");
            LocalDateTime settingActivatedAt = activatedTs != null ? activatedTs.toLocalDateTime() : LocalDateTime.now();

            LocalDateTime cutoff = calculateCutoff(disappearMessage);
            if (cutoff == null) {
                log.warn("[사라진 메시지] 알 수 없는 설정값: {}", disappearMessage);
                continue;
            }

            int deleted = chatMessageDAO.softDeleteExpiredMessages(conversationId, settingActivatedAt, cutoff);
            if (deleted > 0) {
                log.info("[사라진 메시지] conversationId: {}, 설정: {}, 삭제: {}건", conversationId, disappearMessage, deleted);
                totalDeleted += deleted;
            }
        }

        if (totalDeleted > 0) {
            log.info("[사라진 메시지] 총 {}건 삭제 완료", totalDeleted);
        }
    }

    private LocalDateTime calculateCutoff(String setting) {
        LocalDateTime now = LocalDateTime.now();
        return switch (setting) {
            case "5분" -> now.minusMinutes(5);
            case "1 시간" -> now.minusHours(1);
            case "8 시간" -> now.minusHours(8);
            case "1 일" -> now.minusDays(1);
            case "1 주" -> now.minusWeeks(1);
            case "4 주" -> now.minusWeeks(4);
            default -> null;
        };
    }
}
