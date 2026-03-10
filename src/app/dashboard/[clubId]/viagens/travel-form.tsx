"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTravelAction, updateTravelAction } from "@/actions/travel/travel";
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
import { Loader2, PlaneTakeoff } from "lucide-react";

const travelSchema = z.object({
  destination: z.string().min(2, "O destino deve ter pelo menos 2 caracteres"),
  departure: z.string().min(1, "Selecione a data de ida"),
  returnDate: z.string().min(1, "Selecione a data de volta"),
});

type TravelFormValues = z.infer<typeof travelSchema>;

interface TravelFormProps {
  clubId: string;
  travel?: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TravelForm({ clubId, travel, trigger, onSuccess }: TravelFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!travel;

  const form = useForm<TravelFormValues>({
    resolver: zodResolver(travelSchema),
    defaultValues: {
      destination: travel?.destination || "",
      departure: travel?.departure ? new Date(travel.departure).toISOString().slice(0, 16) : "",
      returnDate: travel?.returnDate ? new Date(travel.returnDate).toISOString().slice(0, 16) : "",
    },
  });

  useEffect(() => {
    if (open && travel) {
        form.reset({
            destination: travel.destination,
            departure: new Date(travel.departure).toISOString().slice(0, 16),
            returnDate: new Date(travel.returnDate).toISOString().slice(0, 16),
        });
    }
  }, [open, travel, form]);

  const mutation = useMutation({
    mutationFn: async (values: TravelFormValues) => {
      const result = isEditing
        ? await updateTravelAction(travel.id, { ...values, clubId })
        : await createTravelAction({ ...values, clubId });

      if (result.error) throw new Error(result.error);
      return result.travel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travels", clubId] });
      setOpen(false);
      if (!isEditing) form.reset();
      onSuccess?.();
    },
  });

  function onSubmit(values: TravelFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="secondary" className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
                <PlaneTakeoff className="h-4 w-4" />
                Planejar Viagem
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Viagem" : "Novo Plano de Viagem"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os detalhes da viagem." : "Insira o destino e as datas da próxima viagem do clube."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rio de Janeiro, RJ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Ida</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Volta</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={mutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Confirmar Viagem"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
