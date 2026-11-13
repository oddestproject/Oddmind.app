import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInput, parseResult, extractText } from "./validate.ts";

const ok = { transcript: "halo dunia", topic: "AI", durationSeconds: 30 };

test("parseInput menerima input sah dan menolak yang buruk", () => {
  assert.deepEqual(parseInput(ok), ok);
  assert.equal((parseInput({ ...ok, transcript: "  " }) as any).status, 400);
  assert.equal((parseInput({ ...ok, extra: 1 }) as any).status, 400);
  assert.equal((parseInput({ ...ok, durationSeconds: 999 }) as any).status, 400);
  assert.equal((parseInput({ ...ok, transcript: "a".repeat(6001) }) as any).status, 413);
  assert.equal((parseInput("x") as any).status, 400);
});

test("parseResult menolak skor di luar 1-5 dan bentuk salah", () => {
  const good = { ct: [1, 2, 3, 4, 5], ps: [1, 1, 1, 1, 1], good: "a", improve: "b", recommend: "c" };
  assert.ok(parseResult(JSON.stringify(good)));
  assert.equal(parseResult(JSON.stringify({ ...good, ct: [1, 2, 3, 4, 6] })), null);
  assert.equal(parseResult(JSON.stringify({ ...good, ps: [1, 2, 3] })), null);
  assert.equal(parseResult("bukan json"), null);
});

test("extractText mengambil teks model_output terakhir", () => {
  const resp = { steps: [{ type: "user_input", content: [{ type: "text", text: "x" }] }, { type: "model_output", content: [{ type: "text", text: "{}" }] }] };
  assert.equal(extractText(resp), "{}");
  assert.equal(extractText({}), null);
});
