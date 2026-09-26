import { Chip, Group } from '@mantine/core';

function SizePicker({ sizes, selectedId, onSelect }) {
	return (
		<Chip.Group value={selectedId} onChange={onSelect}>
			<Group gap="xs">
				{sizes.map((size) => (
					<Chip key={size.id} value={size.id} variant="outline">
						{size.label}
					</Chip>
				))}
			</Group>
		</Chip.Group>
	);
}

export default SizePicker;
