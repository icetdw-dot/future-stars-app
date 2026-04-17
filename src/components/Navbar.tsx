import { motion } from "motion/react";
import { Trophy, Menu } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/10">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setActiveTab('home')}
        >
          <Trophy className="text-primary w-6 h-6" />
          <span className="text-xl font-black text-primary tracking-widest font-headline">FUTURE STARS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {['home', 'register', 'live'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-headline font-bold tracking-tight transition-all capitalize ${
                activeTab === tab ? 'text-primary' : 'text-on-background/60 hover:text-on-background'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="md:hidden text-on-background">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
