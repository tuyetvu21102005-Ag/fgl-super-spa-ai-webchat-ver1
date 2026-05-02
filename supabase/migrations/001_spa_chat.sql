-- Migrations/001_spa_chat.sql

-- Enable uuid-ossp for UUID generation
create extension if not exists "uuid-ossp";

-- Table for chat sessions
create table chat_sessions (
    id uuid primary key default uuid_generate_v4(),
    spa_id text not null,
    visitor_id text,
    created_at timestamp with time zone default now(),
    metadata jsonb default '{}'::jsonb
);

-- Table for chat messages
create table chat_messages (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references chat_sessions(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    json_output jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now()
);

-- Table for leads
create table leads (
    id uuid primary key default uuid_generate_v4(),
    spa_id text not null,
    name text,
    phone text,
    service_interest text,
    temperature text check (temperature in ('cold', 'warm', 'hot')),
    score integer default 0,
    pain_points jsonb default '[]'::jsonb,
    competitor_mentions jsonb default '[]'::jsonb,
    source text default 'chat_widget',
    status text default 'new',
    created_at timestamp with time zone default now()
);

-- Table for bookings
create table bookings (
    id uuid primary key default uuid_generate_v4(),
    spa_id text not null,
    customer_name text,
    phone text,
    service text,
    booking_time timestamp with time zone,
    status text default 'pending',
    reminder_sent boolean default false,
    created_at timestamp with time zone default now()
);

-- Table for loyalty points (PRO)
create table loyalty_points (
    id uuid primary key default uuid_generate_v4(),
    spa_id text not null,
    customer_phone text,
    points integer default 0,
    history jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default now()
);

-- Table for inventory (PRO)
create table inventory (
    id uuid primary key default uuid_generate_v4(),
    spa_id text not null,
    product_name text not null,
    quantity integer default 0,
    price integer default 0,
    updated_at timestamp with time zone default now()
);

-- RLS (Row Level Security) - Simplified for this context
-- Enable RLS
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table leads enable row level security;
alter table bookings enable row level security;
alter table loyalty_points enable row level security;
alter table inventory enable row level security;

-- Policies (Simplified: allow all for now, but in production we'd restrict by spa_id)
create policy "Allow all for demo" on chat_sessions for all using (true);
create policy "Allow all for demo" on chat_messages for all using (true);
create policy "Allow all for demo" on leads for all using (true);
create policy "Allow all for demo" on bookings for all using (true);
create policy "Allow all for demo" on loyalty_points for all using (true);
create policy "Allow all for demo" on inventory for all using (true);
