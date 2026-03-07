"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const ROLES = [
  {
    value: "student" as const,
    label: "학생",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    desc: "과목 선택과 대학 탐색을 해요",
  },
  {
    value: "parent" as const,
    label: "학부모",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    desc: "자녀의 입시 전략을 함께 준비해요",
  },
  {
    value: "teacher" as const,
    label: "선생님",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    desc: "학생들의 과목 선택을 안내해요",
  },
];

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 로딩 중
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />
      </div>
    );
  }

  // 비로그인 → 로그인 페이지
  if (!session) {
    router.replace("/login");
    return null;
  }

  // 이미 역할 설정됨 → 홈
  if (session.user.role) {
    router.replace("/");
    return null;
  }

  const handleSelect = async (role: "student" | "parent" | "teacher") => {
    setSaving(true);
    // NextAuth JWT에 role 저장
    await update({ role });
    router.push("/");
  };

  const handleSkip = () => {
    // 역할 선택 없이 홈으로 (다음 로그인 시 다시 표시)
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        {/* 환영 헤더 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-blue)" }}>
              <svg width="22" height="22" viewBox="0 0 512 512" fill="none" aria-hidden="true">
                <path d="M108 160C108 148 118 140 130 140H240C248 140 256 148 256 160V380C256 380 228 360 190 360H130C118 360 108 352 108 340V160Z" fill="white" opacity="0.7"/>
                <path d="M404 160C404 148 394 140 382 140H272C264 140 256 148 256 160V380C256 380 284 360 322 360H382C394 360 404 352 404 340V160Z" fill="white"/>
                <path d="M300 250L330 280L380 210" stroke="#1A56DB" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>입시연구소</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            환영합니다, {session.user.name ?? "사용자"}님!
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            맞춤 경험을 위해 역할을 선택해주세요
          </p>
        </div>

        {/* 역할 선택 카드 */}
        <div className="space-y-3 mb-4">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              disabled={saving}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{
                background: selected === role.value ? "var(--brand-blue)" : "var(--surface-1)",
                color: selected === role.value ? "white" : "var(--text-primary)",
                border: selected === role.value ? "2px solid var(--brand-blue)" : "2px solid var(--border-subtle)",
                transform: selected === role.value ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div
                className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: selected === role.value ? "rgba(255,255,255,0.2)" : "var(--surface-2)",
                  color: selected === role.value ? "white" : "var(--brand-blue)",
                }}
              >
                {role.icon}
              </div>
              <div>
                <p className="font-bold text-base">{role.label}</p>
                <p className="text-sm mt-0.5" style={{ opacity: 0.8 }}>
                  {role.desc}
                </p>
              </div>
              {/* 체크 표시 */}
              {selected === role.value && (
                <svg className="w-6 h-6 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={() => selected && handleSelect(selected as "student" | "parent" | "teacher")}
          disabled={!selected || saving}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{
            background: selected ? "var(--brand-blue)" : "var(--surface-2)",
            color: selected ? "white" : "var(--text-tertiary)",
          }}
        >
          {saving ? "저장 중..." : "시작하기"}
        </button>

        {/* 나중에 선택 */}
        <button
          onClick={handleSkip}
          disabled={saving}
          className="w-full py-3 mt-2 text-sm transition-colors hover:underline"
          style={{ color: "var(--text-tertiary)" }}
        >
          나중에 선택할게요
        </button>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>
          언제든 프로필에서 변경할 수 있어요
        </p>
      </div>
    </div>
  );
}
