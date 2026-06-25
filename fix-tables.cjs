const fs = require('fs');
let content = fs.readFileSync('src/components/ActiveWorkout.tsx', 'utf8');

// The replacement function will convert both `table` blocks into Flexbox grids.
// Instead of complex AST, we'll try to use regex or string parsing if they are similar,
// or we can just provide the two blocks.

let startIndex1 = content.indexOf('{/* Sets Table */}');
let endIndex1 = content.indexOf('</div>\n                            </div>\n\n                            {/* Notes & Rest Area */}');

let startIndex2 = content.lastIndexOf('{/* Sets Table */}');
let endIndex2 = content.lastIndexOf('</div>\n                      </div>\n\n                      {/* Notes & Rest Area */}');

console.log(startIndex1, endIndex1, startIndex2, endIndex2);
