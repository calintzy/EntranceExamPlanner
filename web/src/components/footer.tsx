// 공통 footer 컴포넌트 — 데이터 출처 + 면책 조항
interface FooterProps {
  variant?: "default" | "landing";
}

export function Footer({ variant = "default" }: FooterProps) {
  if (variant === "landing") return null; // 랜딩 페이지는 자체 footer 사용

  return (
    <footer className="border-t border-slate-200 py-8 mt-12">
      <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-400 space-y-2">
        <p>
          데이터 출처: 대입정보포털 adiga.kr (대교협 공식) 및 각 대학 입학처
          모집요강 (2026·2028학년도 기준)
        </p>
        <p>
          본 서비스는 참고용 정보를 제공하며, 대학 입학 전형의 공식 기준이
          아닙니다.
        </p>
        <p>
          정확한 권장과목 및 입시 정보는 반드시 각 대학 입학처 공식 자료를 통해
          확인하시기 바랍니다.
        </p>
      </div>
    </footer>
  );
}
