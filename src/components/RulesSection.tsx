import { motion } from "motion/react";
import { ShieldCheck, Shirt, Timer, ArrowRight } from "lucide-react";

export default function RulesSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-primary"></div>
              <span className="text-primary font-body text-xs uppercase tracking-widest font-semibold">The Code of Conduct</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-8 text-on-background">Future Stars Rules & Regulations</h2>
            <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
              To maintain the prestige of the tournament and ensure an elite experience for all participants, we adhere to strict professional standards of play and conduct.
            </p>
            
            <div className="grid gap-8">
              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/10 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-background text-lg mb-1">Fair Play</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Respect for opponents, officials, and the game is paramount at all times. Unsportsmanlike conduct will result in immediate disqualification.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/10 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  <Shirt className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-background text-lg mb-1">Proper Attire</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Mandatory non-marking indoor court shoes and professional athletic wear. No casual shorts or t-shirts allowed on court.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/10 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-background text-lg mb-1">On-time Arrival</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Check-in required 30 minutes before your scheduled match time. Late arrival exceeding 10 minutes will result in a walkover.</p>
                </div>
              </div>
            </div>

            <button className="inline-flex items-center gap-2 mt-12 text-primary font-headline font-bold hover:gap-4 transition-all group">
              <span>View Full Rules & Documentation</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Asymmetric Graphic Elements */}
          <div className="relative h-[500px] hidden lg:block">
            <motion.div 
              initial={{ rotate: 12, scale: 0.8, opacity: 0 }}
              whileInView={{ rotate: 12, scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="absolute top-0 right-0 w-64 h-64 bg-surface-container-highest rounded-[40px] flex items-center justify-center shadow-2xl border border-outline-variant/10 overflow-hidden"
            >
              <img 
                alt="Shuttlecock" 
                className="w-48 h-48 object-contain" 
                src="https://picsum.photos/seed/shuttlecock/400/400"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div 
              initial={{ rotate: -6, scale: 0.8, opacity: 0 }}
              whileInView={{ rotate: -6, scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-10 left-10 w-80 h-80 bg-surface-container-lowest rounded-[40px] overflow-hidden shadow-2xl border border-outline-variant/10 p-4"
            >
              <div className="w-full h-full rounded-[24px] bg-primary/5 flex flex-col justify-end p-8 border border-primary/10">
                <ShieldCheck className="text-primary w-12 h-12 mb-4" />
                <h3 className="text-2xl font-headline font-bold text-on-background">Official Tournament Sanctioned</h3>
                <p className="text-on-surface-variant text-xs mt-2 uppercase tracking-widest">Federation Approved 2024</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
