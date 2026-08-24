import assert from "node:assert/strict";
import { parseClassificationOutput } from "@/domains/ai/parse";
import { validateClassifyImageUrl } from "@/domains/ai/access";

function assertThrows(fn: () => unknown, messageIncludes: string) {
  try {
    fn();
    assert.fail("Expected error");
  } catch (error) {
    assert.ok(error instanceof Error);
    assert.match(error.message, new RegExp(messageIncludes, "i"));
  }
}

function testParse() {
  const valid = parseClassificationOutput(
    '{"category":"POTHOLE","description":"A deep pothole is visible in the road surface."}',
  );
  assert.equal(valid.category, "POTHOLE");
  assert.match(valid.description, /pothole/i);

  const fenced = parseClassificationOutput(
    '```json\n{"category":"GARBAGE","description":"Overflowing waste is piled on the sidewalk."}\n```',
  );
  assert.equal(fenced.category, "GARBAGE");

  const invalidCategory = parseClassificationOutput(
    '{"category":"ALIEN_INVASION","description":"Something unclear."}',
  );
  assert.equal(invalidCategory.category, "OTHER");

  assertThrows(
    () => parseClassificationOutput("not json at all"),
    "json",
  );
}

function testImageUrlAccess() {
  const url = validateClassifyImageUrl(
    "https://abc.public.blob.vercel-storage.com/complaints/user/photo.png",
  );
  assert.match(url, /blob\.vercel-storage\.com/);

  assertThrows(() => validateClassifyImageUrl(""), "required");
  assertThrows(() => validateClassifyImageUrl("ftp://bad.example/x"), "https");
  assertThrows(
    () => validateClassifyImageUrl("https://evil.example/photo.jpg"),
    "allowed",
  );
}

testParse();
testImageUrlAccess();
console.log("phase4 classify tests passed");
