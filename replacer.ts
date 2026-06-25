import * as fs from 'fs';

const filePaths = ['src/components/WorkoutAnalytics.tsx'];

filePaths.forEach(filePath => {
  let data = fs.readFileSync(filePath, 'utf8');
  data = data.replaceAll('whoopInsights', 'diagnosticInsights');
  data = data.replaceAll('setWhoopInsights', 'setDiagnosticInsights');
  data = data.replaceAll('whoopLoading', 'diagnosticLoading');
  data = data.replaceAll('setWhoopLoading', 'setDiagnosticLoading');
  data = data.replaceAll('whoopError', 'diagnosticError');
  data = data.replaceAll('setWhoopError', 'setDiagnosticError');
  data = data.replaceAll('whoopPayload', 'diagnosticPayload');
  data = data.replaceAll('fetchWhoopInsights', 'fetchDiagnosticInsights');
  data = data.replaceAll('WHOOP-Style', 'Performance');
  data = data.replaceAll('WHOOP', 'Performance');
  
  fs.writeFileSync(filePath, data, 'utf8');
});

console.log("Successfully replaced whoop variables");
