// 교과 선택 가이드 데이터 타입

export interface DepartmentCourses {
  core: string;
  recommended: string;
}

export interface UniversityCourseData {
  [department: string]: DepartmentCourses;
}

export interface CourseRecommendationData {
  [university: string]: UniversityCourseData;
}

// 대학 입시 데이터 타입
export interface AdmissionType {
  type_name: string;
  sub_type: string;
  enrollment: number;
  evaluation: {
    elements: { name: string; ratio: number }[];
  };
  csat_minimum?: {
    required: boolean;
    description?: string;
    subjects_count?: number;
    grade_sum?: number;
  };
}

export interface UniversityData {
  university_id: string;
  name: string;
  name_short: string;
  location: string;
  campus: string;
  website: string;
  year: number;
  total_enrollment?: number;
  admissions: {
    early: {
      total?: number;
      types: AdmissionType[];
    };
    regular: {
      total: number;
      group: string;
      csat_reflection?: {
        by_track?: Record<string, Record<string, number>>;
        english_method?: string;
        explore_count?: number;
      };
    };
  };
  key_changes_2026?: string[];
  special_notes?: string;
}
