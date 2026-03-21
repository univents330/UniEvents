import { randomUUID } from "crypto";

export function generateId(prefix?: string): string {
	const id = randomUUID();
	return prefix ? `${prefix}_${id}` : id;
}
