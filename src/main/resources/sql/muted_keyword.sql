create table tbl_muted_keyword (
	id bigint generated always as identity primary key,
    member_id bigint not null,
	muted_keyword varchar(255) not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    constraint fk_member_id foreign key (member_id) references tbl_member(id)
);