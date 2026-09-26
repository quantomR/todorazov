import { useRef, useState } from 'react';
import { Box, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

// Legacy keyword values are still valid CSS object-position values.
const KEYWORD_MAP = { top: '50% 0%', center: '50% 50%', bottom: '50% 100%' };

function parsePos(value) {
	const v = KEYWORD_MAP[value] || value || '50% 50%';
	const [x, y] = v.split(/\s+/);
	return { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
}

// Drag a marker over the card image to choose its focal point (object-position).
// Only meaningful when the card image fit is "cover" (a cropped image).
function CardImageFocusPicker({ imageUrl, value, onChange }) {
	const { t } = useTranslation();
	const ref = useRef(null);
	const [dragging, setDragging] = useState(false);
	const pos = parsePos(value);

	const setFromEvent = (e) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
		const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
		onChange(`${Math.round(x)}% ${Math.round(y)}%`);
	};

	const handleDown = (e) => {
		e.currentTarget.setPointerCapture(e.pointerId);
		setDragging(true);
		setFromEvent(e);
	};
	const handleMove = (e) => {
		if (dragging) setFromEvent(e);
	};
	const handleUp = (e) => {
		setDragging(false);
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch {
			// pointer already released
		}
	};

	return (
		<Stack gap={4}>
			<Text size="sm" fw={500}>
				{t('productsAdmin.cardFocusLabel')}
			</Text>
			<Box
				ref={ref}
				onPointerDown={handleDown}
				onPointerMove={handleMove}
				onPointerUp={handleUp}
				style={{
					position: 'relative',
					width: '100%',
					maxWidth: 260,
					height: 220,
					borderRadius: 8,
					overflow: 'hidden',
					cursor: 'crosshair',
					background: 'var(--sf-surface-alt)',
					userSelect: 'none',
					touchAction: 'none',
				}}
			>
				<img
					src={imageUrl}
					alt=""
					draggable={false}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: `${pos.x}% ${pos.y}%`,
						pointerEvents: 'none',
					}}
				/>
				<Box
					style={{
						position: 'absolute',
						left: `${pos.x}%`,
						top: `${pos.y}%`,
						transform: 'translate(-50%, -50%)',
						width: 24,
						height: 24,
						borderRadius: '50%',
						border: '2px solid white',
						boxShadow: '0 0 0 2px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.4)',
						pointerEvents: 'none',
					}}
				/>
			</Box>
			<Text size="xs" c="dimmed">
				{t('productsAdmin.cardFocusHint')}
			</Text>
		</Stack>
	);
}

export default CardImageFocusPicker;
