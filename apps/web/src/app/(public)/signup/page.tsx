import { Suspense } from "react";
import { AuthScreen } from "../_components/auth-screen";

export default function SignupPage() {
	return (
		<Suspense fallback={null}>
			<AuthScreen mode="signup" />
		</Suspense>
	);
}
