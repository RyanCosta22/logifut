import { CompetitionList } from "./competition-list";
import { CompetitionForm } from "./competition-form";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Competições | LogiFut",
  description: "Gerencie as competições do seu clube",
};

export default async function CompetitionsPage({ params }: { params: Promise<{ clubId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Competições</h1>
            <p className="text-amber-50">
              Gerencie os campeonatos, ligas e torneios que seu clube disputa.
            </p>
          </div>
        </div>
        <CompetitionForm clubId={resolvedParams.clubId} />
      </div>

      <CompetitionList clubId={resolvedParams.clubId} />
    </div>
  );
}
