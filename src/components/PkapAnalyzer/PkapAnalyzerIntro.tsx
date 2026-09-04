import { motion } from 'framer-motion';

interface PkapAnalyzerIntroProps {
  onOpen: () => void;
}

const capabilities = [
  ['01', 'PRIVATE BY DEFAULT', 'Sensitive IPs, emails, secrets and tokens are redacted in-browser before optional external analysis.'],
  ['02', 'DUAL ANALYSIS ENGINE', 'Local deterministic parsing remains available even when AI services are offline or not configured.'],
  ['03', 'SOC-READY CORRELATION', 'Severity scoring, MITRE tags, extracted IOCs, findings, evidence and remediation stay in one investigation flow.'],
  ['04', 'REPORTS + THREAT INTEL', 'History, IOC reputation checks, exportable incident reports and sharing are built into the same console.'],
];

export default function PkapAnalyzerIntro({ onOpen }: PkapAnalyzerIntroProps) {
  return (
    <section className="relative z-10 w-full max-w-[1520px] mx-auto px-6 sm:px-12 py-24 border-t border-white/[0.06]">
      <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-24">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#8b6f99] mb-5">04 // PKAP ANALYZER</div>
          <h2 className="font-sans text-[clamp(2.5rem,5vw,5.6rem)] leading-[0.93] tracking-[-0.055em] text-white font-semibold">
            RAW LOGS IN.<br />
            <span className="text-[#8d6b9d]">THREAT SIGNAL OUT.</span>
          </h2>
          <p className="mt-7 max-w-[630px] text-[#7e8592] text-[14px] sm:text-[15px] leading-7 font-mono">
            Pkap Analyzer turns raw security logs into a privacy-safe incident view without leaving the SHAKTII interface. Upload, redact, score, investigate, correlate and export from one native workflow.
          </p>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpen}
            className="mt-8 bg-[#6e557d] hover:bg-[#7c608c] text-white font-sans text-[14px] font-medium px-5 py-3 rounded-[6px] border border-white/10 shadow-[0_8px_30px_rgba(110,85,125,0.22)] cursor-pointer"
          >
            Open Pkap Analyzer →
          </motion.button>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-white/[0.08] border border-white/[0.08] rounded-[7px] overflow-hidden">
          {capabilities.map(([index, title, copy]) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="bg-[#0d0f12] p-6 sm:p-7 min-h-[220px] flex flex-col justify-between"
            >
              <span className="font-mono text-[10px] text-[#5f6673] tracking-[0.16em]">{index} / ANALYSIS MODULE</span>
              <div>
                <h3 className="font-mono text-[13px] tracking-[0.1em] text-white mb-3">{title}</h3>
                <p className="font-mono text-[12px] leading-6 text-[#737b88]">{copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
