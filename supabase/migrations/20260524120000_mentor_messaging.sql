-- Subscription-gated messaging between mentees and mentors.
-- Run in Supabase SQL Editor if not using CLI migrations.

CREATE TABLE IF NOT EXISTS public.mentor_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES public.mentor_profiles (id) ON DELETE CASCADE,
  mentee_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentee_id, mentor_id)
);

CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.mentor_conversations (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mentor_messages_conversation_created_idx
  ON public.mentor_messages (conversation_id, created_at);

CREATE OR REPLACE FUNCTION public.has_active_bridge_subscription(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_settings us
    WHERE us.user_id = uid
      AND us.settings->>'subscription_status' = 'active'
      AND us.settings->>'subscription_plan' IN ('Plus', 'Pro')
  );
$$;

CREATE OR REPLACE FUNCTION public.touch_mentor_conversation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.mentor_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mentor_messages_touch_conversation ON public.mentor_messages;
CREATE TRIGGER mentor_messages_touch_conversation
  AFTER INSERT ON public.mentor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_mentor_conversation_updated_at();

ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mentor_conversations_select ON public.mentor_conversations;
CREATE POLICY mentor_conversations_select
  ON public.mentor_conversations FOR SELECT
  USING (
    mentee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_id AND mp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS mentor_conversations_insert ON public.mentor_conversations;
CREATE POLICY mentor_conversations_insert
  ON public.mentor_conversations FOR INSERT
  WITH CHECK (
    mentee_id = auth.uid()
    AND public.has_active_bridge_subscription(auth.uid())
  );

DROP POLICY IF EXISTS mentor_messages_select ON public.mentor_messages;
CREATE POLICY mentor_messages_select
  ON public.mentor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_conversations c
      WHERE c.id = conversation_id
        AND (
          c.mentee_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.mentor_profiles mp
            WHERE mp.id = c.mentor_id AND mp.user_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS mentor_messages_insert ON public.mentor_messages;
CREATE POLICY mentor_messages_insert
  ON public.mentor_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.mentor_conversations c
      WHERE c.id = conversation_id
        AND (
          (
            c.mentee_id = auth.uid()
            AND public.has_active_bridge_subscription(auth.uid())
          )
          OR EXISTS (
            SELECT 1 FROM public.mentor_profiles mp
            WHERE mp.id = c.mentor_id AND mp.user_id = auth.uid()
          )
        )
    )
  );

GRANT SELECT, INSERT ON public.mentor_conversations TO authenticated;
GRANT SELECT, INSERT ON public.mentor_messages TO authenticated;
