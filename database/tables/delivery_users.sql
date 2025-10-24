create table delivery_users (
id uuid primary key default gen_random_uuid(),
name varchar(100) not null,
email varchar(100) unique not null,
phone varchar(20) not null,
cpf varchar(14),
password_hash text not null,
vehicle_type varchar(20) not null, 
vehicle_plate varchar(10),
cnh_number varchar(20),
cnh_valid_until date,
photo_url text,
role varchar(20) default 'delivery',
created_at timestamp default now(),
updated_at timestamp default now()
);







