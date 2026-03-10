import { CostList } from "./cost-list";
import { CostForm } from "./cost-form";
import { DollarSign } from "lucide-react";

export const metadata = {
  title: "Custos | LogiFut",
  description: "Controle financeiro do seu clube",
};
  
export default async function CostsPage({ params }: { params: Promise<{ clubId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-600 to-green-500 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle de Custos</h1>
            <p className="text-emerald-100">
              Gerencie as finanças, despesas e investimentos do seu clube.
            </p>
          </div>
        </div>
        <CostForm clubId={resolvedParams.clubId} />
      </div>

      <CostList clubId={resolvedParams.clubId} />
    </div>
  );
}
