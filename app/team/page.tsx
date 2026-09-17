import { FounderSection } from "@/components/team/FounderSection";
import { ExpertsSection } from "@/components/team/ExpertsSection";
import { getTeamExperts } from "@/lib/team-experts";

export default async function TeamPage() {
  const experts = await getTeamExperts();

  return (
    <div className="flex min-h-screen flex-col">
      <FounderSection />
      <ExpertsSection experts={experts} />
    </div>
  );
}
