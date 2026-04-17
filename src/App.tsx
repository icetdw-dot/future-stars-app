import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, AppWindow, Radio } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RulesSection from "./components/RulesSection";
import StatsBento from "./components/StatsBento";
import Footer from "./components/Footer";
import RegistrationForm from "./components/RegistrationForm";
import LiveStatusBoard from "./components/LiveStatusBoard";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-surface selection:bg-primary selection:text-on-primary">
      <div className="fixed inset-0 noise-overlay pointer-events-none z-[100]"></div>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-20 pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Hero onRegisterClick={() => setActiveTab("register")} />
              <RulesSection />
              <StatsBento />
            </motion.div>
          )}

          {activeTab === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <RegistrationForm />
            </motion.div>
          )}

          {activeTab === "live" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LiveStatusBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-outline-variant/10">
        <div className="flex justify-around items-center h-20 px-4 pb-safe w-full">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'home' ? 'text-primary' : 'text-on-background/40'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-wider font-bold mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'register' ? 'text-primary' : 'text-on-background/40'}`}
          >
            <AppWindow className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-wider font-bold mt-1">Register</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex flex-col items-center justify-center transition-all ${activeTab === 'live' ? 'text-primary' : 'text-on-background/40'}`}
          >
            <Radio className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-wider font-bold mt-1">Live</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
