-- Manual migration to update ActaType enum values
-- This preserves existing data by converting old values to new ones

-- Step 1: Create new enum type
CREATE TYPE "ActaType_new" AS ENUM ('PRESIDENTIAL', 'DEPUTIES', 'MAYORS');

-- Step 2: Add temporary column with new type
ALTER TABLE "actas" ADD COLUMN "type_new" "ActaType_new";

-- Step 3: Migrate data from old to new
UPDATE "actas" SET "type_new" =
  CASE
    WHEN "type"::text = 'PRESIDENCIAL' THEN 'PRESIDENTIAL'::"ActaType_new"
    WHEN "type"::text = 'DEPARTAMENTAL' THEN 'DEPUTIES'::"ActaType_new"
    WHEN "type"::text = 'MUNICIPAL' THEN 'MAYORS'::"ActaType_new"
  END;

-- Step 4: Drop old column
ALTER TABLE "actas" DROP COLUMN "type";

-- Step 5: Rename new column to original name
ALTER TABLE "actas" RENAME COLUMN "type_new" TO "type";

-- Step 6: Drop old enum type
DROP TYPE "ActaType";

-- Step 7: Rename new enum type to original name
ALTER TYPE "ActaType_new" RENAME TO "ActaType";

-- Step 8: Make column NOT NULL if it was before
ALTER TABLE "actas" ALTER COLUMN "type" SET NOT NULL;
