"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetitionAction } from "@/actions/competition/competition";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trophy } from "lucide-react";

const competitionSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  year: z.string().transform((v) => Number(v)),
  type: z.string().min(1, "Selecione um tipo"),
  status: z.string().default("ATIVO"),
  description: z.string().optional(),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

interface CompetitionFormProps {
  clubId: string;
}

const TYPES = [
  "Liga", "Copa", "Torneio", "Amistoso", "Regional", "Nacional", "Internacional"
];

const STATUS = [
  { label: "Ativo", value: "ATIVO" },
  { label: "Finalizado", value: "FINALIZADO" },
  { label: "Pausado", value: "PAUSADO" },
];

export function CompetitionForm({ clubId }: CompetitionFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear().toString() as any,
      type: "",
      status: "ATIVO",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CompetitionFormValues) => {
      const result = await createCompetitionAction({
        ...values,
        year: values.year as number,
        clubId,
      });
      if (result.error) throw new Error(result.error);
      return result.competition;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitions", clubId] });
      setOpen(false);
      form.reset();
    },
  });

  function onSubmit(values: CompetitionFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2 bg-white text-amber-600 hover:bg-amber-50">
          <Trophy className="h-4 w-4" />
          Nova Competição
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Competição</DialogTitle>
          <DialogDescription>
            Adicione uma nova competição ao calendário do clube.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Competição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Campeonato Brasileiro 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breve Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Objetivos ou notas sobre a competição..." 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Inicial</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Competição
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
