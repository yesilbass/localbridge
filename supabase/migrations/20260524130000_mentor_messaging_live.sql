-- Live messaging upgrades: inbox preview, read state, mark-read RPC, Realtime publication.
-- Run in Supabase SQL Editor after 20260524120000_mentor_messaging.sql.

ALTER TABLE public.mentor_conversations
  ADD COLUMN IF NOT EXISTS last_message_body text,
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_message_sender_id uuid,
  ADD COLUMN IF NOT EXISTS mentee_last_read_at timestamptz,
  ADD COLUMN IF NOT EXISTS mentor_last_read_at timestamptz;

CREATE OR REPLACE FUNCTION public.touch_mentor_conversation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.mentor_conversations
  SET
    updated_at = now(),
    last_message_body = NEW.body,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_mentor_conversation_read(conv_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv public.mentor_conversations%ROWTYPE;
BEGIN
  SELECT * INTO conv FROM public.mentor_conversations WHERE id = conv_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF conv.mentee_id = auth.uid() THEN
    UPDATE public.mentor_conversations
    SET mentee_last_read_at = now()
    WHERE id = conv_id;
  ELSIF EXISTS (
    SELECT 1 FROM public.mentor_profiles mp
    WHERE mp.id = conv.mentor_id AND mp.user_id = auth.uid()
  ) THEN
    UPDATE public.mentor_conversations
    SET mentor_last_read_at = now()
    WHERE id = conv_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_mentor_conversation_read(uuid) TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'mentor_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_messages;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'mentor_conversations'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_conversations;
    END IF;
  END IF;
END$$;
