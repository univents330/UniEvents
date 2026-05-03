import { Suspense } from "react";
import { AuthScreen } from "@/modules/auth";

export default function SignUpPage() {
	return (
		<Suspense fallback={null}>
			<AuthScreen mode="signup" />
		</Suspense>
	);
}
