create table veterinarians (
id uuid primary key default gen_random_uuid(),
name varchar(100) not null, 
email varchar(100) unique not null, 
phone varchar(20) not null,
password_hash text not null, 
category varchar(30) check (category in ('SOLO', 'CLINIC')) default 'SOLO',
crmv varchar(20),
speciality varchar(50),
city varchar(50),
state char(2),
address text,
home_service boolean default false, 
is_available boolean default true, 
created_at timestamp default now(),
updated_at timestamp default now()
);




