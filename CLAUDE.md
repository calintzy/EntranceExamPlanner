# EntranceExamPlanner — 프로젝트 지침서

> 마지막 업데이트: 2026-03-03
> 상태: 리서치 완료 → 실행 단계 진입

---

## 프로젝트 정의

**대학별 권장과목 비교 + 역방향 검색 무료 웹서비스**

2028 고교학점제 전면 시행에 대비하여, 고등학생과 학부모가:
1. 대학별 권장과목을 **횡단 비교** (A대학 vs B대학 같은 학과)
2. 내가 선택한 과목으로 **어떤 대학에 유리한지 역방향 검색**

할 수 있는 서비스. **이 두 기능은 현재 시장에 없다.**

---

## 절대 잊지 말아야 할 것들

### 1. 데이터가 핵심이다 (기능이 아니라)
- 기능 10개 추가 < 데이터 커버리지 6→45개 대학 확장
- 45개 대학 × 20개 학과 = 900+ SEO 페이지 = 경쟁자 0 블루오션
- adiga.kr에 45개 대학 권장과목 PDF가 이미 존재 (대교협 공식)

### 2. SSG가 모든 성장 전략의 전제조건이다
- 현재 CSR (`"use client"`) → SSG 전환 필수
- SSG 없이는 SEO 불가 → 트래픽 유입 불가 → 서비스 존재 불가
- 성장 공식: SEO(70%) + 맘카페 바이럴(20%) + 학교 채널(10%)

### 3. 데이터 출처 문제를 즉시 수정해야 한다
- `course-data.ts:2` — ipsihogu.com이 출처로 기재됨
- `page.tsx:111` — "각 대학교 공식 모집요강" 주장 (불일치)
- 이 불일치는 신뢰를 파괴하고 법적 리스크를 만든다
- **실행 시 첫 번째로 수정할 사항**

### 4. 사용자 검증이 0회다
- 8라운드 32명의 AI 분석보다 학부모 1명의 반응이 더 가치 있다
- 맘카페에 현재 버전 공유 (30분) = 가장 높은 ROI 액션
- 맘카페 34편 시리즈 작성자가 이상적인 첫 사용자 후보

### 5. 분석 마비를 경계하라
- 8라운드 동안 매번 "이것만 하면" 패턴이 반복됨
- 실행은 0회. 더 필요한 것은 9라운드 분석이 아니라 첫 배포
- "완벽한 MVP보다 불완전한 배포가 낫다"

### 6. 국책사업이 게임 체인저다
- 국책사업 없이 2인 투입 → 기대값 악화 (-130만원)
- 국책사업 포함 시 → 기대값 반전 (+500~1,800만원)
- 핵심: 에듀테크 소프트랩 (KERIS), 예비창업패키지 (하반기 7-8월)
- 실패해도 서류 5시간 손실, 성공하면 수천만원 = 비대칭 구조

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| 언어 | TypeScript |
| 배포 | Vercel (예정) |
| 데이터 | JSON 파일 기반 (DB 없음) |

---

## 프로젝트 구조

```
EntranceExamPlanner/
├── web/                          # Next.js 웹 앱
│   ├── src/
│   │   ├── app/                  # 페이지 (App Router)
│   │   │   ├── page.tsx          # 랜딩 페이지 (6개 대학 표시)
│   │   │   ├── layout.tsx        # 레이아웃 (다크모드, 반응형)
│   │   │   ├── globals.css       # 전역 스타일 (Tailwind 4)
│   │   │   └── guide/page.tsx    # 가이드/비교 페이지 (핵심 기능, "use client")
│   │   └── lib/
│   │       ├── course-data.ts    # 6개 대학 권장과목 (하드코딩, JSON 분리 필요)
│   │       └── types.ts          # TypeScript 인터페이스 (UniversityData, AdmissionType 등)
│   ├── package.json              # React 19, Next.js 16.1.6, Tailwind 4
│   ├── tsconfig.json             # TypeScript strict
│   ├── next.config.ts            # Next.js 설정
│   └── postcss.config.mjs        # PostCSS 설정
├── data/                         # 데이터 파일
│   ├── universities/             # 15개 대학 입시 JSON (전형/수능최저/모집인원 풍부, 권장과목 없음)
│   ├── course-guide/             # raw_recommendations.json (6개 대학, course-data.ts와 중복)
│   ├── corporate-tracks/         # all-tracks.json (18개 계약학과, 삼성/SK/LG/현대)
│   ├── schemas/                  # university.schema.json, corporate-track.schema.json
│   ├── meta/                     # target-universities.json (인서울15 + 의대38 + 계약학과)
│   └── medical-schools/          # 비어있음 (미구현)
├── docs/                         # 리서치 및 분석 문서
│   ├── 프로젝트-리서치-종합.md    # 전체 리서치 통합 문서
│   ├── agent-council-*라운드.md  # Agent Council 8라운드 분석
│   ├── agent-council-총평.md     # 6라운드 종합 평가
│   ├── feasibility-report.md     # 현실성 검증
│   ├── 국책사업-조사.md           # 국책사업 TOP 5
│   └── 맘카페 엄마의 실제 사례/   # 맘카페 34편 원문
├── naver_cafe_crawler.py         # 네이버 카페 크롤러 (COOKIE 미설정, 미실행)
├── requirements_crawler.txt      # 크롤러 의존성 (requests)
└── .omc/plans/                   # 실행 계획
    ├── april-mvp-sprint.md       # 8주 67시간 MVP 계획
    └── pivot-strategy.md         # 9개 피봇 옵션 비교
```

---

## 실행 우선순위 (확정)

### Phase 0: 즉시 수정 (30분)
1. `course-data.ts:2` 데이터 출처 표기 수정
2. `page.tsx:111` 출처 문구 정확하게 변경
3. 면책 조항 추가

### Phase 1: SSG + 데이터 확장 (핵심)
1. `"use client"` 제거 → SSG 전환
2. `course-data.ts` 하드코딩 → JSON 분리
3. 데이터 파이프라인 통합 (3곳 산재 → 단일 소스)
4. 45개 대학 데이터 확보 (adiga.kr PDF 기반)
5. `generateStaticParams()`로 대학/학과별 정적 페이지 생성

### Phase 2: 역방향 검색
1. 역인덱스 빌드 (과목 → 대학/학과 매핑)
2. 검색 UI 구현
3. `/subject/[과목명]` 정적 페이지 생성

### Phase 3: SEO + 배포
1. sitemap.xml + robots.txt
2. OG 이미지 동적 생성
3. Google Search Console + 네이버 웹마스터
4. Vercel 프로덕션 배포

### Phase 4: 사용자 검증
1. 맘카페 공유 (34편 시리즈 작성자 접촉)
2. 학부모 3-5명 인터뷰
3. Kill Switch: 3개월 후 월간 UV < 2,000이면 피봇

---

## 데이터 규칙

### Single Source of Truth
- 모든 권장과목 데이터는 `data/course-guide/*.json`에서 관리
- 웹은 이 JSON을 import하여 사용 (하드코딩 금지)
- 데이터 변경은 JSON 파일에서만 발생

### 데이터 정확성
- 모든 데이터는 대학 입학처 공식 모집요강과 교차검증
- 출처를 반드시 명시 (대학명 + 문서명 + 연도)
- 검증되지 않은 데이터는 서비스에 노출하지 않음

### 과목명 정규화
- "확률과 통계" = "확률과통계" 같은 변이 처리 필요
- `data/normalization.json`에서 매핑 관리
- 정규화 함수를 통해 일관된 과목명 사용

---

## 코딩 규칙

### 필수
- TypeScript strict 모드
- 한국어 주석
- Server Component 우선 (SSG/SSR), Client Component는 최소한만
- 모든 페이지에 SEO 메타태그 (title, description, canonical, OG)

### 금지
- `"use client"` 남용 — SSG가 기본, 클라이언트 인터랙션이 필요한 부분만 분리
- 데이터 하드코딩 — 반드시 JSON 파일에서 import
- 출처 없는 데이터 표시 — 법적 리스크

### SEO 필수 요소
- 모든 페이지: 고유한 `<title>`, `<meta description>`
- 학과 페이지: `[대학] [학과] 권장과목 | 입시플래너`
- JSON-LD 구조화 데이터 (BreadcrumbList, FAQPage)
- sitemap.xml 자동 생성

---

## Kill Switch 조건

| 시점 | 조건 | 행동 |
|------|------|------|
| 배포 후 3개월 | 월간 UV < 2,000 | 피봇 (B-1 개발자 도구 비교 또는 A-3 학교별 매칭) |
| 배포 후 3개월 | 월간 UV 2,000-10,000 | 유지 + 최적화 |
| 배포 후 3개월 | 월간 UV > 10,000 | 확장 + 수익화 |
| 국책사업 미선정 | 2026년 하반기 | 투자 규모 재평가 |

---

## 리스크 인지

1. **2022 개정 교육과정**: 현재 데이터 수명 최대 2년, 이후 전면 교체 필요
2. **법적 리스크**: 모집요강 데이터 저작권 — 출처 명시 + 면책 조항 필수
3. **경쟁**: 진학사/adiga.kr이 같은 기능 출시 가능 — 선점이 핵심
4. **시즌성**: 과목 선택 수요는 4-7월 집중 — 타이밍이 중요
