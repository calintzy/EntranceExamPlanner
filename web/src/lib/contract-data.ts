// 첨단분야 채용조건형 계약학과 데이터
import rawData from "./contract-tracks.json";

export interface TrackBenefits {
  tuition: string;
  stipend?: string;
  internship?: boolean;
  employment_guarantee?: boolean;
  other?: string;
}

export interface ContractTrack {
  track_id: string;
  university: string;
  department: string;
  corporation: string;
  enrollment: number | null;
  benefits: TrackBenefits;
  program_type: string;
  admission_type?: {
    early?: {
      types: { name: string; method: string }[];
    };
  };
  notes?: string;
}

export interface ContractData {
  year: number;
  last_updated: string;
  summary: {
    total_universities: number;
    total_departments: number;
    total_enrollment: number;
    description: string;
  };
  tracks: ContractTrack[];
  categories: {
    employment_linked: {
      description: string;
      universities: string[];
    };
    early_employment: {
      description: string;
      notes: string;
    };
    military_linked: {
      description: string;
      universities: string[];
    };
  };
}

export const contractData = rawData as unknown as ContractData;

// 기업별 그룹핑
export function getTracksByCorporation(
  tracks: ContractTrack[]
): Record<string, ContractTrack[]> {
  const grouped: Record<string, ContractTrack[]> = {};
  for (const track of tracks) {
    if (!grouped[track.corporation]) grouped[track.corporation] = [];
    grouped[track.corporation].push(track);
  }
  return grouped;
}
