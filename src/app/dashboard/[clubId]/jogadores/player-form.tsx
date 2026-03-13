"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlayerAction, getUniquePlayerAction, updatePlayerAction } from "@/actions/player/player";
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
import { Loader2, UserPlus } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const playerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  position: z.string().min(1, "Selecione uma posição"),
  number: z.number(),
  birthDate: z.string().optional(),
  image: z.string().url("Insira uma URL válida").or(z.literal("")).optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  clubId: string;
  playerId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void; 
}

const POSITIONS = [
  { label: "Goleiro", value: "Goleiro" },
  { label: "Zagueiro", value: "Zagueiro" },
  { label: "Lateral Direito", value: "Lateral Direito" },
  { label: "Lateral Esquerdo", value: "Lateral Esquerdo" },
  { label: "Volante", value: "Volante" },
  { label: "Meia", value: "Meia" },
  { label: "Ponta Direita", value: "Ponta Direita" },
  { label: "Ponta Esquerda", value: "Ponta Esquerda" },
  { label: "Centroavante", value: "Centroavante" },
];

const EMPTY_VALUES: PlayerFormValues = {
  name: "",
  position: "",
  number: 0,
  birthDate: "",
  image: "",
};

export function PlayerForm({ clubId, playerId, trigger, onSuccess }: PlayerFormProps) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(playerId);
  const queryClient = useQueryClient();

  const { data: playerData, isLoading: loadingPlayer } = useQuery({
    queryKey: ["player", playerId],
    queryFn: () => getUniquePlayerAction(clubId, playerId!),
    enabled: open && Boolean(playerId),
  });

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (playerData?.player) {
      const p = playerData.player;
      form.reset({
        name: p.name,
        position: p.position,
        number: p.number ?? undefined,
        birthDate: p.birthDate ? new Date(p.birthDate).toISOString().split("T")[0] : "",
        image: p.image ?? "",
      });
    }
  }, [playerData, form]);

  useEffect(() => {
    if (!open) {
      form.reset(EMPTY_VALUES);
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: async (values: PlayerFormValues) => {
      const payload = { ...values, clubId };
      const result = isEditing
        ? await updatePlayerAction(playerId!, payload)
        : await createPlayerAction(payload);
      if (result.error) throw new Error(result.error);
      return result.player;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", clubId] });
      setOpen(false);
      onSuccess?.();
    },
  });

  function onSubmit(values: PlayerFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95">
            <UserPlus className="h-4 w-4" />
            Novo Atleta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Atleta" : "Adicionar Atleta"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do jogador." : "Preencha as informações do atleta para cadastrá-lo."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && loadingPlayer ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Nome Completo</FieldLabel>
                  <Input placeholder="Nome do jogador" {...field} />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="position"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Posição</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[form.formState.errors.position]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="number"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Número</FieldLabel>
                    <Input
                      type="number"
                      placeholder="Ex: 10"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value === "" ? undefined : value);
                      }}
                    />
                    <FieldError errors={[form.formState.errors.number]} />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <Field>
                  <FieldLabel>URL da Foto (Opcional)</FieldLabel>
                  <Input placeholder="https://exemplo.com/foto.jpg" {...field} value={field.value ?? ""} />
                  <FieldError errors={[form.formState.errors.image]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Data de Nascimento</FieldLabel>
                  <Input type="date" {...field} value={field.value ?? ""} />
                  <FieldError errors={[form.formState.errors.birthDate]} />
                </Field>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Cadastrar Atleta"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
