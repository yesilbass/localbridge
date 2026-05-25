-- Community layer: pillar-based posts, upvotes, flat comments.

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id text NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('question', 'win', 'resource', 'discussion')),
  title text NOT NULL,
  body text NOT NULL,
  upvotes int DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts_public_read" ON public.community_posts;
CREATE POLICY "community_posts_public_read" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_posts_auth_insert" ON public.community_posts;
CREATE POLICY "community_posts_auth_insert" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "community_posts_owner_delete" ON public.community_posts;
CREATE POLICY "community_posts_owner_delete" ON public.community_posts FOR DELETE USING (auth.uid() = author_id);

CREATE TABLE IF NOT EXISTS public.community_post_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_post_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_post_upvotes_read" ON public.community_post_upvotes;
CREATE POLICY "community_post_upvotes_read" ON public.community_post_upvotes FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_post_upvotes_insert" ON public.community_post_upvotes;
CREATE POLICY "community_post_upvotes_insert" ON public.community_post_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_post_upvotes_delete" ON public.community_post_upvotes;
CREATE POLICY "community_post_upvotes_delete" ON public.community_post_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.community_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_comments_public_read" ON public.community_post_comments;
CREATE POLICY "community_comments_public_read" ON public.community_post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_comments_auth_insert" ON public.community_post_comments;
CREATE POLICY "community_comments_auth_insert" ON public.community_post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "community_comments_owner_delete" ON public.community_post_comments;
CREATE POLICY "community_comments_owner_delete" ON public.community_post_comments FOR DELETE USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.sync_community_post_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_community_post_upvotes ON public.community_post_upvotes;
CREATE TRIGGER trigger_sync_community_post_upvotes
  AFTER INSERT OR DELETE ON public.community_post_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_post_upvotes();

CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
