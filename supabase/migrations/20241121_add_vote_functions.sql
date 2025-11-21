-- Function to decrement vote count
CREATE OR REPLACE FUNCTION decrement_vote(row_id UUID, vote_type TEXT)
RETURNS VOID AS $$
BEGIN
  IF vote_type = 'up' THEN
    UPDATE suppliers SET upvotes = GREATEST(0, upvotes - 1) WHERE id = row_id;
  ELSIF vote_type = 'down' THEN
    UPDATE suppliers SET downvotes = GREATEST(0, downvotes - 1) WHERE id = row_id;
  END IF;
END;
$$ LANGUAGE plpgsql security definer;

-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_vote(row_id UUID, vote_type TEXT)
RETURNS VOID AS $$
BEGIN
  IF vote_type = 'up' THEN
    UPDATE suppliers SET upvotes = upvotes + 1 WHERE id = row_id;
  ELSIF vote_type = 'down' THEN
    UPDATE suppliers SET downvotes = downvotes + 1 WHERE id = row_id;
  END IF;
END;
$$ LANGUAGE plpgsql security definer;
