import { Box, Group, Text } from '@mantine/core';

/** Merged attribute rows (global + custom) as a simple table. */
function SpecList({ attributes }) {
	if (attributes.length === 0) return null;

	return (
		<Box>
			{attributes.map((attr) => (
				<Group
					key={attr.id}
					justify="space-between"
					py={8}
					style={{ borderBottom: '1px solid var(--sf-border)' }}
				>
					<Text size="sm" c="dimmed">
						{attr.label}
					</Text>
					<Text size="sm" fw={500}>
						{attr.value}
					</Text>
				</Group>
			))}
		</Box>
	);
}

export default SpecList;
