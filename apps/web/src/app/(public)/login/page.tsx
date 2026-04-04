"use client";

import {
	Anchor,
	Button,
	Container,
	Paper,
	PasswordInput,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { useLogin } from "@/features/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const login = useLogin();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		login.mutate({ email, password });
	};

	return (
		<Container size={420} my={40}>
			<Title ta="center">Welcome back!</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Don&apos;t have an account yet?{" "}
				<Anchor size="sm" component={Link} href="/register">
					Create account
				</Anchor>
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
					<PasswordInput
						label="Password"
						required
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
						mb="md"
					/>
					<Button type="submit" fullWidth loading={login.isPending}>
						Sign in
					</Button>
				</form>

				<Text c="dimmed" size="sm" ta="center" mt="md">
					<Anchor size="sm" component={Link} href="/forgot-password">
						Forgot password?
					</Anchor>
				</Text>
			</Paper>
		</Container>
	);
}
