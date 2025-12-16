-- Fix auto increment for kanji and compound_words tables
-- This ensures ID is automatically generated when inserting new records

-- Step 1: Drop all foreign key constraints that reference kanji.id
-- Get constraint names first, then drop if exists
SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'notebook_entries' AND COLUMN_NAME = 'kanji_id' AND REFERENCED_TABLE_NAME = 'kanji' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE notebook_entries DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'search_history' AND COLUMN_NAME = 'kanji_id' AND REFERENCED_TABLE_NAME = 'kanji' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE search_history DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'kanji_progress' AND COLUMN_NAME = 'kanji_id' AND REFERENCED_TABLE_NAME = 'kanji' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE kanji_progress DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'compound_kanji' AND COLUMN_NAME = 'kanji_id' AND REFERENCED_TABLE_NAME = 'kanji' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE compound_kanji DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'kanji_examples' AND COLUMN_NAME = 'kanji_id' AND REFERENCED_TABLE_NAME = 'kanji' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE kanji_examples DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Drop all foreign key constraints that reference compound_words.id
SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'notebook_entries' AND COLUMN_NAME = 'compound_id' AND REFERENCED_TABLE_NAME = 'compound_words' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE notebook_entries DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'search_history' AND COLUMN_NAME = 'compound_id' AND REFERENCED_TABLE_NAME = 'compound_words' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE search_history DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'KanjiMaster' AND TABLE_NAME = 'compound_kanji' AND COLUMN_NAME = 'compound_id' AND REFERENCED_TABLE_NAME = 'compound_words' LIMIT 1);
SET @sql = IF(@constraint_name IS NOT NULL, CONCAT('ALTER TABLE compound_kanji DROP FOREIGN KEY ', @constraint_name), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Modify kanji table ID to auto increment
ALTER TABLE kanji MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Step 4: Modify compound_words table ID to auto increment
ALTER TABLE compound_words MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- Step 5: Recreate foreign keys for kanji
ALTER TABLE notebook_entries 
ADD CONSTRAINT fk_notebook_entries_kanji
FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE CASCADE;

ALTER TABLE search_history 
ADD CONSTRAINT fk_search_history_kanji
FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE SET NULL;

ALTER TABLE kanji_progress 
ADD CONSTRAINT fk_kanji_progress_kanji
FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE CASCADE;

ALTER TABLE compound_kanji 
ADD CONSTRAINT fk_compound_kanji_kanji
FOREIGN KEY (kanji_id) REFERENCES kanji(id);

ALTER TABLE kanji_examples 
ADD CONSTRAINT fk_kanji_examples_kanji
FOREIGN KEY (kanji_id) REFERENCES kanji(id) ON DELETE CASCADE;

-- Step 6: Recreate foreign keys for compound_words
ALTER TABLE notebook_entries 
ADD CONSTRAINT fk_notebook_entries_compound
FOREIGN KEY (compound_id) REFERENCES compound_words(id) ON DELETE CASCADE;

ALTER TABLE search_history 
ADD CONSTRAINT fk_search_history_compound
FOREIGN KEY (compound_id) REFERENCES compound_words(id) ON DELETE SET NULL;

ALTER TABLE compound_kanji 
ADD CONSTRAINT fk_compound_kanji_compound
FOREIGN KEY (compound_id) REFERENCES compound_words(id);
