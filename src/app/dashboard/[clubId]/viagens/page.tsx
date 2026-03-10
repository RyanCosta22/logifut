import { TravelList } from "./travel-list";
import { TravelForm } from "./travel-form";
import { Plane } from "lucide-react";

export const metadata = {
  title: "Viagens | LogiFut",
  description: "Planeje as viagens do seu clube",
};

export default async function TravelsPage({ params }: { params: Promise<{ clubId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planejamento de Viagens</h1>
            <p className="text-blue-100">
              Gerencie a logística e destinos das suas partidas fora de casa.
            </p>
          </div>
        </div>
        <TravelForm clubId={resolvedParams.clubId} />
      </div>

      <TravelList clubId={resolvedParams.clubId} />
    </div>
  );
}
