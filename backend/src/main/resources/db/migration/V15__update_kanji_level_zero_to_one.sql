-- Update all kanji with level = 0 to level = 1 (N1)
-- These kanji are not officially in JLPT but will be treated as N1 level

UPDATE kanji
SET level = 1
WHERE level = 0;
