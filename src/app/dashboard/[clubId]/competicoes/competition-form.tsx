"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const competitionSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  year: z.string().min(1, "Selecione um ano"),
  type: z.string().min(1, "Selecione um tipo"),
  status: z.string().min(1, "Selecione um status"),
  description: z.string().optional(),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

interface CompetitionFormProps {
  clubId: string;
}

const TYPES = [
  "Liga",
  "Copa",
  "Torneio",
  "Amistoso",
  "Regional",
  "Nacional",
  "Internacional",
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
      year: "",
      type: "",
      status: "ATIVO",
      description: "",
    },
  });

  const { control, handleSubmit } = form;

  const mutation = useMutation({
    mutationFn: async (values: CompetitionFormValues) => {
      const result = await createCompetitionAction({
        ...values,
        year: new Date(values.year).getFullYear().toString(),
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
        <Button
          variant="secondary"
          className="gap-2 bg-white text-amber-600 hover:bg-amber-50"
        >
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Nome da Competição</FieldLabel>
                  <Input
                    placeholder="Ex: Campeonato Brasileiro 2026"
                    {...field}
                  />
                  <FieldError>{form.formState.errors.name?.message}</FieldError>
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="year"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Ano</FieldLabel>
                    <Input type="date" {...field} />
                    <FieldError>
                      {form.formState.errors.year?.message}
                    </FieldError>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Tipo</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>
                      {form.formState.errors.type?.message}
                    </FieldError>
                  </Field>
                )}
              />
            </div>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Breve Descrição (Opcional)</FieldLabel>
                  <Textarea
                    placeholder="Objetivos ou notas sobre a competição..."
                    className="resize-none h-20"
                    {...field}
                  />
                  <FieldError>
                    {form.formState.errors.description?.message}
                  </FieldError>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Status Inicial</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>
                    {form.formState.errors.status?.message}
                  </FieldError>
                </Field>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Competição
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
