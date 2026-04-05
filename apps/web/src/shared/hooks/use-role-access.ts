export type AppRole = "USER" | "HOST" | "ADMIN";

export function canAccessRole(role: AppRole | undefined, allowed: AppRole[]) {
	if (!role) {
		return false;
	}

	return allowed.includes(role);
}
