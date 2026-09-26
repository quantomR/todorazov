let nextCustomFieldKey = 0;

/**
 * Blank per-product custom field for the admin product form.
 * `key` is a local-only id used for React lists and dnd-kit.
 */
export function createCustomField() {
	return {
		key: `custom-${nextCustomFieldKey++}`,
		name_bg: '',
		name_en: '',
		value_bg: '',
		value_en: '',
		collapsed: false,
	};
}

/**
 * Pick the localized value of a bilingual record field.
 * Falls back to the BG value when the other one is empty.
 */
export function localized(record, field, lang) {
	if (!record) return '';
	const value = lang === 'en' ? record[`${field}_en`] : record[`${field}_bg`];
	return value || record[`${field}_bg`] || '';
}

/**
 * Merge global-backed and custom product attributes into one display
 * list. Global attributes come first (template order, label/collapsed
 * from the definition); custom fields follow in their per-product
 * order. Rows with empty values are skipped.
 *
 * @returns [{ id, label, value, collapsed }]
 */
export function mergeAttributes(definitions, attributes, lang) {
	const rows = attributes ?? [];
	const byDefinition = new Map(
		rows.filter((a) => a.definition_id).map((a) => [a.definition_id, a])
	);

	const global = (definitions ?? [])
		.slice()
		.sort((a, b) => a.sort_order - b.sort_order)
		.map((def) => {
			const row = byDefinition.get(def.id);
			return row
				? {
						id: row.id,
						label: localized(def, 'name', lang),
						value: localized(row, 'value', lang),
						collapsed: def.collapsed,
					}
				: null;
		})
		.filter((item) => item && item.value.trim() !== '');

	const custom = rows
		.filter((a) => !a.definition_id)
		.slice()
		.sort((a, b) => a.sort_order - b.sort_order)
		.map((row) => ({
			id: row.id,
			label: localized(row, 'name', lang),
			value: localized(row, 'value', lang),
			collapsed: row.collapsed,
		}))
		.filter((item) => item.value.trim() !== '');

	return [...global, ...custom];
}
