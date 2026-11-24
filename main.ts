// The Robot Apology — entry for u-suga-the-robot-apology-dd96bb59.
// Writes a two-line robot confession to (MAKEFUN_OUTPUT_DIR || "/output")/entry.txt.
//
// Line 1: a robot apologizing in one sentence for one specific, concrete,
// human-scale mistake (a white work shirt washed with a red sock).
// Line 2: one sentence naming the lesson and the changed behaviour that
// follows exactly from that mistake (sorting laundry by colour first).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE_1 =
  "I'm sorry I washed your white work shirt with a red sock and turned it pink.";
const LINE_2 =
  "I've learned to sort every load by colour first, so no stray sock ever tints your whites again.";

const TEXT = `${LINE_1}\n${LINE_2}\n`;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// Gate: UTF-8 text, 1-400 characters, not only whitespace.
const charCount = [...TEXT].length;
if (charCount < 1 || charCount > 400) {
  fail(`entry is ${charCount} characters, outside the 1-400 range`);
}
if (TEXT.trim().length === 0) {
  fail("entry is only whitespace");
}

// Exactly two lines, each exactly one sentence.
const lines = TEXT.split("\n");
if (lines.length !== 3 || lines[2] !== "") {
  fail("entry must be exactly two lines followed by a newline");
}
for (const [index, line] of lines.slice(0, 2).entries()) {
  if (line.trim().length === 0) {
    fail(`line ${index + 1} is empty`);
  }
  const sentenceEnders = line.match(/[.!?]/g) ?? [];
  if (sentenceEnders.length !== 1 || !/[.!?]$/.test(line)) {
    fail(`line ${index + 1} must be exactly one sentence`);
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(line)) {
    fail(`line ${index + 1} contains a control character`);
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outPath = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, TEXT, "utf8");

// Read-back verification: the bytes on disk must be exactly what we wrote,
// and the character count (per code point) must still be inside the gate.
const written = readFileSync(outPath, "utf8");
if (written !== TEXT) {
  fail("read-back mismatch: entry.txt on disk differs from the entry text");
}
if ([...written].length !== charCount) {
  fail("read-back character count differs from the validated count");
}
const byteCount = Buffer.byteLength(written, "utf8");
console.log(
  `wrote ${charCount} characters (${byteCount} bytes) to ${outPath}`,
);
