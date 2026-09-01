/**
 * SectionExtractor: 본문에서 [검사]/[임상정보]/[소견]/[결론] 섹션을 분리.
 * 판별기가 [소견]+[결론]만 검사하도록 지원(오탐 방지).
 */
import type { ReportSections } from './types.js';
import { SECTION_LABELS } from './rules.js';

// [라벨] 위치를 찾는 정규식 (전역)
const SECTION_TAG_RE = /\[(검사|임상정보|소견|결론)\]/g;

/**
 * 본문을 섹션별로 분리한다.
 * 라벨이 전혀 없으면 전체 텍스트를 findings 폴백으로 처리(비정형 대비).
 */
export function extractSections(text: string): ReportSections {
  const result: ReportSections = {
    exam: '',
    clinicalInfo: '',
    findings: '',
    conclusion: '',
  };

  const matches: { label: string; start: number; contentStart: number }[] = [];
  let m: RegExpExecArray | null;
  SECTION_TAG_RE.lastIndex = 0;
  while ((m = SECTION_TAG_RE.exec(text)) !== null) {
    matches.push({ label: m[1], start: m.index, contentStart: m.index + m[0].length });
  }

  if (matches.length === 0) {
    // 비정형: 라벨 없음 → 전체를 소견으로 간주
    result.findings = text.trim();
    return result;
  }

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const end = i + 1 < matches.length ? matches[i + 1].start : text.length;
    const content = text.slice(cur.contentStart, end).trim();
    switch (cur.label) {
      case SECTION_LABELS.exam:
        result.exam = content;
        break;
      case SECTION_LABELS.clinicalInfo:
        result.clinicalInfo = content;
        break;
      case SECTION_LABELS.findings:
        result.findings = content;
        break;
      case SECTION_LABELS.conclusion:
        result.conclusion = content;
        break;
    }
  }
  return result;
}
