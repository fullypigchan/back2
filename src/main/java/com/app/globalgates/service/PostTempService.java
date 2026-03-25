package com.app.globalgates.service;

import com.app.globalgates.dto.PostTempDTO;
import com.app.globalgates.repository.PostTempDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PostTempService {
    private final PostTempDAO postTempDAO;

//    임시저장 저장
    public void savePostTemp(PostTempDTO postTempDTO) {
        postTempDAO.save(postTempDTO);
    }

//    임시저장 목록 조회
    public List<PostTempDTO> getPostTemps(Long memberId) {
        return postTempDAO.findAllByMemberId(memberId);
    }

//    임시저장 불러오기 (조회 후 삭제)
    public PostTempDTO loadPostTemp(Long id) {
        PostTempDTO postTempDTO = postTempDAO.findById(id).orElseThrow();
        postTempDAO.delete(id);
        return postTempDTO;
    }

//    임시저장 개별 삭제
    public void deletePostTemp(Long id) {
        postTempDAO.delete(id);
    }

//    임시저장 선택 삭제
    public void deletePostTemps(List<Long> ids) {
        ids.forEach(postTempDAO::delete);
    }

//    임시저장 전체 삭제
    public void deleteAllPostTemps(Long memberId) {
        postTempDAO.deleteAllByMemberId(memberId);
    }
}
