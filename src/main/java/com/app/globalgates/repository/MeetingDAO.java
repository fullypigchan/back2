package com.app.globalgates.repository;

import com.app.globalgates.domain.MeetingVO;
import com.app.globalgates.dto.MeetingDTO;
import com.app.globalgates.mapper.MeetingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MeetingDAO {
    private final MeetingMapper meetingMapper;

    // 회의 등록
    public void save(MeetingVO meetingVO) {
        meetingMapper.insert(meetingVO);
    }

    // 멤버 id로 회의 목록 조회
    public List<MeetingDTO> getMeeting(Long requesterId) {
        return meetingMapper.selectByMemberId(requesterId);
    }

    // 회의 내용 업데이트
    public void update(MeetingVO meetingVO) {
        meetingMapper.update(meetingVO);
    }
}
