"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlayerAction, updatePlayerAction } from "@/actions/player/player";
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
import { Loader2, UserPlus, Pencil } from "lucide-react";

const playerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  position: z.string().min(1, "Selecione uma posição"),
  number: z.string().transform((v) => (v === "" ? undefined : Number(v))),
  birthDate: z.string().optional(),
  image: z.string().url("Insira uma URL válida").or(z.literal("")).optional(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  clubId: string;
  player?: any;
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

export function PlayerForm({ clubId, player, trigger, onSuccess }: PlayerFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!player;

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player?.name || "",
      position: player?.position || "",
      number: player?.number?.toString() || "" as any,
      birthDate: player?.birthDate ? new Date(player.birthDate).toISOString().split('T')[0] : "",
      image: player?.image || "",
    },
  });

  useEffect(() => {
    if (open && player) {
        form.reset({
            name: player.name,
            position: player.position,
            number: player.number?.toString() || "" as any,
            birthDate: player.birthDate ? new Date(player.birthDate).toISOString().split('T')[0] : "",
            image: player.image || "",
        });
    }
  }, [open, player, form]);

  const mutation = useMutation({
    mutationFn: async (values: PlayerFormValues) => {
      const payload = {
        ...values,
        number: values.number as number,
        clubId,
      };

      const result = isEditing 
        ? await updatePlayerAction(player.id, payload)
        : await createPlayerAction(payload);

      if (result.error) throw new Error(result.error);
      return result.player;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", clubId] });
      setOpen(false);
      if (!isEditing) form.reset();
      onSuccess?.();
    },
  });

  function onSubmit(values: PlayerFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do jogador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Foto (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/foto.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Cadastrar Atleta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
