create view vw_file_advertisement as
select
    f.id, f.original_name, f.file_name, f.file_path, f.file_size,
    f.content_type, f.created_datetime,
    af.ad_id
from tbl_ad_file af
join tbl_file f on af.id = f.id;

create view view_post_feed as
select p.id,
       p.member_id,
       p.post_status,
       p.title          as post_title,
       p.content        as post_content,
       p.location,
       p.reply_post_id,
       p.created_datetime,
       p.updated_datetime,
       m.member_nickname,
       m.member_handle,
       (select f.file_name from tbl_member_profile_file mpf
           join tbl_file f on mpf.id = f.id
        where mpf.member_id = p.member_id and mpf.profile_image_type = 'profile'
        limit 1) as member_profile_file_name,
       (select count(*) from tbl_post_like pl where pl.post_id = p.id) as like_count,
       (select count(*) from tbl_post rp where rp.reply_post_id = p.id) as reply_count,
       (select count(*) from tbl_bookmark b where b.post_id = p.id) as bookmark_count
from tbl_post p
         join tbl_member m on p.member_id = m.id
where p.post_status = 'active'
  and p.reply_post_id is null;