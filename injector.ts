import * as fs from 'fs';

const filePath = 'src/components/WorkoutAnalytics.tsx';
let data = fs.readFileSync(filePath, 'utf8');

const targetStr = '      {/* 2. GOOGLE HEALTH 30-DAY ACTIVE GRID (Heat points) */}';

const replacementStr = `      {/* PERFORMANCE DIAGNOSTICS DASHBOARD (Simplified) */}
      <div className="bg-white dark:bg-black dark:border-white/10 shadow-lg shadow-inner border border-gray-200 dark:border-white/5 rounded-3xl p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5 gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-gray-900 dark:text-slate-100 text-sm flex items-center space-x-2">
              <Activity className="text-emerald-500 w-4 h-4" />
              <span>Athletic Diagnostic Engine</span>
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
              Data-driven insights to calibrate workload, interference, and recovery.
            </p>
          </div>
          <button
            onClick={fetchWhoopInsights}
            disabled={whoopLoading}
            className="flex items-center space-x-1 px-3 py-1.5 text-[10px] uppercase font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 rounded-lg transition-all self-start cursor-pointer select-none"
          >
            <Zap className={\`w-3 h-3 \${whoopLoading ? "animate-spin" : ""}\`} />
            <span>{whoopLoading ? "Running Diagnostics..." : "Refresh Engine"}</span>
          </button>
        </div>

        {whoopLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 animate-pulse space-y-2.5">
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full w-1/3" />
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full w-3/4" />
                <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : whoopError ? (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] rounded-xl font-bold">
            {whoopError}. Please check Settings & Secrets to confirm your Gemini API key is configured.
          </div>
        ) : whoopInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {whoopInsights.map((insight, idx) => {
              const isAlert = insight.category === "ALERT_STATUS" || insight.category === "CONCURRENT_INTERFERENCE_WARNING";
              const isGreen = insight.category === "GREEN_STATUS";
              return (
                <div
                  key={idx}
                  className={\`p-3.5 rounded-xl flex flex-col justify-start space-y-2.5 transition-all shadow-inner outline outline-1 \${
                    isAlert
                      ? "bg-rose-50 dark:bg-rose-500/5 text-rose-900 dark:text-rose-100 outline-rose-500/20"
                      : isGreen
                      ? "bg-emerald-50 dark:bg-emerald-500/5 text-emerald-900 dark:text-emerald-100 outline-emerald-500/20"
                      : "bg-amber-50 dark:bg-amber-500/5 text-amber-900 dark:text-amber-100 outline-amber-500/20"
                  }\`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {isAlert ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : isGreen ? <Award className="w-4 h-4 text-emerald-500" /> : <Scale className="w-4 h-4 text-amber-500" />}
                      <span className="font-extrabold text-[9px] uppercase tracking-widest opacity-80">
                        {insight.category?.replace(/_/g, " ")}
                      </span>
                    </div>
                    {insight.score_impact !== undefined && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                        {Number(insight.score_impact) > 0 ? \`+\${insight.score_impact}\` : insight.score_impact} Index
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-700 dark:text-slate-300 opacity-90 leading-relaxed font-semibold">
                    {insight.coaching_copy}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] text-gray-500 dark:text-slate-400 font-bold border border-gray-200 dark:border-white/5">
            Diagnoses calibrating. Check that the server has compiled completely to load the Athletic Diagnostic Engine.
          </div>
        )}
      </div>

      {/* 2. GOOGLE HEALTH 30-DAY ACTIVE GRID (Heat points) */}`;

const startIndex = data.indexOf(targetStr);
if (startIndex !== -1) {
  data = data.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, data, 'utf8');
  console.log("Successfully injected replacement.");
} else {
  console.log("Could not find targetStr.");
}
