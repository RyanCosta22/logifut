"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFormationsAction, deleteFormationAction } from "@/actions/formation/formation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Shield, Info, Layout, MoreVertical, Pencil } from "lucide-react";
import { FormationForm } from "./formation-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FormationListProps {
  clubId: string;
}

export function FormationList({ clubId }: FormationListProps) {
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ["formations", clubId],
    queryFn: () => getFormationsAction(clubId),
  });

  const deleteMutation = useMutation({
    mutationFn: (formationId: string) => deleteFormationAction(formationId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations", clubId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  const formations = result?.formations || [];

  if (formations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed bg-zinc-50/20">
        <Shield className="h-12 w-12 text-zinc-300 mb-4" />
        <h3 className="text-lg font-medium text-zinc-900">Nenhuma formação tática</h3>
        <p className="text-zinc-600/70 max-w-xs mx-auto">
          Crie seus esquemas táticos favoritos clicando no botão "Nova Tática".
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {formations.map((formation: any) => (
        <Card key={formation.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
          <div className="h-1.5 bg-zinc-800" />
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800 group-hover:bg-zinc-800 group-hover:text-white transition-colors">
                    <Layout className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-base font-black text-zinc-800 truncate max-w-[150px]">
                        {formation.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-black uppercase bg-zinc-100 text-zinc-600 border-none">
                        Esquema: {formation.schema}
                    </Badge>
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <FormationForm 
                        clubId={clubId} 
                        formation={formation} 
                        trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                        }
                    />
                    <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                            if (confirm("Deseja realmente excluir esta tática?")) {
                                deleteMutation.mutate(formation.id);
                            }
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="mt-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Notas Estratégicas</span>
                <div className="mt-1 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 min-h-[60px] relative overflow-hidden">
                    {formation.notes ? (
                        <>
                            <Info className="h-12 w-12 absolute -right-2 -bottom-2 text-zinc-200/50 -rotate-12" />
                            <p className="italic leading-relaxed relative z-10">{formation.notes}</p>
                        </>
                    ) : (
                        <p className="text-zinc-400 italic">Sem observações táticas registradas para esta formação.</p>
                    )}
                </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
