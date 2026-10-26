# College-Wide Academic Ranking Portal

A responsive Next.js portal that builds one college leaderboard from the supplied student roster and the existing CDC Student Report Card system.

## Included

- Automated CDC report-card collection for every roll number in the 1,721-student roster.
- Assessment 1, 2 and 3 extraction, strict validation, totals, and competition ranking (`1, 2, 2, 4`).
- Persistent checkpoints, bounded browser concurrency, retries for transient failures, and a separate failure log.
- Unified searchable leaderboard with an all-college view, branch-wise ranking selector, student name, masked roll number, total marks, and pagination.
- Exact roll-number results show both branch rank and college rank.
- Exact roll-number lookup that uses the collected dataset and never contacts CDC during a student search.
- An explicit `ABSENT` or dash (`-`) assessment is counted as zero; unrecognized invalid fields remain excluded.

## Collect or refresh the CDC data

Google Apps Script serves the report cards through a browser callback rather than a conventional public JSON API. The collector therefore uses a local Chrome or Edge installation and the portal's supported form workflow. It does not bypass authentication, CAPTCHA, or access restrictions.

```bash
npm install
npm run collect:reports
```

Collection progress is checkpointed in `work/collection-checkpoint.json`, so an interrupted run can continue without refetching successful records. At completion it writes:

- `src/data/collected-students.json` — complete, validated, ranked students.
- `src/data/collection-failures.json` — roll numbers that were absent, incomplete, invalid, or could not be retrieved.

Optional controls:

```bash
npm run collect:reports -- --concurrency=4 --delay-ms=250 --retries=3
```

Concurrency is capped at four to avoid overloading the college service.

## Run the website

```bash
npm run dev
```

Open `http://localhost:3000`.

For a production check:

```bash
npm run build
npm start
```

Run the collector again whenever CDC marks change, then rebuild or restart the website. No admin portal, upload screen, or per-search report-card request is used.

Use `npm run collect:reports -- --refresh` when marks may have changed and every successful report should be fetched again. Without `--refresh`, the saved checkpoint resumes unfinished work and avoids duplicate requests.
