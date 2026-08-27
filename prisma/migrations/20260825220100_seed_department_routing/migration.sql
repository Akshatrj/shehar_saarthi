-- Seed department routing metadata (runs after enum values are committed)
UPDATE "departments" SET
  "description" = 'Roads, potholes, footpaths, and road obstructions.',
  "latitude" = 28.6200,
  "longitude" = 77.2100,
  "jurisdictionRadiusKm" = 25.00,
  "workloadScore" = 0,
  "supportedCategories" = ARRAY['POTHOLE','DAMAGED_ROAD','DAMAGED_FOOTPATH','ROAD_OBSTRUCTION']::"ComplaintCategory"[],
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'roads';

UPDATE "departments" SET
  "description" = 'Garbage, drains, and sanitation services.',
  "latitude" = 28.6100,
  "longitude" = 77.2200,
  "jurisdictionRadiusKm" = 25.00,
  "workloadScore" = 0,
  "supportedCategories" = ARRAY['GARBAGE','OVERFLOWING_DUSTBIN','ILLEGAL_DUMPING','BLOCKED_DRAIN','OVERFLOWING_DRAIN','DAMAGED_DRAIN']::"ComplaintCategory"[],
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'sanitation';

UPDATE "departments" SET
  "description" = 'Street lighting and electrical civic infrastructure.',
  "latitude" = 28.6300,
  "longitude" = 77.2000,
  "jurisdictionRadiusKm" = 25.00,
  "workloadScore" = 0,
  "supportedCategories" = ARRAY['BROKEN_STREETLIGHT','FLICKERING_STREETLIGHT','DARK_AREA']::"ComplaintCategory"[],
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'electrical';

UPDATE "departments" SET
  "description" = 'Water supply, leakage, and quality issues.',
  "latitude" = 28.6000,
  "longitude" = 77.2300,
  "jurisdictionRadiusKm" = 25.00,
  "workloadScore" = 0,
  "supportedCategories" = ARRAY['WATER_LEAKAGE','NO_WATER_SUPPLY','CONTAMINATED_WATER']::"ComplaintCategory"[],
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'water';

UPDATE "departments" SET
  "description" = 'Parks, trees, and public green spaces.',
  "latitude" = 28.6400,
  "longitude" = 77.1900,
  "jurisdictionRadiusKm" = 25.00,
  "workloadScore" = 0,
  "supportedCategories" = ARRAY['FALLEN_TREE','OTHER']::"ComplaintCategory"[],
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'parks';
