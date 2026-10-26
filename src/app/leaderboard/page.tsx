import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import Leaderboard from "@/components/leaderboard";

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fd] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"><ArrowLeft size={17} /> Rank search</Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><BookOpen size={18} className="text-blue-600" /> College Rank Portal</div>
        </div>
      </header>
      <Leaderboard />
    </main>
  );
}
