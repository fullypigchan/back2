create type status as enum('active', 'inactive', 'deleted');
create type member_role as enum('admin', 'member');
create type oauth_provider as enum('kakao', 'naver');

create table tbl_member(
    id bigint generated always as identity primary key,
    member_name varchar(255) not null,
    member_email varchar(255) unique,
    member_password varchar(255),
    member_email_verified boolean default true,
    member_status status default 'active',
    member_role member_role default 'member',
    member_language varchar(255),
    created_datetime timestamp default now(),
    updated_datetime timestamp default now()
);


create table tbl_oauth(
    id bigint generated always as identity primary key,
    provider_id varchar(255) unique not null,
    provider oauth_provider,
    profile_url varchar(255),
    member_id bigint not null,
    created_datetime timestamp default now(),
    updated_datetime timestamp default now(),
    constraint fk_oauth_member foreign key (member_id)
    references tbl_member(id)
);











