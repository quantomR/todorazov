import { useEffect, useState } from 'react';
import {
	ActionIcon,
	Anchor,
	Box,
	Button,
	Container,
	Group,
	LoadingOverlay,
	Modal,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEye, IconFileDownload, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getApplications, deleteApplication, getCvUrl } from '@services/applicationService';

function ApplicationsPage() {
	const { t, i18n } = useTranslation();
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [viewTarget, setViewTarget] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

	const refresh = () =>
		getApplications()
			.then(setApplications)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));

	useEffect(() => {
		refresh();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const positionLabel = (a) =>
		a.positions
			? (a.positions[`title_${i18n.language}`] ?? a.positions.title_bg)
			: t('careers.generalIdea');

	const downloadCv = async (a) => {
		try {
			const url = await getCvUrl(a.cv_path);
			window.open(url, '_blank', 'noopener');
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDelete = async () => {
		try {
			await deleteApplication(deleteTarget.id);
			closeDelete();
			refresh();
			notifications.show({ message: t('applications.deleted'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const rows = applications.map((a) => (
		<Table.Tr key={a.id}>
			<Table.Td>{a.name}</Table.Td>
			<Table.Td>{positionLabel(a)}</Table.Td>
			<Table.Td>{new Date(a.created_at).toLocaleDateString('bg-BG')}</Table.Td>
			<Table.Td>
				{a.cv_path ? (
					<Anchor component="button" type="button" size="sm" onClick={() => downloadCv(a)}>
						<Group gap={4} wrap="nowrap">
							<IconFileDownload size={15} />
							{t('applications.cv')}
						</Group>
					</Anchor>
				) : (
					<Text size="sm" c="dimmed">
						—
					</Text>
				)}
			</Table.Td>
			<Table.Td>
				<Group gap="xs">
					<ActionIcon
						variant="light"
						onClick={() => {
							setViewTarget(a);
							openView();
						}}
					>
						<IconEye size={16} />
					</ActionIcon>
					<ActionIcon
						variant="light"
						color="red"
						onClick={() => {
							setDeleteTarget(a);
							openDelete();
						}}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Container size="lg">
			<Title order={2} mb="lg">
				{t('applications.title')}
			</Title>

			<Box pos="relative" style={{ overflowX: 'auto' }}>
				<LoadingOverlay visible={loading} />
				<Table striped highlightOnHover withTableBorder miw={620}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{t('applications.name')}</Table.Th>
							<Table.Th>{t('applications.position')}</Table.Th>
							<Table.Th>{t('applications.date')}</Table.Th>
							<Table.Th>{t('applications.cv')}</Table.Th>
							<Table.Th>{t('categories.actions')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Box>

			<Modal opened={viewOpened} onClose={closeView} title={viewTarget?.name} centered>
				{viewTarget && (
					<Stack gap="xs">
						<Text size="sm">
							<b>{t('applications.position')}:</b> {positionLabel(viewTarget)}
						</Text>
						<Text size="sm">
							<b>{t('applications.email')}:</b> {viewTarget.email}
						</Text>
						{viewTarget.phone && (
							<Text size="sm">
								<b>{t('applications.phone')}:</b> {viewTarget.phone}
							</Text>
						)}
						<Text size="sm" style={{ whiteSpace: 'pre-wrap' }} mt="xs">
							{viewTarget.message}
						</Text>
						{viewTarget.cv_path && (
							<Button
								variant="light"
								leftSection={<IconFileDownload size={16} />}
								onClick={() => downloadCv(viewTarget)}
								mt="sm"
							>
								{viewTarget.cv_name ?? t('applications.cv')}
							</Button>
						)}
					</Stack>
				)}
			</Modal>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title={t('applications.deleteConfirm')}
				centered
				size="sm"
			>
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('applications.deleteWarning')}
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={closeDelete}>
							{t('common.cancel')}
						</Button>
						<Button color="red" onClick={handleDelete}>
							{t('common.delete')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Container>
	);
}

export default ApplicationsPage;
