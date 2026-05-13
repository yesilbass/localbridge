-- Allow the mentor (the user who owns the linked mentor_profiles row) to
-- update their own sessions. Prod was missing this policy, so mentor actions
-- like ending a call (status -> 'completed') and accept/decline silently
-- failed under RLS even though the client thought they succeeded.
DROP POLICY IF EXISTS "sessions_update_by_linked_mentor" ON public.sessions;
CREATE POLICY "sessions_update_by_linked_mentor" ON public.sessions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = sessions.mentor_id AND mp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = sessions.mentor_id AND mp.user_id = auth.uid()
    )
  );
