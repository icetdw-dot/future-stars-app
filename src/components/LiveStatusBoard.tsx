import { motion } from "motion/react";
import { Circle, CheckCircle2, PlayCircle, Clock } from "lucide-react";

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  category: string;
  status: 'Waiting' | 'Live' | 'Completed';
  winner?: string;
  court?: string;
  time?: string;
}

const MOCK_MATCHES: Match[] = [
  { id: '1', teamA: 'Lee Zii Jia', teamB: 'Ng Tze Yong', category: "Men's Single", status: 'Live', court: 'Court 1' },
  { id: '2', teamA: 'Aaron/Soh', teamB: 'Minions', category: "Men's Double", status: 'Waiting', time: '14:30', court: 'Court 2' },
  { id: '3', teamA: 'Pearly/Thinaah', teamB: 'Matsuyama/Shida', category: "Women's Double", status: 'Completed', winner: 'Pearly/Thinaah', court: 'Court 1' },
  { id: '4', teamA: 'Chen/Toh', teamB: 'Watanabe/Higashino', category: "Mixed Double", status: 'Live', court: 'Court 3' },
  { id: '5', teamA: 'Viktor Axelsen', teamB: 'Kunlavut Vitidsarn', category: "Men's Single", status: 'Waiting', time: '15:00', court: 'Court 1' },
];

export default function LiveStatusBoard() {
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
            Total Matches: <span className="text-on-background font-bold">42</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_MATCHES.map((match, index) => (
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
                <div className={`flex-1 text-center md:text-right ${match.winner === match.teamA ? 'text-primary font-bold' : 'text-on-background'}`}>
                  <p className="text-lg md:text-xl font-headline">{match.teamA}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-outline-variant uppercase">VS</span>
                  <div className="h-px w-8 bg-outline-variant/20"></div>
                </div>
                <div className={`flex-1 text-center md:text-left ${match.winner === match.teamB ? 'text-primary font-bold' : 'text-on-background'}`}>
                  <p className="text-lg md:text-xl font-headline">{match.teamB}</p>
                </div>
              </div>

              {/* Info & Status */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{match.category}</p>
                  <p className="text-sm text-on-background/60">{match.court}</p>
                </div>

                <div className="min-w-[140px] flex justify-center">
                  {match.status === 'Live' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20">
                      <PlayCircle className="w-4 h-4 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest">Live Now</span>
                    </div>
                  )}
                  {match.status === 'Waiting' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full border border-outline-variant/10">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{match.time || 'Next'}</span>
                    </div>
                  )}
                  {match.status === 'Completed' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Finished</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {match.status === 'Completed' && match.winner && (
              <div className="mt-4 pt-4 border-t border-outline-variant/5 text-center md:text-right">
                <p className="text-xs text-on-surface-variant">
                  Winner: <span className="text-primary font-bold">{match.winner}</span>
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
