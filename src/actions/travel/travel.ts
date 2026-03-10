"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const travelSchema = z.object({
  destination: z.string().min(2, "O destino deve ter pelo menos 2 caracteres"),
  departure: z.string(),
  returnDate: z.string(),
  clubId: z.string(),
});

export async function createTravelAction(data: z.infer<typeof travelSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const club = await prisma.club.findUnique({
      where: { id: data.clubId, ownerId: session.user.id }
    });
    if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };

    const validatedData = travelSchema.parse(data);

    const travel = await prisma.travelPlan.create({
      data: {
        destination: validatedData.destination,
        departure: new Date(validatedData.departure),
        returnDate: new Date(validatedData.returnDate),
        clubId: validatedData.clubId,
      },
    });

    revalidatePath(`/dashboard/${data.clubId}/viagens`);
    return { success: true, travel };
  } catch (error) {
    return { error: "Erro ao cadastrar viagem", success: false };
  }
}

export async function updateTravelAction(id: string, data: z.infer<typeof travelSchema>) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { error: "Não autorizado", success: false };
  
      const club = await prisma.club.findUnique({
        where: { id: data.clubId, ownerId: session.user.id }
      });
      if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };
  
      const validatedData = travelSchema.parse(data);
  
      const travel = await prisma.travelPlan.update({
        where: { id },
        data: {
          destination: validatedData.destination,
          departure: new Date(validatedData.departure),
          returnDate: new Date(validatedData.returnDate),
        },
      });
  
      revalidatePath(`/dashboard/${data.clubId}/viagens`);
      return { success: true, travel };
    } catch (error) {
      return { error: "Erro ao atualizar viagem", success: false };
    }
}

export async function getTravelsAction(clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const travels = await prisma.travelPlan.findMany({
      where: { 
        clubId,
        club: { ownerId: session.user.id }
      },
      orderBy: { departure: "asc" }
    });

    return { success: true, travels };
  } catch (error) {
    return { error: "Erro ao buscar viagens", success: false };
  }
}

export async function deleteTravelAction(id: string, clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    await prisma.travelPlan.delete({
      where: { 
        id,
        club: { ownerId: session.user.id }
      }
    });

    revalidatePath(`/dashboard/${clubId}/viagens`);
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir viagem", success: false };
  }
}
