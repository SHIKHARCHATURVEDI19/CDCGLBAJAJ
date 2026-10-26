"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Award, BarChart3, BookOpen, CheckCircle2, GraduationCap, Search, ShieldCheck, Sparkles, Trophy } from "lucide-react";
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
    <main className="min-h-screen overflow-hidden bg-[#f3f6fb] text-slate-950">
      <section className="relative overflow-hidden bg-[#071a36] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(37,99,235,.42),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(14,165,233,.25),transparent_27%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[.055] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />

        <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/30"><BookOpen size={22} /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-blue-300">CDC Academic Cell</p><p className="font-semibold tracking-tight text-white">College Rank Portal</p></div>
          </div>
          <a href="#leaderboard" className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"><Trophy size={15} /> <span className="hidden sm:inline">Leaderboard</span></a>
        </nav>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 md:grid-cols-[1fr_420px] md:pb-20 md:pt-14 lg:grid-cols-[1fr_460px] lg:gap-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-blue-200"><Sparkles size={14} /> Academic year 2026–27</div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.06] tracking-[-.045em] sm:text-5xl lg:text-6xl">Your performance.<br /><span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">One clear rank.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">See your branch position and college-wide standing from all three CDC assessments.</p>
            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur"><BarChart3 size={18} className="text-cyan-300" /><p className="mt-3 text-xl font-bold">1,703</p><p className="mt-0.5 text-xs text-slate-400">Students ranked</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur"><GraduationCap size={18} className="text-blue-300" /><p className="mt-3 text-xl font-bold">7</p><p className="mt-0.5 text-xs text-slate-400">Branches</p></div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur sm:col-span-1"><ShieldCheck size={18} className="text-emerald-300" /><p className="mt-3 text-xl font-bold">Private</p><p className="mt-0.5 text-xs text-slate-400">Rolls masked</p></div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/15 bg-white p-2 text-slate-950 shadow-[0_35px_100px_-25px_rgba(0,0,0,.55)]">
            <div className="rounded-[24px] border border-slate-100 p-6 sm:p-7">
              {!result ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Student lookup</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Find your rank</h2></div>
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Search size={21} /></div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Enter the roll number printed on your student ID.</p>
                  <form onSubmit={searchRank} className="mt-6">
                    <label htmlFor="roll" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Roll number</label>
                    <div className={`flex h-14 items-center rounded-2xl border bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 ${error ? "border-red-300" : "border-slate-200"}`}>
                      <Search size={18} className="mr-3 text-slate-400" />
                      <input id="roll" value={rollNumber} onChange={(event) => setRollNumber(event.target.value)} placeholder="e.g. 2401920100191" autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold uppercase outline-none placeholder:font-normal placeholder:normal-case placeholder:text-slate-400" />
                    </div>
                    {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
                    <button disabled={loading} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-60">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Finding your rank</> : <>View my ranking <ArrowRight size={18} /></>}</button>
                  </form>
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400"><CheckCircle2 size={14} className="text-emerald-500" /> Data collected from CDC report cards</div>
                </>
              ) : (
                <div className="animate-in text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-500"><Award size={24} /></div>
                  {result.name && <p className="mt-3 text-xl font-bold text-slate-900">{result.name}</p>}
                  <p className="mt-1 text-sm font-medium text-slate-500"><span className="font-bold text-blue-600">{result.branch || "Branch"}</span><span className="mx-2">·</span>{result.rollNumber}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-4 text-white shadow-lg shadow-blue-600/15"><p className="text-xs font-bold uppercase tracking-wider text-blue-100">{result.branch || "Branch"} rank</p><p className="mt-1 text-4xl font-bold">#{result.branchRank}</p></div>
                    <div className="rounded-2xl bg-slate-900 p-4 text-white"><p className="text-xs font-bold uppercase tracking-wider text-slate-300">College rank</p><p className="mt-1 text-4xl font-bold">#{result.rank}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">Total marks</p><p className="mt-1 text-xl font-bold">{result.totalMarks}<span className="text-sm font-medium text-slate-400">/{result.maximumMarks}</span></p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-400">College percentile</p><p className="mt-1 text-xl font-bold">{result.percentile}%</p></div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Above {result.percentile}% of students in the college</div>
                  <button onClick={() => { setResult(null); setRollNumber(""); }} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800">Check another roll number</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Leaderboard />

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-xs text-slate-400">Ranks use standard competition ranking and include only students with valid assessment data.</footer>
    </main>
  );
}
