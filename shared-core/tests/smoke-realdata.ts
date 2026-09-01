// 실데이터 스모크(테스트 러너 아님): npx tsx tests/smoke-realdata.ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCsv, processRecords } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, '..', '..', 'sample-data', 'clinical_notes.csv');
const text = readFileSync(csvPath, 'utf8');
const records = parseCsv(text);
const out = processRecords(records);

console.log('전체 판독문 수:', out.summary.totalReports);
console.log('추적 관찰 필요:', out.summary.totalFollowUp);
console.log('제외(판독문 아님):', out.summary.excludedCount);
console.log('과별 필요 건수:');
for (const d of out.byDept) console.log(`  ${d.dept}: ${d.followUpCount}`);
const 권고형 = out.results.filter((r) => r.category === '권고형').length;
const 판단형 = out.results.filter((r) => r.category === '판단형').length;
console.log(`유형: 권고형 ${권고형}, 판단형 ${판단형}`);
