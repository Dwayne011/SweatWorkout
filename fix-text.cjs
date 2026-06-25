const fs = require('fs');
const files = [
  'src/components/IntroSplash.tsx',
  'src/components/HistoryLogs.tsx',
  'src/components/WorkoutSplashScene.tsx',
  'src/components/ExerciseLibrary.tsx',
  'src/components/AIGeneratorLab.tsx',
  'src/components/AIAssistant.tsx',
  'src/components/TemplatesList.tsx',
  'src/components/ActiveWorkout.tsx',
  'src/App.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n').map(line => {
      if (/(from-indigo|bg-gradient-to)/.test(line)) {
        if (/text-gray-900/.test(line)) {
          return line.replace(/text-gray-900(?:\s+dark:text-gray-1(?:00|50))?/g, 'text-white');
        }
      }
      return line;
    });
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
  }
});
