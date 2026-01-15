import { getMembers } from "@/lib/api";
import { TeamList } from "@/components/team/team-list";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
    const members = await getMembers();

    return (
        <div className="h-full bg-background flex flex-col p-8">
            <TeamList initialMembers={members} />
        </div>
    );
}
