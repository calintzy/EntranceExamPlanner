import type { MetadataRoute } from "next";
import { courseData } from "@/lib/course-data";
import { getAllSubjects } from "@/lib/course-utils";
import { BASE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // 정적 페이지
  entries.push(
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/guide`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  );

  // 대학별 페이지
  for (const university of Object.keys(courseData)) {
    entries.push({
      url: `${BASE_URL}/university/${encodeURIComponent(university)}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });

    // 학과별 페이지
    for (const dept of Object.keys(courseData[university])) {
      entries.push({
        url: `${BASE_URL}/university/${encodeURIComponent(university)}/${encodeURIComponent(dept)}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // 과목별 페이지
  for (const subject of getAllSubjects(courseData)) {
    entries.push({
      url: `${BASE_URL}/subject/${encodeURIComponent(subject)}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
