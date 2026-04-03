select * from tbl_post_hashtag;

select * from tbl_post_hashtag_rel;

select * from tbl_post;

select * from tbl_block;

delete from tbl_block where blocked_id = 85;

select * from tbl_report;

select * from tbl_post_product;

select * from tbl_news;

select * from tbl_member;

select * from tbl_member_category_rel;

select * from tbl_category;

select * from tbl_follow;

select * from tbl_advertisement;

select * from tbl_payment_advertisement;

select * from tbl_conversation;

select * from tbl_video_session;

select * from tbl_video_recoding;

select * from tbl_file;

select * from tbl_post_file;

select * from tbl_file;

select * from tbl_block;

select * from tbl_category;

select * from tbl_member_category_rel;

select * from tbl_member;

select * from tbl_follow;

select * from tbl_bookmark;

select * from tbl_subscription;

select * from tbl_payment_subscribe;

select * from tbl_badge;

select * from tbl_post_like;

select * from tbl_search_history;

select * from tbl_conversation;

alter table tbl_subscription add column quartz boolean default true;

update tbl_subscription set quartz = false, expires_at = '2026-03-30' where member_id = 41;
update tbl_subscription set expires_at = '2026-03-30' where member_id = 41;

-- update tbl_subscription set tier = 'free' where member_id = 41;
delete from tbl_badge where member_id = 41;
update tbl_member set member_role = 'business' where id = 41;
delete from tbl_payment_subscribe where member_id = 41;
delete from tbl_subscription where member_id = 41;
