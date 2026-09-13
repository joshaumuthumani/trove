import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePositiveIntId, readJsonBody } from "./http";

const reqWithBody = (body: string) => new Request("http://localhost/api/test", { method: "POST", body });

test("parsePositiveIntId: accepts positive integers", () => {
  assert.equal(parsePositiveIntId("1"), 1);
  assert.equal(parsePositiveIntId("42"), 42);
  assert.equal(parsePositiveIntId("9007199254740991"), 9007199254740991);
});

test("parsePositiveIntId: rejects zero, negatives, decimals, and non-numeric input", () => {
  assert.equal(parsePositiveIntId("0"), null);
  assert.equal(parsePositiveIntId("-1"), null);
  assert.equal(parsePositiveIntId("1.5"), null);
  assert.equal(parsePositiveIntId("abc"), null);
  assert.equal(parsePositiveIntId(""), null);
  assert.equal(parsePositiveIntId("1e3"), null);
  assert.equal(parsePositiveIntId(" 1"), null);
  assert.equal(parsePositiveIntId("1 "), null);
  assert.equal(parsePositiveIntId("01"), null);
  assert.equal(parsePositiveIntId("NaN"), null);
});

test("readJsonBody: accepts a JSON object", async () => {
  assert.deepEqual(await readJsonBody(reqWithBody(JSON.stringify({ title: "x" }))), { title: "x" });
});

test("readJsonBody: rejects malformed JSON, arrays, null, and primitives", async () => {
  assert.equal(await readJsonBody(reqWithBody("{not json")), null);
  assert.equal(await readJsonBody(reqWithBody("[1,2,3]")), null);
  assert.equal(await readJsonBody(reqWithBody("null")), null);
  assert.equal(await readJsonBody(reqWithBody('"a string"')), null);
  assert.equal(await readJsonBody(reqWithBody("42")), null);
});
