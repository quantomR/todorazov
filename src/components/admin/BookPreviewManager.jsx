import { useEffect, useState } from 'react';
import {
	Alert,
	Button,
	FileInput,
	Group,
	Image,
	NumberInput,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFileTypePdf, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { renderPdfPages } from '@lib/pdf';
import { trimPdf } from '@lib/pdfTrim';
import { getPreview, savePreview, removePreview } from '@services/bookPreviewService';

const THUMB_CAP = 20;

function BookPreviewManager({ productId }) {
	const { t } = useTranslation();
	const [current, setCurrent] = useState(null); // { preview_pdf_path, preview_pdf_pages }
	const [file, setFile] = useState(null);
	const [total, setTotal] = useState(0);
	const [thumbs, setThumbs] = useState([]);
	const [cutoff, setCutoff] = useState(5);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		getPreview(productId)
			.then((p) => p.preview_pdf_path && setCurrent(p))
			.catch(() => {});
	}, [productId]);

	const handlePick = async (picked) => {
		setFile(picked);
		if (!picked) {
			setThumbs([]);
			setTotal(0);
			return;
		}
		setBusy(true);
		try {
			const { images, total: n } = await renderPdfPages(picked, THUMB_CAP);
			setThumbs(images);
			setTotal(n);
			setCutoff(Math.min(5, n));
		} catch {
			notifications.show({ message: t('bookPreview.readError'), color: 'red' });
			setFile(null);
		} finally {
			setBusy(false);
		}
	};

	const handleSave = async () => {
		setBusy(true);
		try {
			const blob = await trimPdf(file, cutoff);
			await savePreview(productId, blob, cutoff);
			setCurrent({ preview_pdf_path: `previews/${productId}.pdf`, preview_pdf_pages: cutoff });
			setFile(null);
			setThumbs([]);
			notifications.show({ message: t('bookPreview.saved'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		} finally {
			setBusy(false);
		}
	};

	const handleRemove = async () => {
		try {
			await removePreview(productId, current?.preview_pdf_path);
			setCurrent(null);
			notifications.show({ message: t('bookPreview.removed'), color: 'green' });
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	return (
		<Stack gap="sm">
			<Text size="sm" c="dimmed">
				{t('bookPreview.hint')}
			</Text>

			{current && !file && (
				<Alert color="green" variant="light">
					<Group justify="space-between" wrap="nowrap">
						<Text size="sm">{t('bookPreview.currentPages', { n: current.preview_pdf_pages })}</Text>
						<Button
							size="xs"
							variant="subtle"
							color="red"
							leftSection={<IconTrash size={14} />}
							onClick={handleRemove}
						>
							{t('common.delete')}
						</Button>
					</Group>
				</Alert>
			)}

			<FileInput
				label={t('bookPreview.upload')}
				description={t('bookPreview.uploadHint')}
				placeholder="book.pdf"
				accept="application/pdf,.pdf"
				leftSection={<IconFileTypePdf size={16} />}
				value={file}
				onChange={handlePick}
				disabled={busy}
				clearable
			/>

			{file && total > 0 && (
				<>
					<NumberInput
						label={t('bookPreview.cutoff')}
						description={t('bookPreview.cutoffHint', { total })}
						min={1}
						max={total}
						value={cutoff}
						onChange={(v) => setCutoff(Number(v) || 1)}
						w={220}
					/>
					<SimpleGrid cols={{ base: 3, xs: 4, md: 6 }} spacing="xs">
						{thumbs.slice(0, Math.min(cutoff, thumbs.length)).map((src, i) => (
							<Image key={i} src={src} h={110} fit="contain" radius="sm" withBorder />
						))}
					</SimpleGrid>
					<Group>
						<Button onClick={handleSave} loading={busy}>
							{t('bookPreview.save')}
						</Button>
					</Group>
				</>
			)}
		</Stack>
	);
}

export default BookPreviewManager;
