import { motion } from 'framer-motion';

interface NavbarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenDashboard?: () => void;
  onOpenPkap?: () => void;
}

export default function Navbar({ activeNav, setActiveNav, onOpenDashboard, onOpenPkap }: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="h-[78px] w-full max-w-[1520px] mx-auto px-6 sm:px-12 flex items-center justify-between z-20 relative"
    >
      <motion.a whileHover={{ scale: 1.02 }} href="#" className="flex items-center gap-3 text-white no-underline" aria-label="SHAKTII Home">
        <div className="w-[27px] h-[27px] rounded-[6px] bg-white flex items-center justify-center relative shadow-[0_2px_6px_rgba(0,0,0,0.6)] shrink-0">
          <div className="w-[17px] h-[10px] bg-[#0a0b0d] rounded-full -rotate-35 flex items-center justify-center relative"><div className="w-[3.5px] h-[3.5px] rounded-full bg-white absolute left-[3px] bottom-[2px]" /></div>
        </div>
        <span className="font-sans font-semibold text-[1.35rem] tracking-[-0.01em] text-white">SHAKTII</span>
      </motion.a>

      <nav className="hidden md:flex items-center gap-5 absolute left-1/2 -translate-x-1/2" aria-label="Main Navigation">
        {['ABOUT', 'FEATURES', 'SOLUTION', 'PRICING', 'CONTACT'].map((item) => (
          <motion.button
            key={item}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            className={`font-mono text-[11px] tracking-[0.07em] uppercase px-1.5 py-1 rounded-[4px] border transition-colors cursor-pointer ${activeNav === item ? 'text-white border-white/40' : 'text-[#7a808e] hover:text-white border-transparent'}`}
            onClick={() => {
              setActiveNav(item);
              document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {item}
          </motion.button>
        ))}
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} onClick={onOpenPkap} className="font-mono text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-[4px] border border-[#6e557d]/60 text-[#cbb6d7] bg-[#6e557d]/10 hover:bg-[#6e557d]/30 transition-colors cursor-pointer">
          PKAP ANALYZER
        </motion.button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} onClick={onOpenDashboard} className="font-mono text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-[4px] border border-[#6e557d]/60 text-white bg-[#6e557d]/20 hover:bg-[#6e557d]/40 transition-colors cursor-pointer flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /><span>DASHBOARD</span>
        </motion.button>
      </nav>

      <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onOpenDashboard} className="bg-[#6e557d] hover:bg-[#7c608c] text-white font-sans text-[13px] font-medium px-[18px] py-2 rounded-[6px] border border-white/10 transition-colors duration-200 shadow-[0_2px_8px_rgba(110,85,125,0.25)] cursor-pointer">
        Live Console
      </motion.button>
    </motion.header>
  );
}
