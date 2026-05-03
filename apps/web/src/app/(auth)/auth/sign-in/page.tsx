import { Suspense } from "react";
import { AuthScreen } from "@/modules/auth";

export default function SignInPage() {
	return (
		<Suspense fallback={null}>
			<AuthScreen mode="login" />
		</Suspense>
	);
}
