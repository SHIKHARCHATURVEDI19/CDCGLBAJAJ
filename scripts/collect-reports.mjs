import { chromium } from "playwright-core";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROSTER_PATH = path.join(ROOT, "src", "data", "student-roster.json");
const CHECKPOINT_PATH = path.join(ROOT, "work", "collection-checkpoint.json");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "collected-students.json");
const FAILURES_PATH = path.join(ROOT, "src", "data", "collection-failures.json");
const CDC_URL = "https://script.google.com/macros/s/AKfycby860NNoT4AIX7_P0w60uz1J3CNTaSz5XcrxsAGsJN2oD13vltlUv-49F_qPbEGY2_0/exec";
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const args = new Map(process.argv.slice(2).map((entry) => {
  const [key, value = "true"] = entry.replace(/^--/, "").split("=");
  return [key, value];
}));
const concurrency = Math.max(1, Math.min(4, Number(args.get("concurrency") || 2)));
const limit = args.has("limit") ? Math.max(1, Number(args.get("limit"))) : Infinity;
const delayMs = Math.max(250, Number(args.get("delay-ms") || 500));
const maxRetries = Math.max(1, Math.min(5, Number(args.get("retries") || 3)));
const refresh = args.has("refresh");
const executablePath = CHROME_PATHS.find(existsSync);
if (!executablePath) throw new Error("Google Chrome or Microsoft Edge is required to collect CDC reports.");

const roster = JSON.parse(await readFile(ROSTER_PATH, "utf8")).slice(0, limit);
await mkdir(path.dirname(CHECKPOINT_PATH), { recursive: true });
let checkpoint = { results: {}, failures: {} };
if (!refresh && existsSync(CHECKPOINT_PATH)) {
  try { checkpoint = JSON.parse(await readFile(CHECKPOINT_PATH, "utf8")); } catch {}
}

const pending = roster.filter((student) => !checkpoint.results[student.roll_number]);
let nextIndex = 0;
let processedSinceSave = 0;
let saveQueue = Promise.resolve();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class TerminalCollectionError extends Error {}
const parseMark = (value) => {
  const normalized = String(value || "").trim();
  if (/\bABSENT\b/i.test(normalized)) return 0;
  if (/^[-\u2013\u2014]+(?:\s*\/\s*500)?$/.test(normalized)) return 0;
  const match = normalized.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*500\s*$/);
  if (!match) return null;
  const mark = Number(match[1]);
  return Number.isFinite(mark) && mark >= 0 && mark <= 500 ? mark : null;
};

async function saveCheckpoint(force = false) {
  processedSinceSave += 1;
  if (!force && processedSinceSave < 10) return;
  processedSinceSave = 0;
  saveQueue = saveQueue.then(() => writeFile(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), "utf8"));
  await saveQueue;
}

async function preparePage(context) {
  const page = await context.newPage();
  await page.goto(CDC_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.locator('iframe[title="CDC - Student Report Card"]').waitFor({ state: "attached", timeout: 30000 });
  for (let attempt = 0; attempt < 20; attempt++) {
    for (const candidate of page.frames()) {
      if (await candidate.locator("#rollNo").count()) return { page, frame: candidate };
    }
    await page.waitForTimeout(500);
  }
  await page.close();
  throw new Error("CDC report form did not load.");
}

async function collectOne(session, rosterStudent) {
  const { frame } = session;
  const input = frame.locator("#rollNo");
  const button = frame.locator("#searchBtn");
  const report = frame.locator("#reportCard");
  const errorBox = frame.locator("#errorBox");
  await input.fill(rosterStudent.roll_number);
  await button.click();
  await frame.locator("#searchBtn:not([disabled])").waitFor({ state: "visible", timeout: 30000 });
  if (await errorBox.isVisible()) {
    const message = (await errorBox.innerText()).trim() || "CDC returned no report.";
    if (/try again|temporar|unable to load/i.test(message)) throw new Error(message);
    throw new TerminalCollectionError(message);
  }
  if (!(await report.isVisible())) throw new Error("CDC returned no visible report.");
  const [name, branch, a1Text, a2Text, a3Text] = await Promise.all([
    frame.locator("#name").innerText(),
    frame.locator("#branch").innerText(),
    frame.locator("#assessment1").innerText(),
    frame.locator("#assessment2").innerText(),
    frame.locator("#assessment3").innerText(),
  ]);
  const marks = [parseMark(a1Text), parseMark(a2Text), parseMark(a3Text)];
  if (marks.some((mark) => mark === null)) throw new TerminalCollectionError(`Incomplete or invalid marks: ${a1Text}, ${a2Text}, ${a3Text}`);
  return {
    roll_number: rosterStudent.roll_number,
    name: name.trim() && name.trim() !== "-" ? name.trim() : rosterStudent.name,
    branch: branch.trim() && branch.trim() !== "-" ? branch.trim() : rosterStudent.branch,
    assessment_1_marks: marks[0],
    assessment_2_marks: marks[1],
    assessment_3_marks: marks[2],
    total_marks: marks.reduce((sum, mark) => sum + mark, 0),
    rank: null,
    updated_at: new Date().toISOString(),
  };
}

async function worker(workerNumber, context) {
  let session = await preparePage(context);
  while (true) {
    const index = nextIndex++;
    if (index >= pending.length) break;
    const student = pending[index];
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await collectOne(session, student);
        checkpoint.results[student.roll_number] = result;
        delete checkpoint.failures[student.roll_number];
        console.log(`[${Object.keys(checkpoint.results).length}/${roster.length}] ${student.roll_number} collected by worker ${workerNumber}`);
        lastError = null;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        if (error instanceof TerminalCollectionError) break;
        if (attempt < maxRetries) {
          await session.page.close().catch(() => {});
          await sleep(750 * 2 ** (attempt - 1));
          session = await preparePage(context);
        }
      }
    }
    if (lastError) {
      checkpoint.failures[student.roll_number] = { roll_number: student.roll_number, name: student.name, branch: student.branch, error: lastError, attempts: maxRetries, updated_at: new Date().toISOString() };
      console.warn(`[failed] ${student.roll_number}: ${lastError}`);
    }
    await saveCheckpoint();
    await sleep(delayMs);
  }
  await session.page.close().catch(() => {});
}

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext();
try {
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, pending.length)) }, (_, index) => worker(index + 1, context)));
} finally {
  await saveCheckpoint(true);
  await browser.close();
}

const results = Object.values(checkpoint.results).sort((a, b) => b.total_marks - a.total_marks || a.roll_number.localeCompare(b.roll_number));
let previousTotal = null;
let currentRank = 0;
results.forEach((student, index) => {
  if (student.total_marks !== previousTotal) currentRank = index + 1;
  student.rank = currentRank;
  previousTotal = student.total_marks;
});
const failures = Object.values(checkpoint.failures).sort((a, b) => a.roll_number.localeCompare(b.roll_number));
await writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf8");
await writeFile(FAILURES_PATH, JSON.stringify(failures, null, 2), "utf8");
console.log(`Finished: ${results.length} ranked, ${failures.length} failed.`);
