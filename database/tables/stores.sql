create table stores (
id uuid primary key default gen_random_uuid(),
name varchar(100) not null,
email varchar(100) unique not null, 
password_hash text not null, 
phone varchar(20), 
category varchar(30) not null check (category in ('PETSHOP', 'FEED_STORE')),
cnpj varchar(20),
address text,
city varchar(50),
state char(2),
is_open boolean default true, 
created_at timestamp default now()
);