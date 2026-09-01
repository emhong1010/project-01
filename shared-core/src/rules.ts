/**
 * 추적관찰 판별 규칙 (한 곳에 집중 - NFR-4 / US-LRN-2)
 * 규칙을 추가/수정하려면 이 파일만 고치면 됩니다.
 */

/**
 * 권고형 신호: 명시적으로 추가/추적/재검을 권고하는 표현.
 * (category = '권고형')
 */
export const RECOMMENDATION_KEYWORDS: string[] = [
  '추가 검사 권고',
  '추적 검사를 권고',
  '추적검사 권고',
  '추가 평가 권고',
  '재검이 필요',
  '재검사 권고',
  '재검 필요',
  // 데이터엔 드물지만 일반적으로 쓰이는 표현(확장 대비)
  '추적 관찰',
  '추적관찰',
  '추시',
  'f/u',
  'follow up',
  'follow-up',
];

/**
 * 판단형 신호: 명시적 권고는 아니나 후속 판단이 필요함을 시사하는 표현.
 * (category = '판단형')  ※ 사용자 결정 Q1=B로 추적관찰 필요에 포함
 */
export const JUDGMENT_KEYWORDS: string[] = [
  '임상 소견과 함께 판단이 필요',
];

/**
 * 부정/제외 표현: 아래가 신호와 결합되면 추적관찰 필요로 보지 않음.
 */
export const NEGATION_PATTERNS: RegExp[] = [
  /추적\s*검사\s*불필요/,
  /추가\s*검사\s*필요\s*없/,
  /권고하지\s*않/,
  /추적\s*관찰\s*불필요/,
];

/**
 * 추적 시점/기간 추출 패턴. 첫 매칭을 사용.
 */
export const TIMING_PATTERNS: RegExp[] = [
  /\d+\s*(개월|주|일|년|주일)\s*(후|뒤|이내|이후)/,
  /(즉시|추후|조속히)\s*(재검|추적|추가\s*검사)?/,
];

/** 섹션 라벨 (본문 분리용) */
export const SECTION_LABELS = {
  exam: '검사',
  clinicalInfo: '임상정보',
  findings: '소견',
  conclusion: '결론',
} as const;
