// 학년별 이수 타임라인 플래너
// 목표 대학/학과 기준으로 고1→고2→고3 최적 과목 배치 생성

import { CourseRecommendationData } from "./types";
import { getCourseRecommendation } from "./course-utils";
import {
  normalizeSubject,
  categorizeSubject,
  classifyCourseLevel,
  type CourseLevel,
} from "./subject";

// ── 출력 인터페이스 ──

export interface TimelineSlot {
  subject: string;
  category: string;
  level: CourseLevel;
  priority: "필수" | "권장" | "추천";
  reason: string;
  recommendedGrade: 1 | 2 | 3;
}

export interface TimelineResult {
  grade1: TimelineSlot[];
  grade2: TimelineSlot[];
  grade3: TimelineSlot[];
  targets: { university: string; department: string }[];
}

// ── 선수과목 관계 (B를 위해 A를 먼저) ──

const PREREQUISITES: Record<string, string[]> = {
  "물리학Ⅱ": ["물리학"],
  "화학Ⅱ": ["화학"],
  "생명과학Ⅱ": ["생명과학"],
  "지구과학Ⅱ": ["지구과학"],
  "미적분Ⅱ": ["미적분Ⅰ"],
  "미적분Ⅰ": ["대수"],
};

// ── 레벨 기반 기본 학년 배정 ──

function getDefaultGrade(level: CourseLevel | null): 1 | 2 | 3 {
  switch (level) {
    case "공통":
      return 1;
    case "일반선택":
      return 2;
    case "진로선택":
      return 3;
    case "융합선택":
      return 3;
    default:
      return 2;
  }
}

// ── 타임라인 플래닝 ──

export function planTimeline(
  data: CourseRecommendationData,
  targets: { university: string; department: string }[]
): TimelineResult {
  // 1. 모든 목표 학과의 과목 수집 + 빈도/중요도 집계
  const subjectInfo = new Map<
    string,
    {
      coreCount: number;
      recCount: number;
      sources: { university: string; department: string; type: "core" | "recommended" }[];
    }
  >();

  for (const { university, department } of targets) {
    const rec = getCourseRecommendation(data, university, department);
    if (!rec) continue;

    for (const s of rec.core) {
      const existing = subjectInfo.get(s) ?? { coreCount: 0, recCount: 0, sources: [] };
      existing.coreCount++;
      existing.sources.push({ university, department, type: "core" });
      subjectInfo.set(s, existing);
    }

    for (const s of rec.recommended) {
      if (subjectInfo.has(s) && subjectInfo.get(s)!.coreCount > 0) continue; // 이미 핵심이면 스킵
      const existing = subjectInfo.get(s) ?? { coreCount: 0, recCount: 0, sources: [] };
      existing.recCount++;
      existing.sources.push({ university, department, type: "recommended" });
      subjectInfo.set(s, existing);
    }
  }

  // 2. 우선순위 결정 + 학년 배정
  const slots: TimelineSlot[] = [];
  const assignedSubjects = new Set<string>();

  for (const [subject, info] of subjectInfo) {
    if (assignedSubjects.has(subject)) continue;
    assignedSubjects.add(subject);

    const level = classifyCourseLevel(subject) ?? "일반선택";
    const category = categorizeSubject(subject);
    let recommendedGrade = getDefaultGrade(level);

    // 선수과목이 있는 경우, 해당 과목의 학년보다 높게 배정
    const prereqs = PREREQUISITES[subject];
    if (prereqs) {
      for (const prereq of prereqs) {
        const prereqNorm = normalizeSubject(prereq);
        const prereqLevel = classifyCourseLevel(prereqNorm);
        const prereqGrade = getDefaultGrade(prereqLevel);
        if (recommendedGrade <= prereqGrade) {
          recommendedGrade = Math.min(prereqGrade + 1, 3) as 1 | 2 | 3;
        }
        // 선수과목도 타임라인에 추가 (아직 없으면)
        if (!assignedSubjects.has(prereqNorm) && !subjectInfo.has(prereqNorm)) {
          assignedSubjects.add(prereqNorm);
          slots.push({
            subject: prereqNorm,
            category: categorizeSubject(prereqNorm),
            level: prereqLevel ?? "일반선택",
            priority: "추천",
            reason: `${subject}의 선수과목`,
            recommendedGrade: prereqGrade,
          });
        }
      }
    }

    // 우선순위 결정
    let priority: "필수" | "권장" | "추천";
    let reason: string;

    if (info.coreCount >= Math.ceil(targets.length * 0.5)) {
      priority = "필수";
      reason = `${info.coreCount}개 목표 학과의 핵심권장과목`;
    } else if (info.coreCount > 0) {
      priority = "권장";
      const depts = info.sources
        .filter((s) => s.type === "core")
        .map((s) => `${s.university} ${s.department}`)
        .slice(0, 2)
        .join(", ");
      reason = `${depts} 핵심권장`;
    } else {
      priority = "추천";
      reason = `${info.recCount}개 학과에서 권장`;
    }

    slots.push({
      subject,
      category,
      level,
      priority,
      reason,
      recommendedGrade,
    });
  }

  // 3. 학년별 분류 + 정렬 (필수 > 권장 > 추천)
  const priorityOrder = { "필수": 0, "권장": 1, "추천": 2 };
  const sortSlots = (a: TimelineSlot, b: TimelineSlot) =>
    priorityOrder[a.priority] - priorityOrder[b.priority];

  return {
    grade1: slots.filter((s) => s.recommendedGrade === 1).sort(sortSlots),
    grade2: slots.filter((s) => s.recommendedGrade === 2).sort(sortSlots),
    grade3: slots.filter((s) => s.recommendedGrade === 3).sort(sortSlots),
    targets,
  };
}
