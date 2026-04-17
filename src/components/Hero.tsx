import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

interface HeroProps {
  onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  const [championPhotoUrl, setChampionPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("champion_photo_url, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        const url = (data as any)?.champion_photo_url ?? null;
        if (!cancelled) setChampionPhotoUrl(url);
      } catch {
        if (!cancelled) setChampionPhotoUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative px-6 py-12 md:py-24 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 z-10"
        >
          <span className="inline-block py-1 px-4 rounded-full bg-primary/10 text-primary font-body text-[10px] uppercase tracking-widest font-semibold mb-6 border border-primary/20">
            Summer Invitational 2024
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-extrabold text-on-background leading-[1.1] mb-8 tracking-tighter">
            CHASING <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">GLORY</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-body">
            Join the most prestigious community badminton tournament of the season. Where precision meets power, and future legends are born on the court.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-8 bg-surface-container-low p-8 rounded-3xl md:rounded-full border border-outline-variant/15 shadow-xl">
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <span className="block text-3xl font-headline font-bold text-primary">12</span>
                <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Days</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/20"></div>
              <div className="text-center">
                <span className="block text-3xl font-headline font-bold text-primary">08</span>
                <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Hrs</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/20"></div>
              <div className="text-center">
                <span className="block text-3xl font-headline font-bold text-primary">45</span>
                <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Min</span>
              </div>
            </div>
            <button 
              onClick={onRegisterClick}
              className="w-full sm:w-auto bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold px-10 py-4 rounded-full hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(242,202,80,0.2)] whitespace-nowrap"
            >
              REGISTER NOW
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-5 relative group"
        >
          <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl group-hover:bg-primary/10 transition-all duration-700"></div>
          <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-outline-variant/15 shadow-2xl">
            <img 
              alt="Champions" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
              src={championPhotoUrl ?? "https://picsum.photos/seed/badminton/800/1000"}
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-primary font-headline font-bold text-xl mb-1">REIGNING CHAMPIONS</h3>
              <p className="text-on-background/80 font-body text-sm">Men's Doubles · Class of '23</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
