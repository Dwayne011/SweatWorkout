import * as fs from 'fs';

const filePath = 'src/components/WorkoutAnalytics.tsx';
let data = fs.readFileSync(filePath, 'utf8');

const startStr = '      {/* WHOOP-Style Predictive Insights Dashboard */}';
const endStr = '      {/* 4. COOPERATIVE CLINICAL ADVISORIES/ALERTS (Bento-styled) */}';

const startIndex = data.indexOf(startStr);
const endIndex = data.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  // delete between the two
  const before = data.substring(0, startIndex);
  const after = data.substring(endIndex);
  data = before + after;
  fs.writeFileSync(filePath, data, 'utf8');
  console.log("Successfully removed block.");
} else {
  console.log("Could not find delimiters.");
}
