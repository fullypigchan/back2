
package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.exception.PostNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.common.enumeration.NotificationType;
import com.app.globalgates.domain.PostFileVO;
import com.app.globalgates.dto.*;
import com.app.globalgates.repository.*;
import com.app.globalgates.mapper.MemberMapper;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PostService {
    private final PostDAO postDAO;
    private final PostFileDAO postFileDAO;
    private final FileDAO fileDAO;
    private final PostHashtagDAO postHashtagDAO;
    private final S3Service s3Service;
    private final MentionDAO mentionDAO;
    private final MemberMapper memberMapper;
    private final NotificationService notificationService;

//    게시글 작성
    @CacheEvict(value = {"post:list", "post", "page:search", "community:post:list"}, allEntries = true)
    public void writePost(PostDTO postDTO, List<MultipartFile> files) {
        postDAO.save(postDTO);

        //    태그 저장 (없으면 생성, 있으면 기존꺼 쓰기)
        postDTO.getHashtags().forEach(hashtagDTO -> {
            Optional<PostHashtagDTO> foundHashtag = postHashtagDAO.findByTagName(hashtagDTO.getTagName());

            if (foundHashtag.isEmpty()) {
                log.info("새로운태그인식함 {}", foundHashtag);
                postHashtagDAO.save(hashtagDTO);
                log.info("새로운태그들어감 {}", foundHashtag);
            } else {
                hashtagDTO.setId(foundHashtag.get().getId());
                log.info("기존태그에요 {}", foundHashtag);
            };

            postHashtagDAO.saveRel(postDTO.getId(), hashtagDTO.getId());
        });
    }

//    게시글 파일 저장 (S3 키 기반)
    public void saveFile(Long postId, MultipartFile file, String s3Key) {
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(file.getOriginalFilename());
        fileDTO.setFileName(s3Key.substring(s3Key.lastIndexOf("/") + 1));
        fileDTO.setFilePath(s3Key);
        fileDTO.setFileSize(file.getSize());
        fileDTO.setContentType(file.getContentType().contains("image") ? FileContentType.IMAGE
                : file.getContentType().contains("video")
                ? FileContentType.VIDEO : FileContentType.ETC);
        fileDAO.save(fileDTO);

        PostFileDTO postFileDTO = new PostFileDTO();
        postFileDTO.setFileId(fileDTO.getId());
        postFileDTO.setPostId(postId);
        postFileDAO.save(postFileDTO.toPostFileVO());
    }

    //    게시글 목록 조회
    @Cacheable(value="post:list", key="'feed:page:' + #page + ':memberId:' + #memberId")
    public PostWithPagingDTO getList(int page, Long memberId) {
        Criteria criteria = new Criteria(page, postDAO.findTotal());
        List<PostDTO> posts = postDAO.findAll(criteria, memberId);

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        if (criteria.isHasMore()) posts.remove(posts.size() - 1);

        posts.forEach(postDTO -> {
            postDTO.setHashtags(postHashtagDAO.findAllByPostId(postDTO.getId()));
            postDTO.setPostFiles(postFileDAO.findAllByPostId(postDTO.getId()));
            List<String> fileUrls = postDTO.getPostFiles().stream()
                    .map(PostFileDTO::getFilePath)
                    .collect(Collectors.toList());
            postDTO.setFileUrls(fileUrls);
        });

        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        postWithPagingDTO.setPosts(posts);
        postWithPagingDTO.setCriteria(criteria);
        return postWithPagingDTO;
    }

    // 마이페이지 "게시물" 탭은 메인 피드와 다르게
    // 1. 작성자가 현재 로그인 사용자 본인이고
    // 2. active 상태이며
    // 3. 댓글이 아니고
    // 4. 상품 게시글(tbl_post_product)은 아닌
    // 일반 게시글만 조회해야 한다.
    // 페이징 규칙은 기존 내 상품 목록과 동일하게 rowCount + 1개를 먼저 조회한 뒤
    // 마지막 1개로 hasMore 여부만 판단한다.
    @Cacheable(value="post:list", key="'mypage:page:' + #page + ':memberId:' + #memberId")
    public PostWithPagingDTO getMyPosts(int page, Long memberId) {
        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        Criteria criteria = new Criteria(page, postDAO.findTotalByMemberId(memberId));

        List<PostDTO> posts = postDAO.findAllByMemberId(criteria, memberId).stream()
                .map(postDTO -> {
                    List<PostFileDTO> files = new ArrayList<>(postFileDAO.findAllByPostId(postDTO.getId()));
                    if (!files.isEmpty()) {
                        postDTO.setPostFiles(files);
                        postDTO.setFileUrls(
                                files.stream()
                                        .map(PostFileDTO::getFilePath)
                                        .collect(Collectors.toList())
                        );
                    }
                    postDTO.setHashtags(postHashtagDAO.findAllByPostId(postDTO.getId()));
                    return postDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        postWithPagingDTO.setCriteria(criteria);

        if (criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        posts.forEach(post -> post.setCreatedDatetime(DateUtils.toRelativeTime(post.getCreatedDatetime())));
        postWithPagingDTO.setPosts(posts);
        return postWithPagingDTO;
    }

    // 마이페이지 Likes 탭은 "현재 로그인 사용자가 좋아요한 일반 게시글"만 보여준다.
    // Posts 탭과 같은 PostDTO / PostWithPagingDTO 구조를 재사용하면,
    // 카드 렌더링, 이미지 첨부파일, 해시태그, 카운트 표시 로직을 새로 만들 필요가 없다.
    // 조회 기준은 다음과 같다:
    // 1. 좋아요 관계(tbl_post_like)가 존재해야 한다.
    // 2. 게시글은 active 상태여야 한다.
    // 3. 댓글(reply)은 제외한다.
    // 4. 상품 게시글(tbl_post_product)은 제외한다.
    //
    // 페이징은 기존 mypage Posts / MyProducts와 동일하게 rowCount + 1개를 먼저 조회한 뒤
    // 마지막 1개로 hasMore 여부만 판단한다.
    @Cacheable(value="post:list", key="'liked:page:' + #page + ':memberId:' + #memberId")
    public PostWithPagingDTO getMyLikedPosts(int page, Long memberId) {
        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        Criteria criteria = new Criteria(page, postDAO.findLikedPostTotalByMemberId(memberId));

        List<PostDTO> posts = postDAO.findLikedPostsByMemberId(criteria, memberId).stream()
                .map(postDTO -> {
                    List<PostFileDTO> files = new ArrayList<>(postFileDAO.findAllByPostId(postDTO.getId()));
                    if (!files.isEmpty()) {
                        postDTO.setPostFiles(files);
                        postDTO.setFileUrls(
                                files.stream()
                                        .map(PostFileDTO::getFilePath)
                                        .collect(Collectors.toList())
                        );
                    }
                    postDTO.setHashtags(postHashtagDAO.findAllByPostId(postDTO.getId()));
                    return postDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        postWithPagingDTO.setCriteria(criteria);

        if (criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        posts.forEach(post -> post.setCreatedDatetime(DateUtils.toRelativeTime(post.getCreatedDatetime())));
        postWithPagingDTO.setPosts(posts);
        return postWithPagingDTO;
    }

    // 마이페이지 Replies 탭은 "내가 작성한 댓글"만 보여준다.
    // Posts / Likes와 같은 PostWithPagingDTO를 재사용해서
    // 카드 렌더링과 무한 페이징 구조를 그대로 가져간다.
    @Cacheable(value="post:list", key="'reply:page:' + #page + ':memberId:' + #memberId")
    public PostWithPagingDTO getMyReplies(int page, Long memberId) {
        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        Criteria criteria = new Criteria(page, postDAO.findReplyTotalByMemberId(memberId));

        List<PostDTO> posts = postDAO.findRepliesWrittenByMemberId(criteria, memberId).stream()
                .map(postDTO -> {
                    List<PostFileDTO> files = new ArrayList<>(postFileDAO.findAllByPostId(postDTO.getId()));
                    if (!files.isEmpty()) {
                        postDTO.setPostFiles(files);
                        postDTO.setFileUrls(
                                files.stream()
                                        .map(PostFileDTO::getFilePath)
                                        .collect(Collectors.toList())
                        );
                    }
                    postDTO.setHashtags(postHashtagDAO.findAllByPostId(postDTO.getId()));
                    return postDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        postWithPagingDTO.setCriteria(criteria);

        if (criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        posts.forEach(post -> post.setCreatedDatetime(DateUtils.toRelativeTime(post.getCreatedDatetime())));
        postWithPagingDTO.setPosts(posts);
        return postWithPagingDTO;
    }

    // 마이페이지 헤더의 "게시물 수"는 목록과 같은 기준으로 보여줘야 한다.
    // 즉 현재 로그인 사용자의 active 상태 일반 게시글 개수만 반환하고,
    // 댓글이나 상품 게시글은 기존 selectTotalByMemberId 쿼리 조건에 따라 제외한다.
    // count 전용 메서드를 분리해 두면 템플릿 진입 시 목록 1페이지를 억지로 조회하지 않아도 된다.
    public int getMyPostCount(Long memberId) {
        return postDAO.findTotalByMemberId(memberId);
    }

    //    게시글 단건 조회
    @Cacheable(value="post", key="'id:' + #id + ':memberId:' + #memberId")
    public PostDTO getDetail(Long id, Long memberId) {
        postDAO.updateReadCount(id);
        PostDTO postDTO = postDAO.findById(id, memberId)
                .orElseThrow(PostNotFoundException::new);

        postDTO.setHashtags(postHashtagDAO.findAllByPostId(id));
        postDTO.setPostFiles(postFileDAO.findAllByPostId(id));
        return postDTO;
    }

    //    게시글 수정
    @CacheEvict(value = {"post:list", "post", "page:search", "community:post:list"}, allEntries = true)
    public void update(PostDTO postDTO) {
        postDAO.setPost(postDTO.toPostVO());

        //    태그 수정 (원래 묶인 관계 삭제하고 저장)
        postHashtagDAO.deleteRelByPostId(postDTO.getId());
        postDTO.getHashtags().forEach(hashtagDTO -> {
            postHashtagDAO.save(hashtagDTO);
            if (hashtagDTO.getId() == null) {
                hashtagDTO.setId(postHashtagDAO.findByTagName(hashtagDTO.getTagName())
                        .orElseThrow().getId());
            }
            postHashtagDAO.saveRel(postDTO.getId(), hashtagDTO.getId());
        });

        //    기존 파일 삭제 (S3 + DB)
        if (postDTO.getFileIdsToDelete() != null) {
            Arrays.stream(postDTO.getFileIdsToDelete()).forEach(fileId -> {
                fileDAO.findById(Long.valueOf(fileId)).ifPresent(fileVO -> {
                    s3Service.deleteFile(fileVO.getFilePath());
                });
                postFileDAO.delete(Long.valueOf(fileId));
                fileDAO.delete(Long.valueOf(fileId));
            });
        }
    }

    // 인기순, 최신순 게시글 목록 조회
    @Cacheable(value="page:search", key="'page:' + #page" +
            " + ':memberId:' + (#search.memberId)" +
            " + ':keyword:' + (#search.keyword ?: '')" +
            " + ':filter:' + (#search.type ?: 'all')")
    @LogStatusWithReturn
    public PostWithPagingDTO getListBySearch(int page, PostSearch search) {
        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        Criteria criteria = new Criteria(page, postDAO.findSearchTotal(search));

        // 이미지 불러오기
        List<PostDTO> posts = postDAO.findBySearch(criteria, search).stream()
                .map(postDTO -> {
                    List<PostFileDTO> images = new ArrayList<>(postFileDAO.findAllByPostId(postDTO.getId()));
                    if(!images.isEmpty()) {
                        postDTO.setPostFiles(images);
                        List<String> fileUrls = images.stream()
                                .map(PostFileDTO::getFilePath)
                                .collect(Collectors.toList());
                        postDTO.setFileUrls(fileUrls);
                    }
                    return postDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        postWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        for (PostDTO post: posts) {
            post.setCreatedDatetime(DateUtils.toRelativeTime(post.getCreatedDatetime()));
        };
        postWithPagingDTO.setPosts(posts);

        return postWithPagingDTO;
    }

    //    게시글 삭제 = 상태 inactive로.
    @CacheEvict(value = {"post:list", "post", "page:search", "community:post:list"}, allEntries = true)
    public void delete(Long id) {
        postDAO.delete(id);
    }

//    댓글 작성
    @CacheEvict(value = {"post:list", "post", "page:search", "community:post:list"}, allEntries = true)
    public void writeReply(PostDTO postDTO) {
        log.info("writeReply 들어옴1 memberId: {}, content: {}", postDTO.getMemberId(), postDTO.getPostContent());
        postDAO.save(postDTO);
        log.info("writeReply 들어옴2 savedId: {}", postDTO.getId());

        // 댓글 해시태그 저장
        if (postDTO.getHashtags() != null && !postDTO.getHashtags().isEmpty()) {
            log.info("writeReply 해시태그 들어옴3 size: {}", postDTO.getHashtags().size());
            postDTO.getHashtags().forEach(hashtagDTO -> {
                Optional<PostHashtagDTO> foundHashtag = postHashtagDAO.findByTagName(hashtagDTO.getTagName());
                if (foundHashtag.isEmpty()) {
                    postHashtagDAO.save(hashtagDTO);
                } else {
                    hashtagDTO.setId(foundHashtag.get().getId());
                }
                postHashtagDAO.saveRel(postDTO.getId(), hashtagDTO.getId());
            });
        }
    }

//    댓글 목록 조회 (대댓글 포함)
    public List<PostDTO> getReplies(Long postId, Long memberId) {
        log.info("getReplies 들어옴1 postId: {}, memberId: {}", postId, memberId);
        List<PostDTO> comments = postDAO.findRepliesByPostId(postId, memberId);
        if (comments.isEmpty()) return comments;

        // 댓글 첨부파일 조회
        comments.forEach(c -> {
            List<PostFileDTO> files = new ArrayList<>(postFileDAO.findAllByPostId(c.getId()));
            if (!files.isEmpty()) {
                c.setPostFiles(files);
            }
            c.setHashtags(postHashtagDAO.findAllByPostId(c.getId()));
        });

        List<Long> commentIds = comments.stream().map(PostDTO::getId).collect(Collectors.toList());
        List<PostDTO> subReplies = postDAO.findSubRepliesByParentIds(commentIds, memberId);

        // 대댓글 첨부파일 조회
        subReplies.forEach(sub -> {
            List<PostFileDTO> files = new ArrayList<>(postFileDAO.findAllByPostId(sub.getId()));
            if (!files.isEmpty()) {
                sub.setPostFiles(files);
            }
            sub.setHashtags(postHashtagDAO.findAllByPostId(sub.getId()));
        });

        Map<Long, List<PostDTO>> subMap = subReplies.stream()
                .collect(Collectors.groupingBy(PostDTO::getReplyPostId));

        comments.forEach(c -> c.setSubReplies(subMap.getOrDefault(c.getId(), List.of())));
        log.info("getReplies 들어옴2 댓글수: {}", comments.size());
        return comments;
    }

    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }

    // 멘션 저장 + 알림 발송
    public void saveMentions(Long postId, Long taggerId, List<String> mentionedHandles) {
        if (mentionedHandles == null || mentionedHandles.isEmpty()) return;
        log.info("멘션저장 들어옴1 postId: {}, taggerId: {}, handles: {}", postId, taggerId, mentionedHandles);

        for (String handle : mentionedHandles) {
            log.info("멘션저장 들어옴2 handle: {}", handle);
            // DB에 @포함 형태로 저장되어 있으므로 @가 없으면 붙여서 검색
            String searchHandle = handle.startsWith("@") ? handle : "@" + handle;
            Optional<MemberDTO> taggedMember = memberMapper.selectMemberByMemberHandle(searchHandle);
            if (taggedMember.isEmpty()) {
                log.info("멘션저장 handle 못찾음: {}", searchHandle);
                continue;
            }

            Long taggedId = taggedMember.get().getId();
            // 자기 자신 멘션 무시
            if (taggedId.equals(taggerId)) continue;

            MentionDTO mentionDTO = new MentionDTO();
            mentionDTO.setMentionTaggerId(taggerId);
            mentionDTO.setMentionTaggedId(taggedId);
            mentionDTO.setPostId(postId);
            mentionDAO.save(mentionDTO);
            log.info("멘션저장 들어옴3 저장완료 taggedId: {}", taggedId);

            // 알림 발송
            NotificationDTO noti = new NotificationDTO();
            noti.setRecipientId(taggedId);
            noti.setSenderId(taggerId);
            noti.setNotificationType(NotificationType.HANDLE);
            noti.setTitle("멘션");
            noti.setContent("회원님을 멘션했습니다.");
            noti.setTargetId(postId);
            noti.setTargetType("post");
            notificationService.createNotification(noti);
            log.info("멘션알림 들어옴4 발송완료 recipientId: {}", taggedId);
        }
    }
}
