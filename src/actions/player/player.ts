"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const playerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  position: z.string().min(2, "Selecione uma posição válida"),
  number: z.number().optional(),
  birthDate: z.string().optional(),
  image: z.string().optional().nullable(),
  clubId: z.string(),
});

export async function createPlayerAction(data: z.infer<typeof playerSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const club = await prisma.club.findUnique({
      where: { id: data.clubId, ownerId: session.user.id }
    });
    if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };

    const validatedData = playerSchema.parse(data);

    const player = await prisma.player.create({
      data: {
        name: validatedData.name,
        position: validatedData.position,
        number: validatedData.number,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
        image: validatedData.image,
        clubId: validatedData.clubId,
      },
    });

    revalidatePath(`/dashboard/${data.clubId}/jogadores`);
    return { success: true, player };
  } catch (error) {
    return { error: "Erro ao cadastrar jogador", success: false };
  }
}

export async function updatePlayerAction(id: string, data: z.infer<typeof playerSchema>) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { error: "Não autorizado", success: false };
  
      const club = await prisma.club.findUnique({
        where: { id: data.clubId, ownerId: session.user.id }
      });
      if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };
  
      const validatedData = playerSchema.parse(data);
  
      const player = await prisma.player.update({
        where: { id },
        data: {
          name: validatedData.name,
          position: validatedData.position,
          number: validatedData.number,
          birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
          image: validatedData.image,
        },
      });
  
      revalidatePath(`/dashboard/${data.clubId}/jogadores`);
      return { success: true, player };
    } catch (error) {
      return { error: "Erro ao atualizar jogador", success: false };
    }
}

export async function getPlayersAction(clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const players = await prisma.player.findMany({
      where: { 
        clubId,
        club: { ownerId: session.user.id }
      },
      orderBy: { name: "asc" }
    });

    return { success: true, players };
  } catch (error) {
    return { error: "Erro ao buscar jogadores", success: false };
  }
}

export async function deletePlayerAction(id: string, clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    await prisma.player.delete({
      where: { 
        id,
        club: { ownerId: session.user.id }
      }
    });

    revalidatePath(`/dashboard/${clubId}/jogadores`);
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir jogador", success: false };
  }
}
