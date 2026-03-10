"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClubsAction, createClubAction } from "@/actions/club/club";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Plus, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newClubName, setNewClubName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const result = await getClubsAction();
      if (result.error) throw new Error(result.error);
      return result.clubs;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const result = await createClubAction({ name });
      if (result.error) throw new Error(result.error);
      return result.club;
    },
    onSuccess: (club) => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setIsCreating(false);
      setNewClubName("");
      if (club) {
        router.push(`/dashboard/${club.id}`);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const clubs = data || [];

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center mb-12 text-center">
        <Trophy className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight mb-2">LogiFut</h1>
        <p className="text-muted-foreground text-lg max-w-lg">
          Bem-vindo! Para começar a gerenciar sua temporada, selecione um clube existente ou crie um novo.
        </p>
      </div>

      {!isCreating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clubs.map((club: any) => (
            <Card key={club.id} className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50" onClick={() => router.push(`/dashboard/${club.id}`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {club.name.substring(0, 2).toUpperCase()}
                  </div>
                  {club.name}
                </CardTitle>
                <CardDescription>
                  Criado em {new Date(club.createdAt).toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5">
                  Acessar Dashboard
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          <Card className="border-dashed border-2 hover:bg-zinc-50 transition-colors cursor-pointer flex flex-col items-center justify-center p-8 h-full min-h-[160px]" onClick={() => setIsCreating(true)}>
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium text-muted-foreground">Cadastrar Novo Clube</p>
          </Card>
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Novo Clube</CardTitle>
            <CardDescription>Crie o seu clube para começar a gerenciar seus jogadores e competições.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clubName">Nome do Clube</Label>
              <Input
                id="clubName"
                placeholder="Ex: Real Madrid"
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
            <Button 
              disabled={!newClubName || createMutation.isPending} 
              onClick={() => createMutation.mutate(newClubName)}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Clube
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
