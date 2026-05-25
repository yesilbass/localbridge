-- Community v2: comment_count, community_comments table name, comment sync trigger, indexes.

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS comment_count int DEFAULT 0;

-- Rename legacy table name if present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'community_post_comments'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'community_comments'
  ) THEN
    ALTER TABLE public.community_post_comments RENAME TO community_comments;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_comments_public_read" ON public.community_comments;
CREATE POLICY "community_comments_public_read" ON public.community_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_comments_auth_insert" ON public.community_comments;
CREATE POLICY "community_comments_auth_insert" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "community_comments_owner_delete" ON public.community_comments;
CREATE POLICY "community_comments_owner_delete" ON public.community_comments FOR DELETE USING (auth.uid() = author_id);

CREATE INDEX IF NOT EXISTS idx_community_comments_post
  ON public.community_comments(post_id, created_at ASC);

DROP INDEX IF EXISTS idx_community_posts_category;
CREATE INDEX IF NOT EXISTS idx_community_posts_category
  ON public.community_posts(category_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_recent
  ON public.community_posts(created_at DESC);

CREATE OR REPLACE FUNCTION public.sync_community_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_community_comments ON public.community_comments;
CREATE TRIGGER trigger_sync_community_comments
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_comment_count();

UPDATE public.community_posts p
SET comment_count = COALESCE((
  SELECT COUNT(*)::int FROM public.community_comments c WHERE c.post_id = p.id
), 0)
WHERE comment_count IS NULL OR comment_count = 0;
