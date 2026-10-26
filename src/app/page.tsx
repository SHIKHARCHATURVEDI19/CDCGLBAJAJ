"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Award, BookOpen, CheckCircle2, Search, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import Leaderboard from "@/components/leaderboard";

type RankResult = {
  rollNumber: string;
  name: string | null;
  branch: string | null;
  totalMarks: number;
  maximumMarks: number;
  rank: number;
  branchRank: number;
  branchStudentsRanked: number;
  studentsRanked: number;
  percentile: number;
  updatedAt: string;
};

export default function Home() {
  const [rollNumber, setRollNumber] = useState("");
  const [result, setResult] = useState<RankResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchRank(event: FormEvent) {
    event.preventDefault();
    const roll = rollNumber.trim().toUpperCase();
    if (!roll) return setError("Enter your roll number to continue.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/rank?rollNumber=${encodeURIComponent(roll)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "We could not retrieve your rank.");
      setResult(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fd] text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[690px] bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.12),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,.12),transparent_30%)]" />
      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><BookOpen size={22} /></div>
          <div><p className="text-[11px] font-bold uppercase tracking-[.22em] text-blue-600">CDC Academic Cell</p><p className="font-semibold tracking-tight">College Rank Portal</p></div>
        </div>
        <a href="#leaderboard" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-700"><Trophy size={15} /> Leaderboard</a>
      </nav>

      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1fr_460px] lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-blue-700"><Sparkles size={14} /> Academic year 2026–27</div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">Know where you <span className="text-blue-600">stand.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Your combined performance across all three assessments, with both branch-wise and college-wide standings.</p>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-500" /> Three assessments combined</span>
            <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-500" /> Roll numbers masked</span>
          </div>
        </div>

        <div className="rounded-[32px] border border-white bg-white/90 p-3 shadow-[0_30px_90px_-25px_rgba(30,64,175,.22)] backdrop-blur">
          <div className="rounded-[25px] border border-slate-100 p-6 sm:p-8">
            {!result ? (
              <>
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Search size={22} /></div>
                <h2 className="text-2xl font-bold tracking-tight">Check your branch rank</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Enter the roll number printed on your student ID.</p>
                <form onSubmit={searchRank} className="mt-7">
                  <label htmlFor="roll" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Roll number</label>
                  <div className={`flex h-14 items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 ${error ? "border-red-300" : "border-slate-200"}`}>
                    <Search size={18} className="mr-3 text-slate-400" />
                    <input id="roll" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="e.g. 2024001" autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold uppercase outline-none placeholder:font-normal placeholder:normal-case placeholder:text-slate-400" />
                  </div>
                  {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
                  <button disabled={loading} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-60">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Finding your rank</> : <>Search rank <ArrowRight size={18} /></>}</button>
                </form>
                <p className="mt-5 text-center text-xs text-slate-400">Ranks are calculated from the collected CDC report cards.</p>
              </>
            ) : (
              <div className="animate-in text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-500"><Award size={28} /></div>
                {result.name && <p className="mt-4 text-xl font-bold text-slate-900">{result.name}</p>}
                <p className="mt-1 text-sm font-medium text-slate-500">{result.branch && <><span className="font-bold text-blue-600">{result.branch}</span><span className="mx-2">·</span></>}Roll number <span className="font-bold text-slate-800">{result.rollNumber}</span></p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-600/15"><p className="text-xs font-bold uppercase tracking-wider text-blue-100">{result.branch || "Branch"} rank</p><p className="mt-1 text-4xl font-bold">#{result.branchRank}</p></div>
                  <div className="rounded-2xl bg-slate-900 p-4 text-white"><p className="text-xs font-bold uppercase tracking-wider text-slate-300">College rank</p><p className="mt-1 text-4xl font-bold">#{result.rank}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Total marks</p><p className="mt-1 text-xl font-bold">{result.totalMarks}<span className="text-sm font-medium text-slate-400">/{result.maximumMarks}</span></p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">{result.branch || "Branch"} students</p><p className="mt-1 text-xl font-bold">{result.branchStudentsRanked.toLocaleString()}</p></div>
                </div>
                <div className="mt-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">You ranked above {result.percentile}% of students in your branch.</div>
                <button onClick={() => { setResult(null); setRollNumber(""); }} className="mt-5 text-sm font-bold text-blue-600 hover:text-blue-800">Check another roll number</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Leaderboard />

      <footer className="relative border-t border-slate-200/70 bg-white/60 px-5 py-7 text-center text-xs text-slate-400">Ranks use standard competition ranking and include only students with complete assessment data.</footer>
    </main>
  );
}
