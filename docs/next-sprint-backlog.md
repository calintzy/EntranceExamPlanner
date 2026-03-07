# 입시연구소 — 다음 스프린트 백로그

> 작성: 2026-03-07
> Agent Council (Codex + Gemini) 합의 기반
> 전제: NextAuth JWT → Vercel Postgres 연동

---

## 우선순위 기준

- **P0**: 로그인 체감가치 극대화, 핵심 재방문/락인에 직결
- **P1**: 핵심 보완, 1~2 스프린트 내 권장
- **P2**: 편의성 향상, 안정화 이후
- **P3**: 실험/고도화, 장기 과제

---

## Sprint 1: 핵심 인프라 + P0 (DB 기반)

### FEAT-01: 사용자 프로필 / 내 과목 세트 저장
| 항목 | 내용 |
|------|------|
| 가치 | **높음** — 모든 분석 기능의 입력을 자동화, 매번 과목 재선택 제거 |
| 난이도 | **중간** |
| 우선순위 | **P0** |
| DB 테이블 | `users` (id, provider, provider_account_id, email, name, grade, created_at) |
| | `user_subjects` (user_id, subject_name, status: 이수완료/이수예정, semester) |
| 설명 | 내 과목 조합 저장 → `/my-strategy`, `/timeline`, `/portfolio`에서 기본값 자동 로드 |
| 영향 페이지 | 마이페이지(신규), strategy-client, timeline-client, portfolio-client |

### FEAT-02: 관심 대학/학과 즐겨찾기
| 항목 | 내용 |
|------|------|
| 가치 | **높음** — Quick-win, 구현 대비 사용자 만족도 극대화 |
| 난이도 | **낮음** |
| 우선순위 | **P0** |
| DB 테이블 | `favorites` (id, user_id, university_name, department_name, created_at) |
| 설명 | 대학/학과 상세 페이지에 ★ 즐겨찾기 버튼, 마이페이지에서 모아보기 |
| 영향 페이지 | university/[name], university/[name]/[dept], 마이페이지 |

### FEAT-03: 분석 결과 저장
| 항목 | 내용 |
|------|------|
| 가치 | **높음** — 시간 투자한 분석 결과 보존, 재방문 동기 |
| 난이도 | **중간** |
| 우선순위 | **P0** |
| DB 테이블 | `saved_analyses` (id, user_id, type, name, input_json, result_json, data_version, created_at) |
| | type: 'my-strategy' / 'portfolio' / 'timeline' |
| 설명 | 분석 결과 저장/이름붙이기/불러오기, 최대 20개 |
| 영향 페이지 | strategy-client, portfolio-client, timeline-client, 마이페이지 |

### 공통 베이스 작업
- [ ] Vercel Postgres 설정 + Prisma/Drizzle ORM 선택
- [ ] `users` 테이블 + NextAuth adapter 연동
- [ ] `user_settings` 테이블 (학년, 목표 지역 등)
- [ ] 마이페이지 (`/mypage`) 레이아웃 신규 생성

---

## Sprint 2: 접근 정책 변경 + P1

### FEAT-04: 포트폴리오 샘플 데모 추가
| 항목 | 내용 |
|------|------|
| 가치 | **높음** — 현재 전면 차단으로 이탈 발생, 데모로 전환율 향상 |
| 난이도 | **낮음** |
| 우선순위 | **P1** |
| DB 테이블 | 불필요 (프론트엔드 변경) |
| 설명 | 비로그인 시 샘플 데이터로 상위 1개 조합 미리보기 제공, 내 데이터 입력 시 로그인 유도 |
| 영향 페이지 | portfolio-client.tsx |

### FEAT-05: 친구와 비교 — 비로그인 링크 생성 제한
| 항목 | 내용 |
|------|------|
| 가치 | **중간** — 로그인 전환 유도 + 공유 기능의 프로필 기반 전환 |
| 난이도 | **낮음** |
| 우선순위 | **P1** |
| DB 테이블 | `comparison_links` (id, owner_user_id, link_hash, expires_at, created_at) |
| 설명 | 비로그인: 조회만 가능 / 로그인: 링크 생성 + 이력 관리 |
| 영향 페이지 | compare-client.tsx |

### FEAT-06: 교체 시뮬레이션 제한 강화
| 항목 | 내용 |
|------|------|
| 가치 | **중간** — 심화 기능 차별화 |
| 난이도 | **낮음** |
| 우선순위 | **P1** |
| DB 테이블 | 불필요 (프론트엔드 변경) |
| 설명 | 비로그인: 1회 교체 + 총점 변화 요약만 / 로그인: 무제한 + 상세 득실 |
| 영향 페이지 | strategy-client.tsx |

### FEAT-07: 최근 활동 및 검색 기록
| 항목 | 내용 |
|------|------|
| 가치 | **중간~높음** — "아까 본 그 대학" 이어보기 |
| 난이도 | **낮음** |
| 우선순위 | **P1** |
| DB 테이블 | `activity_logs` (id, user_id, type, target_name, metadata_json, viewed_at) |
| | type: 'view_university' / 'view_department' / 'view_subject' / 'search' |
| 설명 | 최근 본 대학/검색 과목 자동 기록, 마이페이지 + 검색페이지에서 "이어보기" 제공 |
| TTL | 90일 자동 삭제 |
| 영향 페이지 | 마이페이지, search-client, guide-client |

---

## Sprint 3: 차별화 기능 + P2

### FEAT-08: 비교 링크 이력 관리
| 항목 | 내용 |
|------|------|
| 가치 | **중간** |
| 난이도 | **중간** |
| 우선순위 | **P2** |
| DB 테이블 | FEAT-05의 `comparison_links` 재사용 |
| 설명 | 내가 만든 비교 링크 목록, 만료/재공유/삭제 관리 |
| 영향 페이지 | 마이페이지, compare-client |

### FEAT-09: 저장 결과 기반 추천 (다음 액션)
| 항목 | 내용 |
|------|------|
| 가치 | **중간** |
| 난이도 | **중간** |
| 우선순위 | **P2** |
| DB 테이블 | `recommendations` (id, user_id, type, message, link, is_dismissed, created_at) |
| 설명 | "이 과목 교체 시 적합도 +X" 등 개인화 추천 카드를 마이페이지에 표시 |
| 영향 페이지 | 마이페이지 |

### FEAT-10: 개인 활동 대시보드
| 항목 | 내용 |
|------|------|
| 가치 | **중간** |
| 난이도 | **중간** |
| 우선순위 | **P2** |
| DB 테이블 | 기존 activity_logs + saved_analyses 집계 |
| 설명 | 분석 횟수, 관심 대학 변화, 최근 활동 요약 |
| 영향 페이지 | 마이페이지 |

---

## Sprint 4+: 고도화 + P3

### FEAT-11: 관심 대학 변경 추적 + 알림
| 항목 | 내용 |
|------|------|
| 가치 | **높음** — 능동적 정보 제공으로 재방문 유도 |
| 난이도 | **높음** — 데이터 변경 감지 시스템 (Cron Job) 필요 |
| 우선순위 | **P3** |
| DB 테이블 | `notifications` (id, user_id, type, title, message, link, is_read, created_at) |
| | `notification_preferences` (user_id, category, enabled, frequency) |
| | 데이터 버저닝: `data_change_logs` (table, key, old_value, new_value, detected_at) |
| 설명 | 즐겨찾기 대학의 권장과목 변경 시 앱 내 알림 → (향후) 이메일/푸시 |
| 영향 페이지 | 마이페이지 알림함, 대학 상세 페이지 |

### FEAT-12: 협업/상담 공유 모드
| 항목 | 내용 |
|------|------|
| 가치 | **중간** |
| 난이도 | **중간~높음** |
| 우선순위 | **P3** |
| DB 테이블 | `shared_reports` (id, user_id, analysis_id, share_hash, permissions, expires_at) |
| 설명 | 저장된 전략을 읽기전용 링크로 상담교사/학부모와 공유 |
| 영향 페이지 | 마이페이지, 공유 뷰 페이지(신규) |

---

## DB 스키마 요약

```
users
├── user_subjects          (내 과목 세트)
├── user_settings          (학년, 목표 지역 등)
├── favorites              (관심 대학/학과)
├── saved_analyses         (분석 결과 저장)
├── activity_logs          (최근 활동/검색 기록)
├── comparison_links       (비교 링크 이력)
├── recommendations        (개인화 추천)
├── notifications          (알림)
├── notification_preferences (알림 설정)
└── shared_reports         (협업 공유)
```

---

## 스프린트 요약

| 스프린트 | 기능 | 핵심 목표 |
|---------|------|----------|
| **Sprint 1** | FEAT-01~03 + DB 인프라 | 로그인 체감가치 확보 (프로필/즐겨찾기/결과저장) |
| **Sprint 2** | FEAT-04~07 | 접근 정책 정교화 + 탐색 연속성 |
| **Sprint 3** | FEAT-08~10 | 개인화 심화 + 대시보드 |
| **Sprint 4+** | FEAT-11~12 | 알림 시스템 + 협업 기능 |

---

## 참고 문서

- [접근 정책](./access-policy.md) — 로그인/비로그인 기능별 접근 정책
- [로그인 구현 계획](../web/src/app/login/login-plan.md) — OAuth + DB 연동 상세 계획
