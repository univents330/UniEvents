import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/ui/page-header";

export default function UserSettingsPage() {
	return (
		<div className="space-y-4 sm:space-y-6">
			<PageHeader
				title="Settings"
				description="Manage your account settings and preferences"
			/>

			<div className="space-y-4 sm:space-y-6">
				<div className="rounded-lg border border-slate-200 bg-white p-4 sm:rounded-xl sm:p-6">
					<h2 className="font-semibold text-base text-slate-900 sm:text-lg">
						Account Preferences
					</h2>
					<p className="mt-1 text-slate-600 text-xs sm:text-sm">
						Update your account settings.
					</p>
					<div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4">
						<Button
							variant="outline"
							className="w-full text-sm sm:py-2 sm:text-base"
						>
							Change Password
						</Button>
						<Button
							variant="outline"
							className="w-full text-sm sm:py-2 sm:text-base"
						>
							Email Preferences
						</Button>
						<Button
							variant="outline"
							className="w-full text-sm sm:py-2 sm:text-base"
						>
							Notification Settings
						</Button>
					</div>
				</div>

				<div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:rounded-xl sm:p-6">
					<h2 className="font-semibold text-base text-red-900 sm:text-lg">
						Danger Zone
					</h2>
					<p className="mt-1 text-red-800 text-xs sm:text-sm">
						Irreversible actions.
					</p>
					<Button
						variant="destructive"
						className="mt-4 w-full text-sm sm:mt-6 sm:py-2 sm:text-base"
					>
						Delete Account
					</Button>
				</div>
			</div>
		</div>
	);
}
