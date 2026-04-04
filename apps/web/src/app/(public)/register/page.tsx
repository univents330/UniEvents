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
import { useRegister } from "@/features/auth";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const register = useRegister();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		register.mutate({ name, email, password });
	};

	return (
		<Container size={420} my={40}>
			<Title ta="center">Create your account</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				Already have an account?{" "}
				<Anchor size="sm" component={Link} href="/login">
					Sign in
				</Anchor>
			</Text>

			<Paper withBorder shadow="md" p={30} mt={30} radius="md">
				<form onSubmit={handleSubmit}>
					<TextInput
						label="Name"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
						mb="md"
					/>
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
					<Button type="submit" fullWidth loading={register.isPending}>
						Create account
					</Button>
				</form>
			</Paper>
		</Container>
	);
}
