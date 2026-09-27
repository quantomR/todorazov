import { PDFDocument } from 'pdf-lib';

/**
 * Return a new PDF Blob containing only the first `pages` pages of `file`.
 * Runs entirely in the browser, so the full book never leaves the admin.
 */
export async function trimPdf(file, pages) {
	const src = await PDFDocument.load(await file.arrayBuffer());
	const out = await PDFDocument.create();
	const n = Math.min(pages, src.getPageCount());
	const copied = await out.copyPages(
		src,
		Array.from({ length: n }, (_, i) => i)
	);
	copied.forEach((p) => out.addPage(p));
	return new Blob([await out.save()], { type: 'application/pdf' });
}
