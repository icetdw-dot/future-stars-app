import { Users, Trophy, MapPin } from "lucide-react";

export default function StatsBento() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-surface-container-high p-12 rounded-[40px] flex flex-col justify-between border border-outline-variant/10 min-h-[300px] group hover:border-primary/20 transition-all">
          <Users className="text-primary w-10 h-10" />
          <div>
            <h4 className="text-5xl md:text-6xl font-headline font-bold text-on-background mb-2 tracking-tighter">128+</h4>
            <p className="text-on-surface-variant font-body uppercase tracking-widest text-xs font-bold">Total Competitors</p>
          </div>
        </div>
        
        <div className="bg-primary p-12 rounded-[40px] flex flex-col justify-between shadow-[0_20px_50px_rgba(242,202,80,0.15)] min-h-[300px] hover:scale-[1.02] transition-transform">
          <Trophy className="text-on-primary w-10 h-10" />
          <div>
            <h4 className="text-5xl md:text-6xl font-headline font-bold text-on-primary mb-2 tracking-tighter">16</h4>
            <p className="text-on-primary/60 font-body uppercase tracking-widest text-xs font-bold">Courts Active</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-12 rounded-[40px] flex flex-col justify-between border border-outline-variant/10 min-h-[300px] group hover:bg-surface-container-low transition-all">
          <MapPin className="text-primary w-10 h-10" />
          <div>
            <h4 className="text-5xl md:text-6xl font-headline font-bold text-on-background mb-2 tracking-tighter">03</h4>
            <p className="text-on-surface-variant font-body uppercase tracking-widest text-xs font-bold">Arena Venues</p>
          </div>
        </div>
      </div>
    </section>
  );
}
