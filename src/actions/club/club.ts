"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const clubSchema = z.object({
  name: z.string().min(3, "O nome do clube deve ter pelo menos 3 caracteres"),
  logo: z.string().optional(),
});

export async function createClubAction(data: z.infer<typeof clubSchema>) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        error: "Você precisa estar logado para criar um clube.",
        success: false,
      };
    }

    const validatedData = clubSchema.parse(data);

    const club = await prisma.club.create({
      data: {
        name: validatedData.name,
        logo: validatedData.logo,
        ownerId: session.user.id,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Clube criado com sucesso!",
      club,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        success: false,
      };
    }

    return {
      error: "Ocorreu um erro ao criar o clube. Tente novamente.",
      success: false,
    };
  }
}

export async function getClubsAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        error: "Não autorizado",
        success: false,
      };
    }

    const clubs = await prisma.club.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      clubs,
    };
  } catch (error) {
    return {
      error: "Erro ao buscar clubes.",
      success: false,
    };
  }
}

export async function getClubByIdAction(id: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        error: "Não autorizado",
        success: false,
      };
    }

    const club = await prisma.club.findUnique({
      where: {
        id,
        ownerId: session.user.id,
      },
      include: {
        players: true,
        costs: true,
        matches: {
          orderBy: {
            date: 'asc'
          },
          take: 5
        },
        competitions: {
          where: {
            status: 'ATIVO'
          }
        },
        _count: {
          select: {
            players: true,
            matches: true,
            competitions: true,
          },
        },
      },
    });

    if (!club) {
      return {
        error: "Clube não encontrado.",
        success: false,
      };
    }

    return {
      success: true,
      club,
    };
  } catch (error) {
    return {
      error: "Erro ao buscar detalhes do clube.",
      success: false,
    };
  }
}
