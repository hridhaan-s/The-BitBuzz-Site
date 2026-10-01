-- Ambassador publishing must not require a cover image.
-- The previous trigger blocked published rows with no cover URL.
DROP TRIGGER IF EXISTS trg_require_cover_image_for_published_articles ON public.articles;
