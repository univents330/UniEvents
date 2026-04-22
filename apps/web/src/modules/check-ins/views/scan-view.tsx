"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/core/lib/api-error";
import { useAuth } from "@/core/providers/auth-provider";
import { useEvents } from "@/modules/events";
import { useValidatePass } from "@/modules/passes";
import { Button } from "@/shared/ui/button";
import { SectionTitle } from "@/shared/ui/section-title";
import { Select } from "@/shared/ui/select";
import { useCreateCheckIn } from "../hooks/use-check-ins";

type ScanSuccess = {
	passCode: string;
	attendeeId: string;
	eventId: string;
};

export function ScanView() {
	const [scannedCode, setScannedCode] = useState<string | null>(null);
	const [status, setStatus] = useState<
		"idle" | "processing" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [selectedEventId, setSelectedEventId] = useState("");
	const [scannerKey, setScannerKey] = useState(0);
	const [successData, setSuccessData] = useState<ScanSuccess | null>(null);

	const createCheckIn = useCreateCheckIn();
	const validatePass = useValidatePass();
	const { user } = useAuth();

	const eventsQuery = useEvents({
		userId: user?.role === "HOST" ? user.id : undefined,
		status: "PUBLISHED",
		limit: 100,
		sortBy: "startDate",
		sortOrder: "asc",
	});

	const scannerId = useMemo(() => `reader-${scannerKey}`, [scannerKey]);
	const canScan = status === "idle" && Boolean(selectedEventId);

	const processScan = useCallback(
		async (code: string, eventId: string) => {
			setStatus("processing");
			setErrorMessage("");
			try {
				const validation = await validatePass.mutateAsync({ code, eventId });

				if (!validation.valid || !validation.pass) {
					throw new Error(
						validation.message || "Invalid or already used pass.",
					);
				}

				await createCheckIn.mutateAsync({
					attendeeId: validation.pass.attendeeId,
					eventId: validation.pass.eventId,
					method: "QR_SCAN",
				});

				setSuccessData({
					passCode: code,
					attendeeId: validation.pass.attendeeId,
					eventId: validation.pass.eventId,
				});
				setStatus("success");
			} catch (error) {
				setStatus("error");
				setErrorMessage(
					getApiErrorMessage(error, "Invalid or already used pass."),
				);
			}
		},
		[validatePass, createCheckIn],
	);

	useEffect(() => {
		if (!canScan) {
			return;
		}

		const scanner = new Html5QrcodeScanner(
			scannerId,
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			false,
		);

		const onScanSuccess = (decodedText: string) => {
			setScannedCode(decodedText);
			void scanner.clear();
			void processScan(decodedText, selectedEventId);
		};

		const onScanFailure = (_error: unknown) => {
			// ignore standard failures until match
		};

		scanner.render(onScanSuccess, onScanFailure);

		return () => {
			scanner.clear().catch(console.error);
		};
	}, [canScan, scannerId, selectedEventId, processScan]);

	function resetScanner() {
		setScannedCode(null);
		setSuccessData(null);
		setErrorMessage("");
		setStatus("idle");
		setScannerKey((prev) => prev + 1);
	}

	return (
		<div className="mx-auto max-w-xl space-y-8">
			<SectionTitle
				eyebrow="Scanner"
				title="Scan Attendee Passes"
				description="Use your camera to scan QR passes at the door."
			/>

			<div className="panel-soft rounded-xl p-4 md:p-5">
				<label htmlFor="event-select" className="block space-y-2">
					<span className="font-semibold text-[#5f6984] text-xs uppercase tracking-wide">
						Select event
					</span>
					<Select
						id="event-select"
						value={selectedEventId}
						onChange={(e) => {
							setSelectedEventId(e.target.value);
							if (status !== "idle") {
								resetScanner();
							}
						}}
						disabled={eventsQuery.isLoading}
					>
						<option value="">Choose an event</option>
						{(eventsQuery.data?.data ?? []).map((event) => (
							<option key={event.id} value={event.id}>
								{event.name}
							</option>
						))}
					</Select>
				</label>
			</div>

			<div className="panel-soft overflow-hidden rounded-xl p-4 md:p-6">
				{status === "idle" && !selectedEventId && (
					<div className="rounded-lg border border-[#d4def8] border-dashed bg-[#f7f9ff] px-4 py-10 text-center text-[#5f6984]">
						Choose an event to start scanning attendee passes.
					</div>
				)}

				{status === "idle" && selectedEventId && (
					<div
						id={scannerId}
						className="overflow-hidden rounded-lg border-2 border-[#d4def8] border-dashed"
					/>
				)}

				{status === "processing" && (
					<div className="py-12 text-center text-[#5f6984]">
						<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#1264db] border-t-transparent" />
						<p className="font-medium">Validating pass...</p>
					</div>
				)}

				{status === "success" && (
					<div className="py-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
							<svg
								className="h-8 w-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								role="img"
								aria-label="Success checkmark"
							>
								<title>Success</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<p className="font-bold text-green-700 text-xl">
							Check-in Successful!
						</p>
						<p className="mt-2 text-[#5f6984]">
							Pass code:{" "}
							<span className="font-mono">
								{successData?.passCode ?? scannedCode}
							</span>
						</p>
						<p className="mt-1 text-[#5f6984] text-sm">
							Attendee:{" "}
							<span className="font-mono">{successData?.attendeeId}</span>
						</p>
						<Button className="mt-6" onClick={resetScanner}>
							Scan Next
						</Button>
					</div>
				)}

				{status === "error" && (
					<div className="py-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
							<svg
								className="h-8 w-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								role="img"
								aria-label="Error cross"
							>
								<title>Error</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
						<p className="font-bold text-lg text-red-700">Invalid Pass</p>
						<p className="text-slate-600">{errorMessage}</p>
						<Button className="mt-6" variant="ghost" onClick={resetScanner}>
							Try Again
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
