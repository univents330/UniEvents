import { prisma } from "@voltaze/db";
import type { CreateUserInput, UpdateUserInput } from "@voltaze/schema";

import { NotFoundError } from "@/common/exceptions/app-error";

export class AuthService {
	async listUsers() {
		return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
	}

	async getUserById(id: string) {
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) throw new NotFoundError("User not found");
		return user;
	}

	async createUser(input: CreateUserInput) {
		return prisma.user.create({ data: input });
	}

	async updateUser(id: string, input: UpdateUserInput) {
		await this.getUserById(id);
		return prisma.user.update({ where: { id }, data: input });
	}
}

export const authService = new AuthService();
