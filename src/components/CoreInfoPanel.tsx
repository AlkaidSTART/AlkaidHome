import { useTranslation } from "react-i18next";

export default function CoreInfoPanel({ visible }: { visible: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={`absolute left-1/2 top-[15%] -translate-x-1/2 pointer-events-none transition-all duration-500 z-20 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-black/70 backdrop-blur-xl border border-slate-400/30 rounded-xl px-6 py-4 shadow-2xl shadow-slate-500/10 min-w-[320px] text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
          <h3 className="font-[Orbitron] text-lg font-bold text-slate-200 tracking-wider">
            {t("core.name")}
          </h3>
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent mb-3" />

        <p className="text-[0.8rem] text-slate-300/80 leading-relaxed mb-3">
          {t("core.description")}
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              4
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">
              {t("core.stats.agents")}
            </div>
          </div>
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              99.9%
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">
              {t("core.stats.uptime")}
            </div>
          </div>
          <div className="bg-slate-500/10 rounded-lg py-2 px-1">
            <div className="font-[Orbitron] text-xs text-slate-300 font-bold">
              24/7
            </div>
            <div className="text-[0.6rem] text-slate-400/50 mt-0.5">
              {t("core.stats.online")}
            </div>
          </div>
        </div>

        <div className="mt-3 text-[0.65rem] text-slate-300/40 font-[Orbitron] tracking-widest">
          {t("core.status")}
        </div>
      </div>
    </div>
  );
}
