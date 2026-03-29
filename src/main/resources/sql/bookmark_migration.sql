-- 북마크 중복 방지 unique 제약 추가
-- 실행 전 중복 데이터 확인:
-- select member_id, post_id, count(*) from tbl_bookmark group by member_id, post_id having count(*) > 1;

-- 중복 데이터가 있으면 먼저 정리:
-- delete from tbl_bookmark a using tbl_bookmark b
-- where a.id > b.id and a.member_id = b.member_id and a.post_id = b.post_id;

alter table tbl_bookmark add constraint uq_bookmark_member_post unique (member_id, post_id);
