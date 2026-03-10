"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const matchSchema = z.object({
  opponent: z.string().min(2, "O adversário deve ter pelo menos 2 caracteres"),
  date: z.string(),
  location: z.string().optional(),
  result: z.string().optional(),
  clubId: z.string(),
  competitionId: z.string().optional().nullable(),
});

export async function createMatchAction(data: z.infer<typeof matchSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const club = await prisma.club.findUnique({
      where: { id: data.clubId, ownerId: session.user.id }
    });
    if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };

    const validatedData = matchSchema.parse(data);

    const match = await prisma.match.create({
      data: {
        opponent: validatedData.opponent,
        date: new Date(validatedData.date),
        location: validatedData.location,
        result: validatedData.result,
        clubId: validatedData.clubId,
        competitionId: validatedData.competitionId || null,
      },
    });

    revalidatePath(`/dashboard/${data.clubId}/partidas`);
    if (validatedData.competitionId) {
        revalidatePath(`/dashboard/${data.clubId}/competicoes/${validatedData.competitionId}`);
    }
    return { success: true, match };
  } catch (error) {
    return { error: "Erro ao cadastrar partida", success: false };
  }
}

export async function updateMatchAction(id: string, data: z.infer<typeof matchSchema>) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { error: "Não autorizado", success: false };
  
      const club = await prisma.club.findUnique({
        where: { id: data.clubId, ownerId: session.user.id }
      });
      if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };
  
      const validatedData = matchSchema.parse(data);
  
      const match = await prisma.match.update({
        where: { id },
        data: {
          opponent: validatedData.opponent,
          date: new Date(validatedData.date),
          location: validatedData.location,
          result: validatedData.result,
          competitionId: validatedData.competitionId || null,
        },
      });
  
      revalidatePath(`/dashboard/${data.clubId}/partidas`);
      if (validatedData.competitionId) {
          revalidatePath(`/dashboard/${data.clubId}/competicoes/${validatedData.competitionId}`);
      }
      return { success: true, match };
    } catch (error) {
      return { error: "Erro ao atualizar partida", success: false };
    }
}

export async function getMatchesAction(clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const matches = await prisma.match.findMany({
      where: { 
        clubId,
        club: { ownerId: session.user.id }
      },
      include: {
          competition: {
              select: { name: true }
          }
      },
      orderBy: { date: "desc" }
    });

    return { success: true, matches };
  } catch (error) {
    return { error: "Erro ao buscar partidas", success: false };
  }
}

export async function deleteMatchAction(id: string, clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const match = await prisma.match.findUnique({
        where: { id }
    });

    await prisma.match.delete({
      where: { 
        id,
        club: { ownerId: session.user.id }
      }
    });

    revalidatePath(`/dashboard/${clubId}/partidas`);
    if (match?.competitionId) {
        revalidatePath(`/dashboard/${clubId}/competicoes/${match.competitionId}`);
    }
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir partida", success: false };
  }
}
