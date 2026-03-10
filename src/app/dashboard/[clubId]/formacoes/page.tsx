import { FormationList } from "./formation-list";
import { FormationForm } from "./formation-form";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Formações | LogiFut",
  description: "Gerencie as formações táticas do seu clube",
};

export default async function FormationsPage({ params }: { params: Promise<{ clubId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-800 to-slate-700 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estratégia Tática</h1>
            <p className="text-zinc-300">
              Desenvolva formações e instruções para cada partida.
            </p>
          </div>
        </div>
        <FormationForm clubId={resolvedParams.clubId} />
      </div>

      <FormationList clubId={resolvedParams.clubId} />
    </div>
  );
}
