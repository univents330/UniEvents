import { ProtectedRoute } from "@/core/components/protected-route";
import { ProfileView } from "@/modules/profile";

export default function ProfilePage() {
	return (
		<ProtectedRoute>
			<ProfileView />
		</ProtectedRoute>
	);
}
