"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompetitionByIdAction } from "@/actions/competition/competition";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Trophy, Calendar, MapPin, Info, Clock, CheckCircle, PauseCircle } from "lucide-react";

export default function CompetitionDetailsPage() {
  const params = useParams<{ clubId: string; competitionId: string }>();
  const router = useRouter();

  const { data: result, isLoading } = useQuery({
    queryKey: ["competition", params.competitionId],
    queryFn: () => getCompetitionByIdAction(params.competitionId, params.clubId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const competition = result?.competition;

  if (!competition) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Competicão não encontrada</h2>
        <Button onClick={() => router.back()} className="mt-4">Voltar</Button>
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
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-none shadow-md overflow-hidden">
          <div className="h-2 bg-amber-500" />
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-100 rounded-full text-amber-600">
                <Trophy className="h-10 w-10" />
              </div>
            </div>
            <CardTitle className="text-center">{competition.name}</CardTitle>
            <CardDescription className="text-center">
              Temporada {competition.year} • {competition.type}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <span className="text-sm text-muted-foreground font-medium">Status</span>
              {getStatusBadge(competition.status)}
            </div>
            {competition.description && (
              <div className="space-y-2">
                <span className="text-sm font-bold text-zinc-700 flex items-center gap-1">
                   <Info className="h-4 w-4" /> Observações
                </span>
                <p className="text-sm text-muted-foreground bg-zinc-50 p-3 rounded-lg border italic">
                  {competition.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-md overflow-hidden">
          <div className="h-2 bg-green-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Partidas nesta Competição
            </CardTitle>
            <CardDescription>Lista de confrontos vinculados a este torneio.</CardDescription>
          </CardHeader>
          <CardContent>
            {competition.matches && competition.matches.length > 0 ? (
              <div className="space-y-3">
                {competition.matches.map((match: any) => (
                  <div key={match.id} className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="bg-zinc-100 p-2 rounded text-center min-w-[60px]">
                        <span className="block text-xs font-bold text-muted-foreground">
                            {new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            {new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">vs {match.opponent}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {match.location || 'Local a definir'}
                        </span>
                      </div>
                    </div>
                    {match.result ? (
                        <Badge variant="default" className="bg-zinc-800 px-3">
                            {match.result}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-zinc-400">Pendente</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-50 border-2 border-dashed rounded-xl">
                <Calendar className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">Nenhuma partida vinculada.</p>
                <Button variant="link" onClick={() => router.push(`/dashboard/${params.clubId}/partidas`)}>
                  Ir para Partidas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
