import { Bell, Database, Moon, ShieldAlert } from 'lucide-react';

export interface PkapSettings {
  darkMode: boolean;
  pushNotifications: boolean;
  autoDelete: boolean;
  strictCompliance: boolean;
  aiAssist: boolean;
}

export const defaultSettings: PkapSettings = {
  darkMode: true,
  pushNotifications: false,
  autoDelete: true,
  strictCompliance: false,
  aiAssist: true,
};

interface Props {
  settings: PkapSettings;
  onChange: (settings: PkapSettings) => void;
  onResetData: () => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full border transition-colors cursor-pointer shrink-0 ${checked ? 'bg-[#6e557d] border-[#8d6b9d]' : 'bg-[#17191e] border-white/10'}`}
    >
      <span className={`absolute top-[2px] w-5 h-5 rounded-full transition-all ${checked ? 'left-[26px] bg-white' : 'left-[2px] bg-[#737b87]'}`} />
    </button>
  );
}

export default function SettingsPage({ settings, onChange, onResetData }: Props) {
  const update = <K extends keyof PkapSettings>(key: K, value: PkapSettings[K]) => onChange({ ...settings, [key]: value });

  const handleNotifications = (enabled: boolean) => {
    if (!enabled) {
      update('pushNotifications', false);
      return;
    }
    if (!('Notification' in window)) {
      update('pushNotifications', false);
      return;
    }
    void Notification.requestPermission().then((permission) => {
      const granted = permission === 'granted';
      update('pushNotifications', granted);
      if (granted) new Notification('Pkap Analyzer', { body: 'Push notifications enabled successfully.' });
    });
  };

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.16em] text-[#8d6b9d] mb-2">WORKSPACE CONTROL // LOCAL PREFERENCES</div>
        <h1 className="font-sans text-3xl font-semibold tracking-[-0.03em]">Settings</h1>
        <p className="text-[13px] text-[#747c89] mt-2">Manage Pkap Analyzer preferences while keeping the SHAKTII security-console experience consistent.</p>
      </div>

      <div className="space-y-5">
        <div className="panel overflow-hidden">
          <div className="panel-header"><h2 className="panel-title flex items-center gap-2"><Moon size={16} className="text-[#a98abb]"/> Appearance & Preferences</h2></div>
          <div className="panel-body space-y-5">
            <div className="flex items-center justify-between gap-6">
              <div><h3 className="text-sm font-medium">Dark Mode</h3><p className="text-[11px] text-[#68717d] mt-1">Use the SHAKTII dark security-console aesthetic across Pkap Analyzer.</p></div>
              <Toggle checked={settings.darkMode} onChange={(value) => update('darkMode', value)} />
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between gap-6">
              <div><h3 className="text-sm font-medium">Push Notifications</h3><p className="text-[11px] text-[#68717d] mt-1">Get alerted when an uploaded log produces a critical risk score.</p></div>
              <Toggle checked={settings.pushNotifications} onChange={handleNotifications} />
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between gap-6">
              <div><h3 className="text-sm font-medium">AI Assist</h3><p className="text-[11px] text-[#68717d] mt-1">Use configured Gemini/Groq/Claude/OpenAI providers before the local parser fallback.</p></div>
              <Toggle checked={settings.aiAssist} onChange={(value) => update('aiAssist', value)} />
            </div>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="panel-header"><h2 className="panel-title flex items-center gap-2"><Database size={16} className="text-[#a98abb]"/> Data Retention & Compliance</h2></div>
          <div className="panel-body space-y-5">
            <div className="flex items-center justify-between gap-6">
              <div><h3 className="text-sm font-medium">Auto-Delete Old Logs</h3><p className="text-[11px] text-[#68717d] mt-1">Purge local report history older than 90 days when new analysis is saved.</p></div>
              <Toggle checked={settings.autoDelete} onChange={(value) => update('autoDelete', value)} />
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between gap-6">
              <div><h3 className="text-sm font-medium">Strict Compliance Mode</h3><p className="text-[11px] text-[#68717d] mt-1">Raise the minimum risk posture for critical/high findings and keep redaction-first processing enabled.</p></div>
              <Toggle checked={settings.strictCompliance} onChange={(value) => update('strictCompliance', value)} />
            </div>
          </div>
        </div>

        <div className="panel overflow-hidden border-red-400/15">
          <div className="panel-header"><h2 className="panel-title flex items-center gap-2"><ShieldAlert size={16} className="text-red-300"/> Local Data Controls</h2></div>
          <div className="panel-body flex flex-wrap items-center justify-between gap-4">
            <div><h3 className="text-sm font-medium">Reset Pkap Analyzer Data</h3><p className="text-[11px] text-[#68717d] mt-1">Clears saved report history and current session report from this browser.</p></div>
            <button onClick={() => { if (window.confirm('Clear all locally stored Pkap Analyzer reports?')) onResetData(); }} className="btn btn-outline text-red-300 border-red-400/20 hover:border-red-400/40"><Bell size={14}/> Reset Local Data</button>
          </div>
        </div>
      </div>
    </section>
  );
}
