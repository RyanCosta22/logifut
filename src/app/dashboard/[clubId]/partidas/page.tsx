import { MatchList } from "./match-list";
import { MatchForm } from "./match-form";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Partidas | LogiFut",
  description: "Gerencie as partidas do seu clube",
};

export default async function MatchesPage({ params }: { params: Promise<{ clubId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-600 to-green-500 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendário de Jogos</h1>
            <p className="text-emerald-100">
              Acompanhe confrontos, locais e resultados das partidas.
            </p>
          </div>
        </div>
        <MatchForm clubId={resolvedParams.clubId} />
      </div>

      <MatchList clubId={resolvedParams.clubId} />
    </div>
  );
}
