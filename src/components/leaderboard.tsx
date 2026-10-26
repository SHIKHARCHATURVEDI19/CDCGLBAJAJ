"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, ChevronLeft, ChevronRight, Crown, Medal, Search, ShieldCheck, Trophy, Users } from "lucide-react";

type Leader = { id: string; rank: number; branchRank: number; rollNumber: string; name: string; branch: string; totalMarks: number };
type LeaderboardData = { maximumMarks: number; totalRanked: number; students: Leader[] };

const PAGE_SIZE = 25;

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/leaderboard", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load leaderboard.");
        return body;
      })
      .then(setData)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load leaderboard."));
  }, []);

  const branches = useMemo(() => [...new Set(data?.students.map((student) => student.branch) ?? [])].sort(), [data]);
  const scopeStudents = useMemo(() => data?.students.filter((student) => branch === "ALL" || student.branch === branch) ?? [], [branch, data]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return scopeStudents;
    return scopeStudents.filter((student) => {
      const visibleRank = branch === "ALL" ? student.rank : student.branchRank;
      return student.rollNumber.toLowerCase().includes(term) || student.name.toLowerCase().includes(term) || student.branch.toLowerCase().includes(term) || String(visibleRank) === term;
    });
  }, [branch, query, scopeStudents]);

  const topThree = scopeStudents.slice(0, 3);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateQuery(value: string) { setQuery(value); setPage(1); }
  function updateBranch(value: string) { setBranch(value); setPage(1); }

  return (
    <section id="leaderboard" className="relative px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber-700"><Trophy size={14} /> Live academic standings</div>
            <h2 className="text-4xl font-bold tracking-[-.04em] text-slate-950 sm:text-5xl">Leaderboard</h2>
            <p className="mt-3 max-w-2xl text-slate-500">Switch branches to see independent branch ranks. Equal totals share the same position.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Users size={19} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{branch === "ALL" ? "College students" : `${branch} students`}</p><p className="mt-0.5 text-2xl font-bold">{data ? scopeStudents.length.toLocaleString() : "—"}</p></div>
          </div>
        </div>

        {!data && !error && <div className="mt-10 grid place-items-center py-20"><span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" /></div>}
        {error && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>}
        {data?.totalRanked === 0 && <div className="mt-10 rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center"><Award size={30} className="mx-auto text-blue-600" /><h3 className="mt-5 text-2xl font-bold">Ranking data is being prepared</h3></div>}

        {data && data.totalRanked > 0 && (
          <>
            <div className="mt-9 grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-center">
              <select aria-label="Select branch" value={branch} onChange={(event) => updateBranch(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50">
                <option value="ALL">All branches</option>
                {branches.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"><Search size={17} className="mr-3 text-slate-400" /><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search student, masked roll number or rank" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck size={16} className="text-emerald-500" /> Rolls masked</div>
            </div>

            {!query && topThree.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {topThree.map((student, index) => {
                  const visibleRank = branch === "ALL" ? student.rank : student.branchRank;
                  const styles = index === 0 ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white" : index === 1 ? "border-slate-200 bg-gradient-to-br from-slate-100 to-white" : "border-orange-100 bg-gradient-to-br from-orange-50 to-white";
                  return <div key={`top-${student.id}`} className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm ${styles}`}>
                    <div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm">{index === 0 ? <Crown size={21} className="text-amber-500" /> : <Medal size={20} className={index === 1 ? "text-slate-500" : "text-orange-500"} />}</div><span className="text-3xl font-bold text-slate-900">#{visibleRank}</span></div>
                    <p className="mt-5 truncate text-base font-bold text-slate-900">{student.name}</p><p className="mt-1 text-xs font-semibold text-blue-600">{student.branch} · {student.rollNumber}</p>
                    <p className="mt-4 text-sm text-slate-500">Total <span className="text-lg font-bold text-slate-900">{student.totalMarks}</span><span className="text-xs">/{data.maximumMarks}</span></p>
                  </div>;
                })}
              </div>
            )}

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,.35)]">
              <div className="grid grid-cols-[64px_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid-cols-[80px_1.4fr_.65fr_auto]"><span>{branch === "ALL" ? "College" : "Branch"}</span><span>Student</span><span className="hidden sm:block">Branch</span><span>Total</span></div>
              {visible.map((student) => {
                const visibleRank = branch === "ALL" ? student.rank : student.branchRank;
                return <div key={student.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 transition last:border-0 hover:bg-blue-50/40 sm:grid-cols-[80px_1.4fr_.65fr_auto]">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${visibleRank <= 3 ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{visibleRank <= 3 ? <Medal size={18} /> : `#${visibleRank}`}</span>
                  <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800">{student.name}</span><span className="mt-0.5 block font-mono text-xs text-slate-400">{student.rollNumber}</span><span className="mt-0.5 block text-xs font-semibold text-blue-600 sm:hidden">{student.branch}</span></span>
                  <span className="hidden text-sm font-bold text-blue-600 sm:block">{student.branch}</span>
                  <span className="font-bold text-slate-900">{student.totalMarks}<span className="text-xs font-medium text-slate-400">/{data.maximumMarks}</span></span>
                </div>;
              })}
              {visible.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-400">No matching ranked student.</div>}
            </div>

            {filtered.length > 0 && <div className="mt-5 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row"><p className="text-slate-500">Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}</p><div className="flex items-center gap-2"><button aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 disabled:opacity-35"><ChevronLeft size={18} /></button><span className="min-w-24 text-center font-semibold">Page {safePage} of {pageCount}</span><button aria-label="Next page" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 disabled:opacity-35"><ChevronRight size={18} /></button></div></div>}
          </>
        )}
      </div>
    </section>
  );
}
