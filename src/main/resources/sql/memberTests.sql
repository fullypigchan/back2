

select
    id, member_email, member_password,
    member_nickname, member_handle,
    member_phone, member_bio,
    member_region, member_status,
    member_role, push_enabled,
    website_url, birth_date, created_datetime,
    updated_datetime, last_login_at, member_name
from tbl_member
where member_phone = '01099139076' and member_password = '$2a$10$tq3cPX5qJaxrWcGaSBJYrutxACPQlfqWLY1QzNvNsoNdqIxhX6xkm'
and member_status = 'active';


select * from tbl_member;
select * from tbl_member_profile_file;
select * from tbl_file;
select * from tbl_business_member;
alter table tbl_member add member_language varchar(255);
alter table tbl_member drop website_url;
alter table tbl_member
alter column member_email drop not null;
ALTER TABLE tbl_member
ADD CONSTRAINT member_email_unique UNIQUE (member_email);

alter table tbl_member_category_rel add id bigint not null primary key ;
select * from tbl_member_category_rel;

create view vw_file_member as
select
    f.id, f.original_name, f.file_name, f.file_path, f.file_size,
    f.content_type, f.created_datetime,
    pf.member_id
from tbl_member_profile_file pf
         join tbl_file f on pf.id = f.id;

create view vw_category_member as
select *
from tbl_member_category_rel mc join tbl_category c on mc.category_id = c.id;
select * from vw_category_member;

select * from tbl_category;
select * from tbl_member_category_rel;

drop table tbl_oauth
drop type oauth_provider;
