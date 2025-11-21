-- Allow users to delete their own votes
CREATE POLICY "Users can delete own vote" ON supplier_votes FOR DELETE USING (auth.uid() = user_id);

