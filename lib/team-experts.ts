import pb from "@/lib/pb";
import type { TeamExpert } from "@/types/team";

interface ExpertProfileRecord {
  id: string;
  user?: string;
  full_legal_name?: string;
  profile_photo?: string;
  specialization_type?: string[];
  highest_academic_degree?: string;
  field_of_study?: string;
  bio?: string;
}

const MAX_EXPERTS = 6;

export async function getTeamExperts(): Promise<TeamExpert[]> {
  try {
    const [records, users] = await Promise.all([
      pb.collection("expert_profiles").getFullList({
        filter: 'user.role="expert" && user.is_active=true',
        sort: "-created",
      }),
      pb.collection("users").getFullList({
        filter: 'role="expert" && is_active=true',
      }),
    ]);

    const nameMap = new Map(
      users.map((user) => [user.id as string, user.name as string])
    );

    return (records as unknown as ExpertProfileRecord[])
      .slice(0, MAX_EXPERTS)
      .map((record) => {
        const filename = record.profile_photo;
        return {
          id: record.id,
          name:
            (record.user && nameMap.get(record.user)) ||
            record.full_legal_name ||
            "",
          photoUrl: filename ? pb.files.getUrl(record as never, filename) : null,
          roles: record.specialization_type || [],
          degree: record.highest_academic_degree || null,
          fieldOfStudy: record.field_of_study || null,
          bio: record.bio || "",
        };
      });
  } catch {
    return [];
  }
}