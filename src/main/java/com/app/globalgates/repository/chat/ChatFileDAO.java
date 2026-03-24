package com.app.globalgates.repository.chat;

import com.app.globalgates.mapper.chat.ChatFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatFileDAO {
    private final ChatFileMapper chatFileMapper;

    public void save(Long fileId, Long messageId) {
        chatFileMapper.insert(fileId, messageId);
    }
}
