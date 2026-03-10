import { PlayerList } from "./player-list";
import { PlayerForm } from "./player-form";
import { Users } from "lucide-react";

export const metadata = {
  title: "Jogadores | LogiFut",
  description: "Gerencie os jogadores do seu clube",
};

export default async function PlayersPage({ params }: { params: Promise<{ clubId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Atletas</h1>
            <p className="text-indigo-100">
              Cadastre e organize o elenco completo do seu clube.
            </p>
          </div>
        </div>
        <PlayerForm clubId={resolvedParams.clubId} />
      </div>

      <PlayerList clubId={resolvedParams.clubId} />
    </div>
  );
}
