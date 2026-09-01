/**
 * FollowUpDetector: 판독문에서 추적 관찰 필요 여부를 규칙 기반으로 판별.
 * 규칙 명세: business-rules.md (R1~R7)
 * - 대상: [소견] + [결론] (임상정보 제외 → 오탐 방지)
 * - 권고형/판단형 구분, 부정 표현 제외
 * - 근거 문장, 추적 시점 추출
 */
import type { Report, DetectionResult, FollowUpCategory } from './types.js';
import { extractSections } from './sectionExtractor.js';
import {
  RECOMMENDATION_KEYWORDS,
  JUDGMENT_KEYWORDS,
  NEGATION_PATTERNS,
  TIMING_PATTERNS,
} from './rules.js';

/** 문장 단위 분리 (마침표/줄바꿈 기준) */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.。])\s*|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** 부정/제외 표현 여부 (R4) */
function hasNegation(text: string): boolean {
  return NEGATION_PATTERNS.some((re) => re.test(text));
}

/** 키워드 매칭 → 매칭된 키워드 목록 */
function findMatches(text: string, keywords: string[]): string[] {
  return keywords.filter((kw) => text.includes(kw));
}

/** 추적 시점/기간 추출 (R7) */
function extractTiming(text: string): string | null {
  for (const re of TIMING_PATTERNS) {
    const m = re.exec(text);
    if (m && m[0].trim().length > 0) return m[0].trim();
  }
  return null;
}

/** 매칭 키워드가 포함된 근거 문장 추출 (R6) */
function collectEvidence(text: string, matched: string[]): string[] {
  const sentences = splitSentences(text);
  const evidence = sentences.filter((s) => matched.some((kw) => s.includes(kw)));
  // 중복 제거
  return Array.from(new Set(evidence));
}

export function detect(report: Report): DetectionResult {
  const sections = extractSections(report.text);
  // R1: 소견 + 결론만 판별 대상
  const target = `${sections.findings}\n${sections.conclusion}`.trim();

  const base: DetectionResult = {
    report,
    isFollowUpNeeded: false,
    category: null,
    matchedKeywords: [],
    evidenceSentences: [],
    followUpTiming: null,
  };

  // R4: 부정/제외 → 필요 아님
  if (hasNegation(target)) {
    return base;
  }

  // R2: 권고형 우선
  let category: FollowUpCategory | null = null;
  let matched = findMatches(target, RECOMMENDATION_KEYWORDS);
  if (matched.length > 0) {
    category = '권고형';
  } else {
    // R3: 판단형
    const judgmentMatched = findMatches(target, JUDGMENT_KEYWORDS);
    if (judgmentMatched.length > 0) {
      category = '판단형';
      matched = judgmentMatched;
    }
  }

  if (category === null) {
    return base;
  }

  return {
    report,
    isFollowUpNeeded: true,
    category,
    matchedKeywords: matched,
    evidenceSentences: collectEvidence(target, matched),
    followUpTiming: extractTiming(target),
  };
}

export function detectMany(reports: Report[]): DetectionResult[] {
  return reports.map(detect);
}
