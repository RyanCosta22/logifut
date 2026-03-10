"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const competitionSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  year: z.number().min(2000, "Ano inválido"),
  type: z.string().optional(),
  status: z.string().default("ATIVO"),
  description: z.string().optional(),
  clubId: z.string(),
});

export async function createCompetitionAction(data: z.infer<typeof competitionSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const club = await prisma.club.findUnique({
      where: { id: data.clubId, ownerId: session.user.id }
    });
    if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };

    const validatedData = competitionSchema.parse(data);

    const competition = await prisma.competition.create({
      data: {
        name: validatedData.name,
        year: validatedData.year,
        type: validatedData.type,
        status: validatedData.status,
        description: validatedData.description,
        clubId: validatedData.clubId,
      },
    });

    revalidatePath(`/dashboard/${data.clubId}/competicoes`);
    return { success: true, competition };
  } catch (error) {
    return { error: "Erro ao cadastrar competição", success: false };
  }
}

export async function getCompetitionsAction(clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const competitions = await prisma.competition.findMany({
      where: { 
        clubId,
        club: { ownerId: session.user.id }
      },
      orderBy: { year: "desc" }
    });

    return { success: true, competitions };
  } catch (error) {
    return { error: "Erro ao buscar competições", success: false };
  }
}

export async function getCompetitionByIdAction(id: string, clubId: string) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { error: "Não autorizado", success: false };
  
      const competition = await prisma.competition.findUnique({
        where: { 
          id,
          club: { ownerId: session.user.id }
        },
        include: {
            matches: {
                orderBy: { date: 'desc' }
            }
        }
      });
  
      if (!competition) return { error: "Competição não encontrada", success: false };
  
      return { success: true, competition };
    } catch (error) {
      return { error: "Erro ao buscar detalhes da competição", success: false };
    }
}

export async function deleteCompetitionAction(id: string, clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    await prisma.competition.delete({
      where: { 
        id,
        club: { ownerId: session.user.id }
      }
    });

    revalidatePath(`/dashboard/${clubId}/competicoes`);
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir competição", success: false };
  }
}

export async function updateCompetitionStatusAction(id: string, status: string, clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    await prisma.competition.update({
      where: { 
        id,
        club: { ownerId: session.user.id }
      },
      data: { status }
    });

    revalidatePath(`/dashboard/${clubId}/competicoes`);
    revalidatePath(`/dashboard/${clubId}/competicoes/${id}`);
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar status", success: false };
  }
}
