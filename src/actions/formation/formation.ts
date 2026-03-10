"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const formationSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  schema: z.string().optional(),
  notes: z.string().optional(),
  clubId: z.string(),
});

export async function createFormationAction(data: z.infer<typeof formationSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const club = await prisma.club.findUnique({
      where: { id: data.clubId, ownerId: session.user.id }
    });
    if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };

    const validatedData = formationSchema.parse(data);

    const formation = await prisma.formation.create({
      data: {
        name: validatedData.name,
        schema: validatedData.schema,
        notes: validatedData.notes,
        clubId: validatedData.clubId,
      },
    });

    revalidatePath(`/dashboard/${data.clubId}/formacoes`);
    return { success: true, formation };
  } catch (error) {
    return { error: "Erro ao cadastrar formação", success: false };
  }
}

export async function updateFormationAction(id: string, data: z.infer<typeof formationSchema>) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return { error: "Não autorizado", success: false };
  
      const club = await prisma.club.findUnique({
        where: { id: data.clubId, ownerId: session.user.id }
      });
      if (!club) return { error: "Clube não encontrado ou permissão negada", success: false };
  
      const validatedData = formationSchema.parse(data);
  
      const formation = await prisma.formation.update({
        where: { id },
        data: {
          name: validatedData.name,
          schema: validatedData.schema,
          notes: validatedData.notes,
        },
      });
  
      revalidatePath(`/dashboard/${data.clubId}/formacoes`);
      return { success: true, formation };
    } catch (error) {
      return { error: "Erro ao atualizar formação", success: false };
    }
}

export async function getFormationsAction(clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    const formations = await prisma.formation.findMany({
      where: { 
        clubId,
        club: { ownerId: session.user.id }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, formations };
  } catch (error) {
    return { error: "Erro ao buscar formações", success: false };
  }
}

export async function deleteFormationAction(id: string, clubId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Não autorizado", success: false };

    await prisma.formation.delete({
      where: { 
        id,
        club: { ownerId: session.user.id }
      }
    });

    revalidatePath(`/dashboard/${clubId}/formacoes`);
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir formação", success: false };
  }
}
