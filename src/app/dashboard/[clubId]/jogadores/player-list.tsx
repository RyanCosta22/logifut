"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayersAction, deletePlayerAction } from "@/actions/player/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, User, Pencil, MoreVertical } from "lucide-react";
import { PlayerForm } from "./player-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlayerListProps {
  clubId: string;
}

const getPositionTheme = (position: string) => {
  const p = position.toLowerCase();
  if (p.includes("goleiro")) return { color: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50", border: "border-orange-100" };
  if (p.includes("zagueiro") || p.includes("lateral")) return { color: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100" };
  if (p.includes("volante") || p.includes("meia")) return { color: "bg-green-500", text: "text-green-600", light: "bg-green-50", border: "border-green-100" };
  if (p.includes("atacante") || p.includes("ponta") || p.includes("centroavante")) return { color: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-100" };
  return { color: "bg-zinc-500", text: "text-zinc-600", light: "bg-zinc-50", border: "border-zinc-100" };
};

export function PlayerList({ clubId }: PlayerListProps) {
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ["players", clubId],
    queryFn: () => getPlayersAction(clubId),
  });

  const deleteMutation = useMutation({
    mutationFn: (playerId: string) => deletePlayerAction(playerId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", clubId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const players = result?.players || [];

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed bg-indigo-50/20">
        <User className="h-12 w-12 text-indigo-300 mb-4" />
        <h3 className="text-lg font-medium text-indigo-900">Nenhum jogador cadastrado</h3>
        <p className="text-indigo-600/70 max-w-xs mx-auto">
          {`Comece adicionando os atletas do seu clube clicando no botão "Novo Atleta".`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {players.map((player: any) => {
        const theme = getPositionTheme(player.position);
        
        return (
          <Card key={player.id} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all group relative bg-white">
            {/* Header Colorido */}
            <div className={`h-24 ${theme.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute -right-4 -bottom-4 opacity-20">
                    <User className="h-24 w-24 text-white -rotate-12" />
                </div>
                
                <div className="absolute top-2 right-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <PlayerForm 
                                clubId={clubId} 
                                player={player} 
                                trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                }
                            />
                            <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                    if (confirm("Deseja realmente excluir este atleta?")) {
                                        deleteMutation.mutate(player.id);
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Foto/Avatar Centralizado */}
            <div className="flex justify-center -mt-12 relative z-10">
                <div className="p-1 bg-white rounded-full shadow-md">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-inner">
                        <AvatarImage src={player.image} className="object-cover" />
                        <AvatarFallback className={`${theme.light} ${theme.text} font-black text-2xl`}>
                            {player.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <CardContent className="p-5 pt-4 text-center">
                <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                        <CardTitle className="text-xl font-black text-zinc-800 line-clamp-1">
                            {player.name}
                        </CardTitle>
                        <span className={`text-xs font-black ${theme.text} ${theme.light} px-2 py-0.5 rounded border ${theme.border}`}>
                            #{player.number || "--"}
                        </span>
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
                        {player.position}
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        <span className="text-[10px] uppercase font-black text-muted-foreground">Nascimento</span>
                        <span className="text-xs font-bold text-zinc-700">
                            {player.birthDate 
                                ? new Date(player.birthDate).toLocaleDateString("pt-BR") 
                                : "Não informado"}
                        </span>
                    </div>
                </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
