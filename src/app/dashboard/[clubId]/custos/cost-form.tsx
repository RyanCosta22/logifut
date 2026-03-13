"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCostAction,
  getUniqueCostsAction,
  updateCostAction,
} from "@/actions/cost/cost";
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
import { Loader2, PlusCircle } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const costSchema = z.object({
  description: z
    .string()
    .min(2, "A descrição deve ter pelo menos 2 caracteres"),
  amount: z.number(),
  date: z.string().min(1, "Selecione uma data"),
  category: z.string().min(1, "Selecione uma categoria"),
});

type CostFormInput = z.input<typeof costSchema>;
type CostFormValues = z.output<typeof costSchema>;

interface CostFormProps {
  clubId: string;
  costId?: string;
  trigger?: React.ReactNode;
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

const EMPTY_VALUES: CostFormValues = {
  description: "",
  amount: 0,
  date: "",
  category: "",
};

export function CostForm({ clubId, costId, trigger }: CostFormProps) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(costId);
  const queryClient = useQueryClient();

  const { data: costData, isLoading: loadingCost } = useQuery({
    queryKey: ["cost", costId],
    queryFn: () => getUniqueCostsAction(clubId, costId!),
    enabled: open && Boolean(costId),
  });

  const form = useForm<CostFormInput>({
    resolver: zodResolver(costSchema),
    defaultValues: EMPTY_VALUES,
  });
  const { register } = form;

  useEffect(() => {
    if (costData?.cost) {
      const c = costData.cost;
      form.reset({
        description: c.description,
        amount: c.amount,
        date: new Date(c.date).toISOString().split("T")[0],
        category: c.category,
      });
    }
  }, [costData, form]);

  useEffect(() => {
    if (!open) {
      form.reset(EMPTY_VALUES);
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: async (values: CostFormValues) => {
      const payload = { ...values, clubId };
      const result = editing
        ? await updateCostAction(costId!, payload)
        : await createCostAction(payload);
      if (result.error) throw new Error(result.error);
      return result.cost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs", clubId] });
      setOpen(false);
    },
  });

  const onSubmit = (values: CostFormValues) => {
    mutation.mutate(values);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="secondary"
            className="gap-2 bg-white text-emerald-600 hover:bg-emerald-50"
          >
            <PlusCircle className="h-4 w-4" />
            Registrar Gasto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar Lançamento" : "Novo Lançamento Financeiro"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Atualize os detalhes do custo."
              : "Registre uma nova despesa ou custo do clube."}
          </DialogDescription>
        </DialogHeader>

        {editing && loadingCost ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Descrição</FieldLabel>
                  <Input placeholder="Ex: Novos uniformes" {...field} />
                  <FieldError errors={[form.formState.errors.description]} />
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Valor (R$)</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="border-2 pl-10"
                  {...register("amount", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.amount]} />
              </Field>

              <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Data</FieldLabel>
                    <Input type="date" {...field} />
                    <FieldError errors={[form.formState.errors.date]} />
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Categoria</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.category]} />
                </Field>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editing ? "Salvar Alterações" : "Salvar Lançamento"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
