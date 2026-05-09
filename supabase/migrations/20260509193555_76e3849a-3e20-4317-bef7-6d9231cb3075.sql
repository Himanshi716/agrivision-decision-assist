create policy "scans_delete_own_device"
  on public.scans for delete
  using (true);