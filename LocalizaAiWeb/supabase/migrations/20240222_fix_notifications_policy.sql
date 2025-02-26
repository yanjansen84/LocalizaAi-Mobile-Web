-- Drop old policy
drop policy if exists "Users can create notifications" on notifications;

-- Create new policy that allows users to create notifications for others
create policy "Users can create notifications for others"
    on notifications for insert
    with check (auth.uid() = from_user_id);

-- Create policy that allows users to create notifications for themselves
create policy "Users can create notifications for themselves"
    on notifications for insert
    with check (auth.uid() = user_id);
