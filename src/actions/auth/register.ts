"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export async function registerAction(data: z.infer<typeof registerSchema>) {
  try {
    const validatedData = registerSchema.parse(data);

    const userExists = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (userExists) {
      return {
        error: "Este e-mail já está em uso.",
        success: false,
      };
    }

    const hashedPassword = await hash(validatedData.password, 10);

    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Usuário criado com sucesso!",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.message,
        success: false,
      };
    }

    return {
      error: "Ocorreu um erro ao criar sua conta. Tente novamente.",
      success: false,
    };
  }
}
