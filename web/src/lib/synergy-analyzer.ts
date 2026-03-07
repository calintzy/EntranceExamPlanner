// 과목 시너지 맵
// 과목 간 동시 추천 빈도 분석 → 연관 과목/학과군 탐색

import { CourseRecommendationData } from "./types";
import { parseSubjects, categorizeSubject } from "./subject";

// ── 출력 인터페이스 ──

export interface SynergyEdge {
  source: string;
  target: string;
  coOccurrence: number;   // 함께 추천되는 학과 수
  asCore: number;         // 둘 다 핵심권장인 학과 수
}

export interface SynergyNode {
  subject: string;
  category: string;
  totalMentions: number;  // 전체 학과에서 언급된 횟수
  connections: number;    // 연결된 과목 수
}

export interface SubjectCluster {
  name: string;           // "공학 클러스터" 등
  subjects: string[];
  departments: { university: string; department: string }[];
}

export interface SynergyData {
  nodes: SynergyNode[];
  edges: SynergyEdge[];
  clusters: SubjectCluster[];
}

// ── 클러스터 이름 결정 ──

function inferClusterName(subjects: string[]): string {
  const categories = subjects.map(categorizeSubject);
  const catCounts: Record<string, number> = {};
  for (const c of categories) {
    catCounts[c] = (catCounts[c] ?? 0) + 1;
  }
  const dominant = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "기타";

  const catLabels: Record<string, string> = {
    수학: "수리",
    과학: "이공",
    사회: "인문사회",
    언어: "어문",
    정보: "정보기술",
    기타: "융합",
  };

  return `${catLabels[dominant] ?? dominant} 클러스터`;
}

// ── 시너지 데이터 빌드 ──

export function buildSynergyData(data: CourseRecommendationData): SynergyData {
  // 1. 학과별 전체 과목 수집 (핵심 + 권장)
  type DeptSubjects = {
    university: string;
    department: string;
    core: Set<string>;
    all: Set<string>;
  };

  const deptList: DeptSubjects[] = [];

  for (const [uni, depts] of Object.entries(data)) {
    for (const [dept, courses] of Object.entries(depts)) {
      const coreSubjects = new Set(parseSubjects(courses.core));
      const recSubjects = parseSubjects(courses.recommended);
      const allSubjects = new Set([...coreSubjects, ...recSubjects]);
      deptList.push({ university: uni, department: dept, core: coreSubjects, all: allSubjects });
    }
  }

  // 2. 과목별 전체 언급 수 + 쌍별 동시 출현 빈도 계산
  const mentionCount = new Map<string, number>();
  const pairCount = new Map<string, number>(); // key: "A|B" (A < B)
  const pairCoreCount = new Map<string, number>();

  for (const dept of deptList) {
    const subjects = Array.from(dept.all);

    for (const s of subjects) {
      mentionCount.set(s, (mentionCount.get(s) ?? 0) + 1);
    }

    // 모든 쌍 순회
    for (let i = 0; i < subjects.length; i++) {
      for (let j = i + 1; j < subjects.length; j++) {
        const [a, b] = subjects[i] < subjects[j]
          ? [subjects[i], subjects[j]]
          : [subjects[j], subjects[i]];
        const key = `${a}|${b}`;
        pairCount.set(key, (pairCount.get(key) ?? 0) + 1);

        // 둘 다 핵심인 경우
        if (dept.core.has(a) && dept.core.has(b)) {
          pairCoreCount.set(key, (pairCoreCount.get(key) ?? 0) + 1);
        }
      }
    }
  }

  // 3. Edge 생성 (최소 3개 학과에서 동시 출현)
  const edges: SynergyEdge[] = [];
  const connectionCount = new Map<string, number>();

  for (const [key, count] of pairCount) {
    if (count < 3) continue;
    const [source, target] = key.split("|");
    edges.push({
      source,
      target,
      coOccurrence: count,
      asCore: pairCoreCount.get(key) ?? 0,
    });
    connectionCount.set(source, (connectionCount.get(source) ?? 0) + 1);
    connectionCount.set(target, (connectionCount.get(target) ?? 0) + 1);
  }

  edges.sort((a, b) => b.coOccurrence - a.coOccurrence);

  // 4. Node 생성
  const nodes: SynergyNode[] = [];
  for (const [subject, totalMentions] of mentionCount) {
    nodes.push({
      subject,
      category: categorizeSubject(subject),
      totalMentions,
      connections: connectionCount.get(subject) ?? 0,
    });
  }

  nodes.sort((a, b) => b.connections - a.connections);

  // 5. 클러스터링: 빈번하게 동시 출현하는 과목 그룹
  const visited = new Set<string>();
  const clusters: SubjectCluster[] = [];

  // 연결 수 높은 과목부터 BFS로 클러스터 형성
  const highConnNodes = nodes.filter((n) => n.connections >= 3);

  for (const seedNode of highConnNodes) {
    if (visited.has(seedNode.subject)) continue;

    const clusterSubjects = new Set<string>();
    const queue = [seedNode.subject];

    while (queue.length > 0 && clusterSubjects.size < 8) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      clusterSubjects.add(current);

      // 현재 과목과 강한 연결(5+ 동시출현)이 있는 과목 추가
      for (const edge of edges) {
        if (edge.coOccurrence < 5) continue;
        let neighbor: string | null = null;
        if (edge.source === current) neighbor = edge.target;
        else if (edge.target === current) neighbor = edge.source;

        if (neighbor && !visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    if (clusterSubjects.size >= 2) {
      // 클러스터에 속하는 학과 찾기
      const clusterDepts: { university: string; department: string }[] = [];
      for (const dept of deptList) {
        const overlap = Array.from(clusterSubjects).filter((s) => dept.all.has(s));
        if (overlap.length >= 2) {
          clusterDepts.push({ university: dept.university, department: dept.department });
        }
      }

      const subjects = Array.from(clusterSubjects);
      clusters.push({
        name: inferClusterName(subjects),
        subjects,
        departments: clusterDepts.slice(0, 10), // 대표 학과 10개
      });
    }
  }

  return { nodes, edges, clusters };
}

// ── 특정 과목의 시너지 조회 ──

export function getRelatedSubjects(
  synergyData: SynergyData,
  subject: string
): SynergyEdge[] {
  return synergyData.edges
    .filter((e) => e.source === subject || e.target === subject)
    .sort((a, b) => b.coOccurrence - a.coOccurrence);
}
