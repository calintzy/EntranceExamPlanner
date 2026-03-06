"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
        style={{ color: "white", background: "var(--brand-blue)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        로그인
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
        style={{ background: menuOpen ? "var(--surface-2)" : "transparent" }}
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--brand-blue)" }}>
            {session.user?.name?.charAt(0) ?? "U"}
          </div>
        )}
        <span className="text-sm font-medium hidden sm:inline" style={{ color: "var(--text-primary)" }}>
          {session.user?.name ?? "사용자"}
        </span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 py-1"
            style={{ background: "var(--surface-1)", border: "1px solid var(--border-medium)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{session.user?.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{session.user?.email}</p>
            </div>
            <button
              onClick={() => { setMenuOpen(false); signOut(); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-red-50 text-red-600"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
