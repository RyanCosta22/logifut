"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompetitionsAction, deleteCompetitionAction, updateCompetitionStatusAction } from "@/actions/competition/competition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Trash2, Trophy, Calendar, MoreVertical, CheckCircle, Clock, PauseCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface CompetitionListProps {
  clubId: string;
}

export function CompetitionList({ clubId }: CompetitionListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ["competitions", clubId],
    queryFn: () => getCompetitionsAction(clubId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCompetitionAction(id, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions", clubId] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      updateCompetitionStatusAction(id, status, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions", clubId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const competitions = result?.competitions || [];

  if (competitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed bg-amber-50/30">
        <Trophy className="h-12 w-12 text-amber-300 mb-4" />
        <h3 className="text-lg font-medium text-amber-900">Nenhuma competição cadastrada</h3>
        <p className="text-amber-600/70 max-w-xs mx-auto">
          Adicione os campeonatos que seu clube está disputando para acompanhar o progresso.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ATIVO":
        return <Badge className="bg-green-500 hover:bg-green-600"><Clock className="h-3 w-3 mr-1" /> Em Curso</Badge>;
      case "FINALIZADO":
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" /> Finalizado</Badge>;
      case "PAUSADO":
        return <Badge variant="outline" className="text-amber-600 border-amber-600"><PauseCircle className="h-3 w-3 mr-1" /> Pausado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {competitions.map((comp: any) => (
        <Card key={comp.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all border-l-4 border-l-amber-500 group">
          <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] font-bold text-amber-700 border-amber-200 uppercase">
                  {comp.type}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {comp.year}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-zinc-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
                {comp.name}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${clubId}/competicoes/${comp.id}`)}>
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: comp.id, status: "ATIVO" })}>
                  Definir como Ativo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: comp.id, status: "PAUSADO" })}>
                  Pausar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: comp.id, status: "FINALIZADO" })}>
                  Finalizar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => {
                    if (confirm("Deseja excluir esta competição?")) {
                      deleteMutation.mutate(comp.id);
                    }
                  }}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="flex items-center justify-between mt-2 p-2 bg-zinc-50 rounded-lg">
              <span className="text-xs font-medium text-muted-foreground">Status Atual</span>
              {getStatusBadge(comp.status)}
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-zinc-50/50 flex justify-end">
             <Button 
                onClick={() => router.push(`/dashboard/${clubId}/competicoes/${comp.id}`)}
                variant="link" 
                className="text-xs text-amber-600 h-auto p-0 font-bold uppercase tracking-wider"
             >
               Ver Detalhes →
             </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
