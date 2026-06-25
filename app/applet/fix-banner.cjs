const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Grab the block to remove
const blockStart = '<AnimatePresence>\n          {activeTab !== "workouts" && state.activeWorkout && (\n            <motion.div\n              initial={{ opacity: 0, y: 30, scale: 0.95 }}';
const blockEndStr = '          )}\n        </AnimatePresence>';

let startIndex = content.indexOf('<AnimatePresence>\n          {activeTab !== "workouts" && state.activeWorkout && (\n');
let endIndex = content.indexOf(blockEndStr, startIndex) + blockEndStr.length;

if (startIndex > -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

// Ensure Timer hook is added if not present
if (!content.includes('function WorkoutBanner')) {
  // Let's add the component at the end of the file or just inside the file
  const bannerCode = `

function WorkoutBanner({ activeWorkout, setActiveTab, activeTab }: any) {
  const [elapsed, setElapsed] = React.useState(0);
  
  React.useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((new Date().getTime() - new Date(activeWorkout.startTime).getTime()) / 1000));
    }, 1000);
    setElapsed(Math.floor((new Date().getTime() - new Date(activeWorkout.startTime).getTime()) / 1000));
    return () => clearInterval(interval);
  }, [activeWorkout]);

  if (!activeWorkout || activeTab === 'workouts') return null;

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const hStr = h > 0 ? h + ":" : "";
  const mStr = m.toString().padStart(h > 0 ? 2 : 1, "0");
  const sStr = s.toString().padStart(2, "0");
  const timeStr = hStr + mStr + ":" + sStr;

  let currentDetail = '';

  if (activeWorkout && activeWorkout.exercises) {
    const unfinishedExercise = activeWorkout.exercises.find((ex: any) => ex.sets.some((set: any) => !set.isCompleted));
    if (unfinishedExercise) {
      const unfinishedSet = unfinishedExercise.sets.find((set: any) => !set.isCompleted);
      currentDetail = unfinishedSet ? (unfinishedSet.weight + " kg × " + unfinishedSet.reps + " reps") : '';
    }
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      onClick={() => setActiveTab('workouts')}
      className="bg-gradient-to-r from-red-600/95 to-rose-600/90 border-b border-black/5 dark:border-white/10 p-3 flex items-center justify-between cursor-pointer relative overflow-hidden shrink-0"
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="flex items-center gap-3 relative z-10 w-full min-w-0 pr-2">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20 shrink-0 shadow-inner ring-1 ring-black/5">
          <Clock className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-baseline gap-2">
            <h5 className="font-extrabold text-white text-sm leading-tight whitespace-nowrap drop-shadow-md">Workout in Progress</h5>
            <span className="text-xs font-mono font-bold text-red-100 bg-black/20 px-1.5 py-0.5 rounded shadow-inner">{timeStr}</span>
          </div>
          {currentDetail ? (
             <p className="text-[10px] font-bold text-red-100 truncate mt-0.5 uppercase tracking-wide opacity-90">
                Next: {currentDetail}
             </p>
          ) : (
             <p className="text-[10px] font-bold text-red-100 uppercase tracking-widest font-mono mt-0.5 opacity-90 drop-shadow-md">Tap here to return</p>
          )}
        </div>
        <div className="bg-white/20 p-2 rounded-xl shrink-0 shadow-md ring-1 ring-white/20">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
`;
  content = content.replace('export default function App() {', bannerCode + '\nexport default function App() {');
}

// Now insert <WorkoutBanner /> in the dock
const dockStartStr = '      <motion.div \n        className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md z-45 rounded-3xl border bg-white/95 dark:bg-black dark:border-white/10 shadow-sm shadow-xl backdrop-blur-2xl flex flex-col ring-1 ring-white/10 overflow-hidden"';

if (content.indexOf(dockStartStr) > -1) {
  const insertTarget = '      >\n        {/* PREMIUM UNIVERSAL BOTTOM FLOATING NAVIGATION BAR (dock style inside) */}';
  content = content.replace(insertTarget, '      >\n        <WorkoutBanner activeWorkout={state.activeWorkout} setActiveTab={setActiveTab} activeTab={activeTab} />\n        {/* PREMIUM UNIVERSAL BOTTOM FLOATING NAVIGATION BAR (dock style inside) */}');
}

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx updated successfully');
