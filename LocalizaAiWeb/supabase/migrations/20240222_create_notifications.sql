

-- Create policy to allow users to create notifications
create policy "Users can create notifications"
    on notifications for insert
    with check (auth.uid() = from_user_id);

-- Create policy to allow users to update their own notifications
create policy "Users can update their own notifications"
    on notifications for update
    using (auth.uid() = user_id);

-- Create policy to allow users to delete their own notifications
create policy "Users can delete their own notifications"
    on notifications for delete
    using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- Grant access to authenticated users
grant all on notifications to authenticated;
-- Create notifications table
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    type text not null check (type in ('follow', 'payment', 'cancel', 'feature')),
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    from_user_id uuid references auth.users(id) on delete cascade not null,
    from_user_name text not null,
    from_user_image text,
    user_id uuid references auth.users(id) on delete cascade not null,
    read boolean default false not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Create policy to allow users to see their own notifications
create policy "Users can view their own notifications"
    on notifications for select
    using (auth.uid() = user_id);