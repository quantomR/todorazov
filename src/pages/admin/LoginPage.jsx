import { useState } from 'react';
import { Box, Paper, Image, TextInput, PasswordInput, Button, Text, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@store/authStore';
import { brand } from '@/config/brand';

function LoginPage() {
	const { t } = useTranslation();
	const login = useAuthStore((state) => state.login);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const form = useForm({
		initialValues: { username: '', password: '' },
		validate: {
			username: (v) => (!v.trim() ? t('auth.required') : null),
			password: (v) => (!v ? t('auth.required') : null),
		},
	});

	const handleSubmit = async (values) => {
		setError('');
		setLoading(true);
		const email = values.username.includes('@')
			? values.username
			: `${values.username}@${brand.domain}`;
		try {
			await login(email, values.password);
			// no redirect needed — ProtectedRoute re-renders the admin outlet
		} catch {
			setError(t('auth.loginError'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'var(--sf-bg)',
			}}
		>
			<Paper
				shadow="md"
				p="xl"
				w={{ base: '90%', xs: 380 }}
				radius="md"
				style={{ backgroundColor: 'var(--sf-surface)' }}
			>
				<Stack gap="lg">
					<Image src={brand.logo.header} alt={brand.siteName} h={64} fit="contain" />
					<form onSubmit={form.onSubmit(handleSubmit)}>
						<Stack gap="md">
							<TextInput
								label={t('auth.username')}
								placeholder="username"
								autoComplete="username"
								{...form.getInputProps('username')}
							/>
							<PasswordInput
								label={t('auth.password')}
								placeholder="••••••••"
								autoComplete="current-password"
								{...form.getInputProps('password')}
							/>
							{error && (
								<Text size="sm" c="red">
									{error}
								</Text>
							)}
							<Button type="submit" fullWidth loading={loading}>
								{t('auth.login')}
							</Button>
						</Stack>
					</form>
				</Stack>
			</Paper>
		</Box>
	);
}

export default LoginPage;
