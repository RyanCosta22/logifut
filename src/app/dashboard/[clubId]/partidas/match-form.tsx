"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMatchAction, updateMatchAction } from "@/actions/match/match";
import { getCompetitionsAction } from "@/actions/competition/competition";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CalendarPlus } from "lucide-react";

const matchSchema = z.object({
  opponent: z.string().min(2, "O adversário deve ter pelo menos 2 caracteres"),
  date: z.string().min(1, "Selecione uma data"),
  location: z.string().optional(),
  result: z.string().optional(),
  competitionId: z.string().optional().nullable(),
});

type MatchFormValues = z.infer<typeof matchSchema>;

interface MatchFormProps {
  clubId: string;
  match?: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function MatchForm({ clubId, match, trigger, onSuccess }: MatchFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!match;

  const { data: compResult } = useQuery({
    queryKey: ["competitions", clubId],
    queryFn: () => getCompetitionsAction(clubId),
  });

  const competitions = compResult?.competitions || [];

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      opponent: match?.opponent || "",
      date: match?.date ? new Date(match.date).toISOString().slice(0, 16) : "",
      location: match?.location || "",
      result: match?.result || "",
      competitionId: match?.competitionId || "",
    },
  });

  useEffect(() => {
    if (open && match) {
        form.reset({
            opponent: match.opponent,
            date: new Date(match.date).toISOString().slice(0, 16),
            location: match.location || "",
            result: match.result || "",
            competitionId: match.competitionId || "",
        });
    }
  }, [open, match, form]);

  const mutation = useMutation({
    mutationFn: async (values: MatchFormValues) => {
      const payload = {
        ...values,
        clubId,
        competitionId: values.competitionId === "none" ? null : values.competitionId,
      };

      const result = isEditing
        ? await updateMatchAction(match.id, payload)
        : await createMatchAction(payload);

      if (result.error) throw new Error(result.error);
      return result.match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches", clubId] });
      setOpen(false);
      if (!isEditing) form.reset();
      onSuccess?.();
    },
  });

  function onSubmit(values: MatchFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button className="gap-2 bg-white text-emerald-600 hover:bg-emerald-50 shadow-md">
                <CalendarPlus className="h-4 w-4" />
                Agendar Jogo
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Partida" : "Agendar Partida"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os detalhes do confronto." : "Insira os detalhes do próximo confronto ou resultado."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="opponent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adversário</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do time adversário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e Hora</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="competitionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competição (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a competição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {competitions.map((comp: any) => (
                        <SelectItem key={comp.id} value={comp.id}>
                          {comp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Estádio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resultado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Salvar Partida"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
