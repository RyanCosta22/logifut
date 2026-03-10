"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatchesAction, deleteMatchAction } from "@/actions/match/match";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Calendar, MapPin, Trophy, Clock, MoreVertical, Pencil } from "lucide-react";
import { MatchForm } from "./match-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MatchListProps {
  clubId: string;
}

export function MatchList({ clubId }: MatchListProps) {
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ["matches", clubId],
    queryFn: () => getMatchesAction(clubId),
  });

  const deleteMutation = useMutation({
    mutationFn: (matchId: string) => deleteMatchAction(matchId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", clubId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const matches = result?.matches || [];

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed bg-emerald-50/20">
        <Calendar className="h-12 w-12 text-emerald-300 mb-4" />
        <h3 className="text-lg font-medium text-emerald-900">Nenhuma partida agendada</h3>
        <p className="text-emerald-600/70 max-w-xs mx-auto">
          {`Comece agendando os próximos confrontos clicando no botão "Nova Partida".`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {matches.map((match: any) => {
        const matchDate = new Date(match.date);
        const isPast = matchDate < new Date();

        return (
          <Card key={match.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
            <div className={`h-1.5 ${isPast ? 'bg-zinc-400' : 'bg-emerald-500'}`} />
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${isPast ? 'bg-zinc-100 text-zinc-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isPast ? 'Finalizado' : 'Próximo'}
                    </span>
                    {match.competition && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
                            <Trophy className="h-3 w-3" />
                            {match.competition.name}
                        </div>
                    )}
                </div>
                <CardTitle className="text-lg font-black text-zinc-800 line-clamp-1">
                  Vs {match.opponent}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <MatchForm 
                        clubId={clubId} 
                        match={match} 
                        trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                        }
                    />
                    <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                            if (confirm("Deseja realmente excluir este registro?")) {
                                deleteMutation.mutate(match.id);
                            }
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                            {matchDate.toLocaleDateString("pt-BR")}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            {matchDate.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    {match.result ? (
                        <div className="bg-zinc-900 text-white px-3 py-1 rounded-lg font-black text-sm shadow-sm">
                            {match.result}
                        </div>
                    ) : (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-zinc-400">Pendente</Badge>
                    )}
                </div>
                
                {match.location && (
                  <div className="flex items-center gap-2 px-2 text-[11px] font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" />
                    <span className="truncate">{match.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
