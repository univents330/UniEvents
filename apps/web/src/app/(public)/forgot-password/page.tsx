"use client";

import {
	Anchor,
	Button,
	Container,
	Paper,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { useForgotPassword } from "@/features/auth";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const forgotPassword = useForgotPassword();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		forgotPassword.mutate(email);
	};

	return (
		<Container size={420} my={40}>
			<Title ta="center">Forgot your password?</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Enter your email and we&apos;ll send you a reset link
			</Text>

			<Paper withBorder shadow="md" p={30} mt={30} radius="md">
				<form onSubmit={handleSubmit}>
					<TextInput
						label="Email"
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.currentTarget.value)}
						mb="md"
					/>
					<Button type="submit" fullWidth loading={forgotPassword.isPending}>
						Send reset link
					</Button>
				</form>

				<Text c="dimmed" size="sm" ta="center" mt="md">
					<Anchor size="sm" component={Link} href="/login">
						Back to login
					</Anchor>
				</Text>
			</Paper>
		</Container>
	);
}
