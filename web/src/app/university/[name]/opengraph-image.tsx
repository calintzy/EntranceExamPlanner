import { ImageResponse } from "next/og";
import { courseData } from "@/lib/course-data";
import { getUniversityList, getDepartments } from "@/lib/course-utils";

export const alt = "대학 권장과목";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getUniversityList(courseData).map((name) => ({ name }));
}

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const univName = decodeURIComponent(name);
  const departments = getDepartments(courseData, univName);
  const deptLabel = departments.slice(0, 8).join(" · ");
  const extra = departments.length > 8 ? ` 외 ${departments.length - 8}개` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e3a5f 100%)",
          padding: "60px",
        }}
      >
        <div style={{ display: "flex", fontSize: "24px", color: "#94a3b8", marginBottom: "16px" }}>
          {`입시플래너`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {univName}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "#60a5fa", marginBottom: "32px" }}>
          {`${departments.length}개 학과 권장과목`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "18px",
            color: "#cbd5e1",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.6,
          }}
        >
          {`${deptLabel}${extra}`}
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "30px",
            right: "40px",
            fontSize: "16px",
            color: "#64748b",
          }}
        >
          {`2026·2028학년도 기준`}
        </div>
      </div>
    ),
    { ...size }
  );
}
