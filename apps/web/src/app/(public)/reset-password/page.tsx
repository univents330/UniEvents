"use client";

import {
	Button,
	Container,
	Paper,
	PasswordInput,
	Text,
	Title,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useResetPassword } from "@/features/auth";

export default function ResetPasswordPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token") || "";
	const [password, setPassword] = useState("");
	const resetPassword = useResetPassword();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		resetPassword.mutate({ token, password });
	};

	if (!token) {
		return (
			<Container size={420} my={40}>
				<Title ta="center" c="red">
					Invalid Reset Link
				</Title>
				<Text c="dimmed" size="sm" ta="center" mt={5}>
					The password reset link is invalid or has expired.
				</Text>
			</Container>
		);
	}

	return (
		<Container size={420} my={40}>
			<Title ta="center">Reset your password</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Enter your new password below
			</Text>

			<Paper withBorder shadow="md" p={30} mt={30} radius="md">
				<form onSubmit={handleSubmit}>
					<PasswordInput
						label="New password"
						required
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
						mb="md"
					/>
					<Button type="submit" fullWidth loading={resetPassword.isPending}>
						Reset password
					</Button>
				</form>
			</Paper>
		</Container>
	);
}
