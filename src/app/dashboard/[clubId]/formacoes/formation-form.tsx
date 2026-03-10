"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFormationAction, updateFormationAction } from "@/actions/formation/formation";
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
import { Loader2, ShieldPlus } from "lucide-react";

const formationSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  schema: z.string().min(1, "Selecione um esquema tático"),
  notes: z.string().optional(),
});

type FormationFormValues = z.infer<typeof formationSchema>;

interface FormationFormProps {
  clubId: string;
  formation?: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const SCHEMAS = [
  "4-4-2", "4-3-3", "3-5-2", "4-5-1", "4-2-3-1", "3-4-3", "5-3-2", "5-4-1"
];

export function FormationForm({ clubId, formation, trigger, onSuccess }: FormationFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!formation;

  const form = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      name: formation?.name || "",
      schema: formation?.schema || "",
      notes: formation?.notes || "",
    },
  });

  useEffect(() => {
    if (open && formation) {
        form.reset({
            name: formation.name,
            schema: formation.schema,
            notes: formation.notes || "",
        });
    }
  }, [open, formation, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormationFormValues) => {
      const payload = {
        ...values,
        clubId,
      };

      const result = isEditing
        ? await updateFormationAction(formation.id, payload)
        : await createFormationAction(payload);

      if (result.error) throw new Error(result.error);
      return result.formation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations", clubId] });
      setOpen(false);
      if (!isEditing) form.reset();
      onSuccess?.();
    },
  });

  function onSubmit(values: FormationFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button className="gap-2 bg-white text-zinc-800 hover:bg-zinc-50 shadow-md">
                <ShieldPlus className="h-4 w-4" />
                Nova Tática
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Formação" : "Criar Formação"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os detalhes da sua tática." : "Defina o nome e o esquema tático da nova formação."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Tática</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tática Ofensiva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Esquema Tático</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um esquema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCHEMAS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas/Instruções (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instruções para os jogadores..." 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-zinc-800 hover:bg-zinc-900">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Salvar Tática"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
