"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTravelsAction, deleteTravelAction } from "@/actions/travel/travel";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Plane, Calendar, MapPin, ArrowRight, MoreVertical, Pencil } from "lucide-react";
import { TravelForm } from "./travel-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TravelListProps {
  clubId: string;
}

export function TravelList({ clubId }: TravelListProps) {
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ["travels", clubId],
    queryFn: () => getTravelsAction(clubId),
  });

  const deleteMutation = useMutation({
    mutationFn: (travelId: string) => deleteTravelAction(travelId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels", clubId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const travels = result?.travels || [];

  if (travels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed bg-blue-50/30">
        <Plane className="h-12 w-12 text-blue-300 mb-4" />
        <h3 className="text-lg font-medium text-blue-900">Sem viagens planejadas</h3>
        <p className="text-blue-600/70 max-w-xs mx-auto">
          Mantenha a logística do seu time organizada criando um novo plano.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {travels.map((travel: any) => {
        const isPast = new Date(travel.returnDate) < new Date();
        
        return (
          <Card key={travel.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-bold text-blue-900 line-clamp-1">
                  {travel.destination}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "" : "bg-green-500 hover:bg-green-600"}>
                    {isPast ? "Finalizada" : "Programada"}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <TravelForm 
                            clubId={clubId} 
                            travel={travel} 
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                            }
                        />
                        <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                                if (confirm("Deseja realmente cancelar este plano?")) {
                                    deleteMutation.mutate(travel.id);
                                }
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-2">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Ida</span>
                  <span className="text-sm font-semibold">
                    {new Date(travel.departure).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-400" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Volta</span>
                  <span className="text-sm font-semibold">
                    {new Date(travel.returnDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-zinc-50/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Registrado em {new Date(travel.departure).toLocaleDateString("pt-BR")}</span>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
