CREATE TABLE public.customers (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	email varchar(100) NOT NULL,
	phone varchar(20) NULL,
	cpf varchar(14) NULL,
	verification_code varchar(10) NULL,
	code_expires_at timestamp NULL,
	"role" varchar(20) DEFAULT 'customer'::character varying NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	deleted_at timestamp NULL,
	password_hash varchar NULL,
	CONSTRAINT "UQ_413de651cfd9c576b99cec83fd3" UNIQUE (cpf),
	CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174" UNIQUE (phone),
	CONSTRAINT "UQ_b942d55b92ededa770041db9ded" UNIQUE (name),
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);