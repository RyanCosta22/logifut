"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCostAction, updateCostAction } from "@/actions/cost/cost";
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
import { Loader2, PlusCircle } from "lucide-react";

const costSchema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres"),
  amount: z.string().transform((v) => Number(v.toString().replace(",", "."))),
  date: z.string().min(1, "Selecione a data"),
  category: z.string().min(1, "Selecione uma categoria"),
});

type CostFormValues = z.infer<typeof costSchema>;

interface CostFormProps {
  clubId: string;
  cost?: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { label: "Equipamentos", value: "Equipamentos" },
  { label: "Salários", value: "Salários" },
  { label: "Transporte", value: "Transporte" },
  { label: "Alimentação", value: "Alimentação" },
  { label: "Saúde", value: "Saúde" },
  { label: "Marketing", value: "Marketing" },
  { label: "Outros", value: "Outros" },
];

export function CostForm({ clubId, cost, trigger, onSuccess }: CostFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!cost;

  const form = useForm<CostFormValues>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      description: cost?.description || "",
      amount: cost?.amount?.toString() || "" as any,
      date: cost?.date ? new Date(cost.date).toISOString().split('T')[0] : "",
      category: cost?.category || "",
    },
  });

  useEffect(() => {
    if (open && cost) {
        form.reset({
            description: cost.description,
            amount: cost.amount.toString(),
            date: new Date(cost.date).toISOString().split('T')[0],
            category: cost.category,
        });
    }
  }, [open, cost, form]);

  const mutation = useMutation({
    mutationFn: async (values: CostFormValues) => {
      const payload = {
        ...values,
        amount: values.amount as number,
        clubId,
      };

      const result = isEditing
        ? await updateCostAction(cost.id, payload)
        : await createCostAction(payload);

      if (result.error) throw new Error(result.error);
      return result.cost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs", clubId] });
      setOpen(false);
      if (!isEditing) form.reset();
      onSuccess?.();
    },
  });

  function onSubmit(values: CostFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="secondary" className="gap-2 bg-white text-emerald-600 hover:bg-emerald-50">
                <PlusCircle className="h-4 w-4" />
                Registrar Gasto
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Lançamento" : "Novo Lançamento Financeiro"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os detalhes do custo." : "Registre uma nova despesa ou custo do clube."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Novos uniformes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0,00" {...field} />
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
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Salvar Lançamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
