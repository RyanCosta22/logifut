"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const costSchema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres"),
  amount: z.number().min(0.01, "O valor deve ser maior que zero"),
  date: z.string(),
  category: z.string().min(1, "Selecione uma categoria"),
  clubId: z.string(),
});

export async function getUniqueCostsAction(clubId: string, id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const cost = await prisma.cost.findUnique({
      where: { 
        id,
        club: { ownerId: session.user.id }
      }
    });

    return { success: true, cost };
  } catch (error) {
    return { error: "Erro ao buscar custo", success: false };
  }
}

export async function createCostAction(data: z.infer<typeof costSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const club = await prisma.club.findUnique({
      where: { id: data.clubId, ownerId: session.user.id }
    });
    if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };

    const validatedData = costSchema.parse(data);

    const cost = await prisma.cost.create({
      data: {
        description: validatedData.description,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        category: validatedData.category,
        clubId: validatedData.clubId,
        isActive: true,
      },
    });

    revalidatePath(`/dashboard/${data.clubId}/custos`);
    return { success: true, cost };
  } catch (error) {
    return { error: "Erro ao cadastrar custo", success: false };
  }
}

export async function updateCostAction(id: string, data: z.infer<typeof costSchema>) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { error: "Não autorizado", success: false };
  
      const club = await prisma.club.findUnique({
        where: { id: data.clubId, ownerId: session.user.id }
      });
      if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };
  
      const validatedData = costSchema.parse(data);
  
      const cost = await prisma.cost.update({
        where: { id },
        data: {
          description: validatedData.description,
          amount: validatedData.amount,
          date: new Date(validatedData.date),
          category: validatedData.category,
        },
      });
  
      revalidatePath(`/dashboard/${data.clubId}/custos`);
      return { success: true, cost };
    } catch (error) {
      return { error: "Erro ao atualizar custo", success: false };
    }
}

export async function inactivateCostAction(id: string, clubId: string, reason: string) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { error: "Não autorizado", success: false };
  
      await prisma.cost.update({
        where: { 
          id,
          club: { ownerId: session.user.id }
        },
        data: {
            isActive: false,
            cancellationReason: reason
        }
      });
  
      revalidatePath(`/dashboard/${clubId}/custos`);
      return { success: true };
    } catch (error) {
      return { error: "Erro ao inativar lançamento", success: false };
    }
}

export async function getCostsAction(clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const costs = await prisma.cost.findMany({
      where: { 
        clubId,
        club: { ownerId: session.user.id }
      },
      orderBy: { date: "desc" }
    });

    return { success: true, costs };
  } catch (error) {
    return { error: "Erro ao buscar custos", success: false };
  }
}
