const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveWorkout.tsx', 'utf8');

code = code.replace(/className="text-\[10px\] sm:text-xs border border-gray-200 dark:border-white\/5 rounded-lg p-0\.5 sm:p-1\.5 bg-white dark:bg-black dark:border-white\/10 shadow-sm text-gray-[0-9]+ dark:text-slate-[0-9]+ focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-[0-9]+ max-w-\[70px\] sm:max-w-none disabled:opacity-40 font-mono"/g, 'className="text-[10px] sm:text-xs border border-gray-200 dark:border-white/5 rounded-lg p-1 sm:p-1.5 pr-5 sm:pr-6 bg-white dark:bg-black dark:border-white/10 shadow-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[90px] sm:max-w-none disabled:opacity-40 font-mono"');

code = code.replace(
  /\{\/\* Bar weight customizable config \*\/\}/g,
  "{exerciseDetails?.equipment === 'Barbell' && (\n                          {/* Bar weight customizable config */}"
);

code = code.replace(
  /<span className="text-\[9px\] text-gray-500 font-mono">kg<\/span>\n                          <\/div>/g,
  '<span className="text-[9px] text-gray-500 font-mono">kg</span>\n                          </div>\n                          )}'
);

const weightRegex = /<td className="py-1 sm:py-2 px-1 sm:px-3">\s*<div className="flex flex-col gap-1\.5">\s*\{\/\* Total Weight Input \*\/\}([\s\S]*?)<\/td>/;

const newWeightInput = `<td className="py-1 sm:py-2 px-1 sm:px-3">
  <div className="flex flex-col gap-1.5">
    {exerciseDetails?.equipment === 'Barbell' ? (
        <>
            {/* Disabled Total Weight */}
            <div className="flex items-center space-x-1 justify-start">
              <input
                disabled={true}
                type="number"
                value={set.weight === 0 ? "" : set.weight}
                className="w-full max-w-14 sm:max-w-20 text-[11px] sm:text-xs border border-gray-200 dark:border-white/10 rounded-lg p-1 bg-gray-50 dark:bg-black/60 shadow-inner text-gray-500 font-mono focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-70"
                style={{ appearance: "none", MozAppearance: "textfield" }}
                title="Total Weight (Bar + Plates)"
              />
              <span className="text-[9px] text-gray-500 font-mono select-none">tot</span>
            </div>
            {/* Editable PLATES */}
            {workoutEx.barWeight !== undefined && workoutEx.barWeight > 0 && (
              <div className="flex flex-col space-y-0.5 mt-0.5">
                <div className="flex items-center space-x-1 justify-start">
                  <input
                    disabled={set.isCompleted}
                    type="number"
                    value={set.weight - workoutEx.barWeight > 0 ? Number((set.weight - workoutEx.barWeight).toFixed(2)) : ""}
                    placeholder="Plates"
                    onChange={(e) => {
                      const plates = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                      onUpdateSet(workoutEx.exerciseId, idx, {
                        weight: plates + (workoutEx.barWeight || 0),
                      });
                    }}
                    className="w-full max-w-14 sm:max-w-20 text-[10px] border border-dashed border-indigo-400/40 dark:border-indigo-400/20 rounded-lg p-0.5 bg-white dark:bg-black dark:border-white/10 shadow-sm text-indigo-700 dark:text-indigo-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40"
                    style={{ appearance: "none", MozAppearance: "textfield" }}
                    title="Input plates weight (total excluding bar)"
                  />
                  <span className="text-[9px] text-gray-500 font-mono select-none">plt</span>
                </div>
                {set.weight - workoutEx.barWeight > 0 && (
                  <div className="text-[9px] text-slate-500 font-mono pl-1">
                    ({Number(((set.weight - workoutEx.barWeight) / 2).toFixed(2))}kg/s)
                  </div>
                )}
              </div>
            )}
        </>
    ) : (
        <div className="flex items-center space-x-1 justify-start">
          <input
            disabled={set.isCompleted}
            type="number"
            value={set.weight === 0 ? "" : set.weight}
            placeholder="Weight"
            onChange={(e) =>
              onUpdateSet(workoutEx.exerciseId, idx, {
                weight: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
              })
            }
            className="w-full max-w-14 sm:max-w-20 text-[11px] sm:text-xs border border-gray-200 dark:border-white/10 rounded-lg p-1 bg-white dark:bg-black dark:border-white/10 shadow-sm text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40"
            style={{ appearance: "none", MozAppearance: "textfield" }}
            title="Total Weight"
          />
          <span className="text-[9px] text-gray-500 font-mono select-none">kg</span>
        </div>
    )}
  </div>
</td>`;

code = code.replace(weightRegex, newWeightInput);
fs.writeFileSync('src/components/ActiveWorkout.tsx', code, 'utf8');
console.log('Fixed ActiveWorkout');
