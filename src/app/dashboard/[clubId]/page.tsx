"use client";

import { useQuery } from "@tanstack/react-query";
import { getClubByIdAction } from "@/actions/club/club";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Contact, Trophy, Users, TrendingUp, TrendingDown, MapPin } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import { Overview } from "./overview";
import { Badge } from "@/components/ui/badge";

export default function ClubDashboardPage() {
  const params = useParams<{ clubId: string }>();
  const router = useRouter();

  const { data: result, isLoading, isPending } = useQuery({
    queryKey: ["club", params.clubId],
    queryFn: () => getClubByIdAction(params.clubId),
  });

  if (isLoading || isPending) {
    return <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  const club = result?.club;
  
  const costData = club?.costs?.reduce((acc: any[], cost: any) => {
    const existing = acc.find(i => i.name === cost.category);
    if (existing) {
      existing.total += cost.amount;
    } else {
      acc.push({ name: cost.category, total: cost.amount });
    }
    return acc;
  }, []) || [];

  const playersByPosition = club?.players?.reduce((acc: any[], player: any) => {
    const existing = acc.find(i => i.name === player.position);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: player.position, value: 1 });
    }
    return acc;
  }, []) || [];

  const stats = [
    {
      title: "Jogadores",
      value: club?._count?.players || 0,
      icon: Contact,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Partidas",
      value: club?._count?.matches || 0,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Competições",
      value: club?._count?.competitions || 0,
      icon: Trophy,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Gasto Total",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        club?.costs?.reduce((acc: number, c: any) => acc + c.amount, 0) || 0
      ),
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo ao painel de controle do <span className="font-bold text-primary">{club?.name}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-md overflow-hidden group hover:shadow-xl transition-all">
            <div className={`h-1 ${stat.color.replace('text', 'bg')}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Overview data={costData} playersData={playersByPosition} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-md border-none">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div>
              <CardTitle className="text-xl font-bold">Próximas Partidas</CardTitle>
              <CardDescription>Calendário imediato do clube.</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {club?.matches?.length !== 0 ? (
              <div className="space-y-4">
                {club?.matches.map((match: any) => (
                  <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border hover:bg-zinc-100 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/${params.clubId}/partidas`)}>
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded border font-bold text-xs text-center min-w-[50px]">
                        {new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm uppercase">vs {match.opponent}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {match.location || 'Local a definir'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-zinc-50/50">
                <Calendar className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                <p className="text-muted-foreground font-medium">Nenhuma partida agendada.</p>
                <button onClick={() => router.push(`/dashboard/${params.clubId}/partidas`)} className="text-sm font-bold text-primary mt-2 hover:underline">Agendar Agora</button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-md border-none">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <div>
              <CardTitle className="text-xl font-bold text-amber-600">Competições Ativas</CardTitle>
              <CardDescription>Em busca do troféu.</CardDescription>
            </div>
            <Trophy className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
             {club?.competitions?.length !== 0 ? (
               <div className="space-y-4">
                 {club?.competitions.map((comp: any) => (
                   <div key={comp.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-black text-amber-900 text-sm">{comp.name}</span>
                        <span className="text-[10px] font-bold text-amber-600 uppercase">{comp.type}</span>
                      </div>
                      <Trophy className="h-4 w-4 text-amber-400" />
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-zinc-50/50">
                <Trophy className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                <p className="text-muted-foreground font-medium">Sem competições ativas.</p>
                <button onClick={() => router.push(`/dashboard/${params.clubId}/competicoes`)} className="text-sm font-bold text-amber-600 mt-2 hover:underline">Inscrever Clube</button>
              </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
