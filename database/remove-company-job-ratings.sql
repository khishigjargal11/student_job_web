-- Remove rating columns from companies and jobs tables
-- These ratings are not functional and should be removed

-- Remove rating columns from companies table
ALTER TABLE companies DROP COLUMN IF EXISTS rating;
ALTER TABLE companies DROP COLUMN IF EXISTS total_ratings;

-- Remove rating columns from jobs table  
ALTER TABLE jobs DROP COLUMN IF EXISTS rating;
ALTER TABLE jobs DROP COLUMN IF EXISTS total_ratings;

-- Note: Student ratings are kept as they are functional (students get rated by companies)
-- Work history ratings are also kept as they store the actual ratings given to students