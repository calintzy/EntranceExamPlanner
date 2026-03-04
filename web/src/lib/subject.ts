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
