"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCostsAction, inactivateCostAction } from "@/actions/cost/cost";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, DollarSign, Calendar, Tag, TrendingDown, MoreVertical, Pencil, Ban, AlertCircle } from "lucide-react";
import { CostForm } from "./cost-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CostListProps {
  clubId: string;
}

export function CostList({ clubId }: CostListProps) {
  const queryClient = useQueryClient();
  const [inactivateDialogOpen, setInactivateDialogOpen] = useState(false);
  const [selectedCostId, setSelectedCostId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const { data: result, isLoading } = useQuery({
    queryKey: ["costs", clubId],
    queryFn: () => getCostsAction(clubId),
  });

  const inactivateMutation = useMutation({
    mutationFn: (reason: string) => inactivateCostAction(selectedCostId!, clubId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs", clubId] });
      setInactivateDialogOpen(false);
      setSelectedCostId(null);
      setCancellationReason("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const costs = result?.costs || [];
  const activeCosts = costs.filter((c: any) => c.isActive);
  const totalAmount = activeCosts.reduce((acc: number, curr: any) => acc + curr.amount, 0);

  if (costs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed bg-emerald-50/30">
        <DollarSign className="h-12 w-12 text-emerald-300 mb-4" />
        <h3 className="text-lg font-medium text-emerald-900">Nenhum custo registrado</h3>
        <p className="text-emerald-600/70 max-w-xs mx-auto">
          Mantenha a saúde financeira do seu clube registrando todas as despesas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-emerald-50 border-emerald-100 shadow-inner">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-tighter">Fluxo de Caixa (Ativo)</p>
              <h2 className="text-3xl font-black text-emerald-900 tracking-tight">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalAmount)}
              </h2>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1 font-bold">
            {activeCosts.length} Lançamentos
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {costs.map((cost: any) => (
          <Card key={cost.id} className={`overflow-hidden border-none shadow-md hover:shadow-xl transition-all relative ${!cost.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className={`h-1.5 ${cost.isActive ? 'bg-emerald-500' : 'bg-rose-400'}`} />
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 bg-zinc-50/50 border-b">
              <div className="flex items-center gap-2">
                <Tag className={`h-4 w-4 ${cost.isActive ? 'text-emerald-500' : 'text-rose-400'}`} />
                <Badge variant="outline" className={`text-[10px] uppercase font-black ${cost.isActive ? 'border-emerald-200 text-emerald-700' : 'border-rose-200 text-rose-700'}`}>
                  {cost.category}
                </Badge>
                {!cost.isActive && <Badge variant="destructive" className="text-[8px] h-4 uppercase">Inativo</Badge>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <CostForm 
                        clubId={clubId} 
                        cost={cost} 
                        trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                        }
                    />
                    {cost.isActive && (
                        <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                                setSelectedCostId(cost.id);
                                setInactivateDialogOpen(true);
                            }}
                        >
                            <Ban className="mr-2 h-4 w-4" /> Inativar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Descrição</span>
                  <p className="font-black text-zinc-800 line-clamp-1">{cost.description}</p>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Data</span>
                    <div className="flex items-center gap-1 text-sm font-bold text-zinc-600">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {new Date(cost.date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Valor</span>
                    <p className={`text-xl font-black ${cost.isActive ? 'text-emerald-600' : 'text-rose-400 line-through'}`}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cost.amount)}
                    </p>
                  </div>
                </div>
                {!cost.isActive && cost.cancellationReason && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-700 italic flex gap-2">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>Motivo: {cost.cancellationReason}</span>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Inativação */}
      <Dialog open={inactivateDialogOpen} onOpenChange={setInactivateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
                <Ban className="h-5 w-5" /> Inativar Pagamento
            </DialogTitle>
            <DialogDescription>
              Para auditoria, os pagamentos não podem ser excluídos. Justifique a inativação deste lançamento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
                <span className="text-sm font-bold text-zinc-700">Motivo do Cancelamento</span>
                <Textarea 
                    placeholder="Ex: Erro de digitação, serviço cancelado, etc..." 
                    className="resize-none h-24"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInactivateDialogOpen(false)}>Cancelar</Button>
            <Button 
                variant="destructive" 
                disabled={!cancellationReason || inactivateMutation.isPending}
                onClick={() => inactivateMutation.mutate(cancellationReason)}
            >
                {inactivateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Inativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
