// 과목명 정규화 및 카테고리 분류
// Agent Council 10라운드에서 발견된 버그 수정 포함:
// - "확률과 통계" vs "확률과통계" 띄어쓰기 불일치
// - "또는" 관계 미파싱

// 과목명 정규화 매핑 (띄어쓰기 차이 통일)
const NORMALIZATION_MAP: Record<string, string> = {
  "확률과 통계": "확률과통계",
  "인공지능 수학": "인공지능수학",
};

// ASCII 문자 → 로마숫자/특수문자 정규화
// 데이터에 "화학I" (ASCII I) vs "화학Ⅰ" (로마숫자) 혼재
const CHAR_NORMALIZATION: [RegExp, string][] = [
  [/(?<=화학|물리학|생명과학|지구과학|수학)I(?!I)/g, "Ⅰ"],
  [/(?<=화학|물리학|생명과학|지구과학|수학)II/g, "Ⅱ"],
];

// 과목명 정규화: 띄어쓰기 차이 통일, ASCII→로마숫자, 앞뒤 공백 제거
export function normalizeSubject(name: string): string {
  let normalized = name.trim();
  for (const [from, to] of Object.entries(NORMALIZATION_MAP)) {
    if (normalized.includes(from)) {
      normalized = normalized.replace(from, to);
    }
  }
  for (const [pattern, replacement] of CHAR_NORMALIZATION) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

// 원본 문자열 정리: 끝 쉼표, 끝 "또는", 공백만 있는 값 처리
function cleanRawValue(raw: string): string {
  if (!raw || !raw.trim()) return "";
  return raw.trim().replace(/[,\s]+$/, "").replace(/\s*또는\s*$/, "").trim();
}

// 쉼표 구분 과목 문자열 → 정규화된 과목 배열
// "미적분, 확률과 통계, 기하" → ["미적분", "확률과통계", "기하"]
// "또는" 관계는 하나의 항목으로 유지
export function parseSubjects(raw: string): string[] {
  const cleaned = cleanRawValue(raw);
  if (!cleaned) return [];

  return cleaned
    .split(",")
    .map((s) => normalizeSubject(s.trim()))
    .filter(Boolean);
}

// "또는" 관계를 구조화하여 파싱
// "물리학Ⅱ 또는 화학Ⅱ" → { subjects: ["물리학Ⅱ", "화학Ⅱ"], isOr: true }
export interface SubjectGroup {
  subjects: string[];
  isOr: boolean;
}

export function parseSubjectGroups(raw: string): SubjectGroup[] {
  const cleaned = cleanRawValue(raw);
  if (!cleaned) return [];

  const parts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);

  return parts.map((part) => {
    if (part.includes("또는")) {
      const orSubjects = part
        .split("또는")
        .map((s) => normalizeSubject(s.trim()))
        .filter(Boolean);
      return { subjects: orSubjects, isOr: true };
    }
    return { subjects: [normalizeSubject(part)], isOr: false };
  });
}

// 과목 카테고리 분류
export function categorizeSubject(subject: string): string {
  const normalized = normalizeSubject(subject);
  if (
    normalized.includes("수학") ||
    normalized.includes("미적분") ||
    normalized.includes("기하") ||
    normalized.includes("확률") ||
    normalized.includes("인공지능수학") ||
    normalized.includes("대수") ||
    normalized === "경제수학"
  ) {
    return "수학";
  }
  if (normalized.includes("물리")) return "과학";
  if (normalized.includes("화학")) return "과학";
  if (normalized.includes("생명과학")) return "과학";
  if (normalized.includes("지구과학")) return "과학";
  if (normalized.includes("생태") || normalized.includes("환경")) return "과학";
  if (normalized.includes("지리") || normalized.includes("여행")) return "사회";
  if (normalized.includes("사회") || normalized.includes("경제") || normalized.includes("윤리") || normalized.includes("국제")) return "사회";
  if (normalized.includes("국어") || normalized.includes("화법") || normalized.includes("독서") || normalized.includes("영어")) return "언어";
  if (normalized.includes("정보")) return "정보";
  return "기타";
}

// 모든 고유 과목 추출 (역방향 검색 인덱스 빌드용)
export function extractAllSubjects(subjectGroups: SubjectGroup[]): string[] {
  const subjects = new Set<string>();
  for (const group of subjectGroups) {
    for (const s of group.subjects) {
      subjects.add(s);
    }
  }
  return Array.from(subjects);
}

// ── 교육과정 간 과목명 매핑 (GAP 1 해결) ──
// 2015 개정(2026 데이터) → 2022 개정(2028 데이터) 과목명 매핑
const CURRICULUM_MAP: Record<string, string> = {
  "수학Ⅰ": "대수",
  "수학Ⅱ": "미적분Ⅰ",
  "미적분": "미적분Ⅱ",
  "확률과통계": "확률과통계",
  "물리학Ⅰ": "물리학",
  "물리학Ⅱ": "물리학Ⅱ",
  "화학Ⅰ": "화학",
  "화학Ⅱ": "화학Ⅱ",
  "생명과학Ⅰ": "생명과학",
  "생명과학Ⅱ": "생명과학Ⅱ",
  "지구과학Ⅰ": "지구과학",
  "지구과학Ⅱ": "지구과학Ⅱ",
};

// 역방향 매핑 (2022 → 2015)
const CURRICULUM_MAP_REVERSE: Record<string, string> = {};
for (const [old, neo] of Object.entries(CURRICULUM_MAP)) {
  if (old !== neo) CURRICULUM_MAP_REVERSE[neo] = old;
}

// 교육과정 간 동일 과목 판별 (비교 테이블용)
export function isSameCourse(a: string, b: string): boolean {
  const na = normalizeSubject(a);
  const nb = normalizeSubject(b);
  if (na === nb) return true;
  if (CURRICULUM_MAP[na] === nb) return true;
  if (CURRICULUM_MAP[nb] === na) return true;
  if (CURRICULUM_MAP_REVERSE[na] === nb) return true;
  if (CURRICULUM_MAP_REVERSE[nb] === na) return true;
  return false;
}

// 연도에 따라 적절한 과목명 반환
export function getDisplayName(subject: string, year?: number): string {
  const normalized = normalizeSubject(subject);
  if (!year) return normalized;
  // 원본 그대로 표시 (매핑은 비교 시에만 사용)
  return normalized;
}

// ── 4단계 선택과목 분류 (GAP 2 해결) ──
export type CourseLevel = "공통" | "일반선택" | "진로선택" | "융합선택";

const COURSE_LEVEL_MAP: Record<string, CourseLevel> = {
  // 공통
  "공통국어": "공통",
  "공통수학": "공통",
  "통합사회": "공통",
  "통합과학": "공통",
  "공통영어": "공통",
  // 일반선택 — 수학
  "대수": "일반선택",
  "미적분Ⅰ": "일반선택",
  "확률과통계": "일반선택",
  // 일반선택 — 과학
  "물리학": "일반선택",
  "화학": "일반선택",
  "생명과학": "일반선택",
  "지구과학": "일반선택",
  // 일반선택 — 사회
  "한국지리": "일반선택",
  "세계지리": "일반선택",
  "한국사": "일반선택",
  "세계사": "일반선택",
  "경제": "일반선택",
  "정치와법": "일반선택",
  "사회문화": "일반선택",
  "윤리와사상": "일반선택",
  "생활과윤리": "일반선택",
  // 일반선택 — 언어
  "문학": "일반선택",
  "독서와작문": "일반선택",
  "영어Ⅰ": "일반선택",
  "영어Ⅱ": "일반선택",
  // 진로선택 — 수학
  "미적분Ⅱ": "진로선택",
  "기하": "진로선택",
  "경제수학": "진로선택",
  // 진로선택 — 과학
  "물리학Ⅱ": "진로선택",
  "화학Ⅱ": "진로선택",
  "생명과학Ⅱ": "진로선택",
  "지구과학Ⅱ": "진로선택",
  // 진로선택 — 정보
  "정보": "진로선택",
  "인공지능수학": "진로선택",
  // 진로선택 — 2015 개정 과목 (하위 호환)
  "수학Ⅰ": "일반선택",
  "수학Ⅱ": "일반선택",
  "미적분": "진로선택",
  "물리학Ⅰ": "일반선택",
  "화학Ⅰ": "일반선택",
  "생명과학Ⅰ": "일반선택",
  "지구과학Ⅰ": "일반선택",
  // 융합선택
  "여행지리": "융합선택",
  "기후변화와 지속가능한 세계": "융합선택",
  "과학의 역사와 문화": "융합선택",
  "생태와환경": "융합선택",
  "융합과학탐구": "융합선택",
  "사회문제탐구": "융합선택",
};

export function classifyCourseLevel(subject: string): CourseLevel | null {
  const normalized = normalizeSubject(subject);
  return COURSE_LEVEL_MAP[normalized] ?? null;
}

// ── 레벨별 UI 색상 (공통 사용) ──
export const LEVEL_COLORS: Record<CourseLevel, string> = {
  "공통": "bg-gray-100 text-gray-700 border-gray-200",
  "일반선택": "bg-blue-100 text-blue-700 border-blue-200",
  "진로선택": "bg-purple-100 text-purple-700 border-purple-200",
  "융합선택": "bg-teal-100 text-teal-700 border-teal-200",
};

// ── 카테고리별 과목 태그 색상 (공통 사용, 중복 제거) ──
export const CORE_COLOR_MAP: Record<string, string> = {
  수학: "bg-violet-100 text-violet-800 border-violet-200",
  과학: "bg-emerald-100 text-emerald-800 border-emerald-200",
  사회: "bg-amber-100 text-amber-800 border-amber-200",
  언어: "bg-rose-100 text-rose-800 border-rose-200",
  정보: "bg-cyan-100 text-cyan-800 border-cyan-200",
  기타: "bg-slate-100 text-slate-800 border-slate-200",
};

export const REC_COLOR_MAP: Record<string, string> = {
  수학: "bg-violet-50 text-violet-700 border-violet-100",
  과학: "bg-emerald-50 text-emerald-700 border-emerald-100",
  사회: "bg-amber-50 text-amber-700 border-amber-100",
  언어: "bg-rose-50 text-rose-700 border-rose-100",
  정보: "bg-cyan-50 text-cyan-700 border-cyan-100",
  기타: "bg-slate-50 text-slate-600 border-slate-100",
};
