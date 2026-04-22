import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, PlayCircle, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";

type DbMatchStatus = "scheduled" | "in_progress" | "finished" | "cancelled";

type MatchRow = {
  id: string;
  group_name: string;
  match_status: DbMatchStatus;
  score_a: number | null;
  score_b: number | null;
  created_at: string;
  player_a_registration_id: string;
  player_b_registration_id: string;
  player_a_name?: string;
  player_b_name?: string;
};

function toUiStatus(s: DbMatchStatus): "Waiting" | "Live" | "Completed" {
  if (s === "in_progress") return "Live";
  if (s === "finished") return "Completed";
  return "Waiting";
}

export default function LiveStatusBoard() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalMatches = useMemo(() => matches.length, [matches.length]);

  async function fetchMatches() {
    const { data, error: mErr } = await supabase
      .from("matches")
      .select(
        "id, group_name, match_status, score_a, score_b, created_at, player_a_registration_id, player_b_registration_id, player_a:registrations!matches_player_a_registration_id_fkey(full_name), player_b:registrations!matches_player_b_registration_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false });
    if (mErr) throw mErr;
    const normalized =
      (data as any[])?.map((row) => ({
        id: row.id,
        group_name: row.group_name,
        match_status: row.match_status,
        score_a: row.score_a,
        score_b: row.score_b,
        created_at: row.created_at,
        player_a_registration_id: row.player_a_registration_id,
        player_b_registration_id: row.player_b_registration_id,
        player_a_name: row.player_a?.full_name,
        player_b_name: row.player_b?.full_name,
      })) ?? [];
    setMatches(normalized);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        await fetchMatches();
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load matches.");
      }
    })();

    // Realtime subscription (falls back to periodic refresh if not available)
    const channel = supabase
      .channel("live-matches")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        async () => {
          try {
            await fetchMatches();
          } catch {}
        }
      )
      .subscribe();

    const poll = setInterval(() => {
      void fetchMatches().catch(() => {});
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-primary font-bold uppercase tracking-widest text-xs">Live Tournament Feed</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-background">Live Bracket & Matches</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/10 text-sm text-on-surface-variant">
            Total Matches: <span className="text-on-background font-bold">{totalMatches}</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl px-6 py-4">
          <p className="font-bold mb-1">Error</p>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {matches.map((match, index) => {
          const uiStatus = toUiStatus(match.match_status);
          const teamA = match.player_a_name ?? match.player_a_registration_id;
          const teamB = match.player_b_name ?? match.player_b_registration_id;
          return (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-surface-container-low hover:bg-surface-container-high p-6 md:p-8 rounded-[32px] border border-outline-variant/10 transition-all cursor-default"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Teams */}
              <div className="flex-1 flex items-center justify-center md:justify-start gap-6 w-full">
                <div className="flex-1 text-center md:text-right text-on-background">
                  <p className="text-lg md:text-xl font-headline">{teamA}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-outline-variant uppercase">
                    {match.score_a ?? 0} : {match.score_b ?? 0}
                  </span>
                  <div className="h-px w-8 bg-outline-variant/20"></div>
                </div>
                <div className="flex-1 text-center md:text-left text-on-background">
                  <p className="text-lg md:text-xl font-headline">{teamB}</p>
                </div>
              </div>

              {/* Info & Status */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{match.group_name}</p>
                  <p className="text-sm text-on-background/60">Match</p>
                </div>

                <div className="min-w-[140px] flex justify-center">
                  {uiStatus === 'Live' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20">
                      <PlayCircle className="w-4 h-4 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest">Live Now</span>
                    </div>
                  )}
                  {uiStatus === 'Waiting' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full border border-outline-variant/10">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Waiting</span>
                    </div>
                  )}
                  {uiStatus === 'Completed' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Finished</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );})}
        {matches.length === 0 ? (
          <div className="text-on-surface-variant text-sm">No matches yet.</div>
        ) : null}
      </div>
    </section>
  );
}
