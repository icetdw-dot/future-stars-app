import { Trophy, Share2, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-16 px-6 border-t border-outline-variant/10 pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex items-center gap-2">
          <Trophy className="text-primary w-6 h-6" />
          <span className="text-xl font-black text-primary tracking-widest font-headline">FUTURE STARS</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">Privacy</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">Terms</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">Sponsorships</a>
        </div>

        <div className="flex gap-6">
          <a href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
            <Share2 className="w-4 h-4" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto text-center mt-12 pt-12 border-t border-outline-variant/10">
        <p className="text-on-surface-variant/40 text-[10px] uppercase tracking-widest font-bold">
          © 2024 Future Stars Badminton Federation. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
