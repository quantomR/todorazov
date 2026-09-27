import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Render the first `maxPages` pages of a PDF to JPEG data URLs.
 * `source` may be a URL string, a File/Blob or an ArrayBuffer.
 * Used by the admin preview picker and the public flipbook.
 */
export async function renderPdfPages(source, maxPages, scale = 1.4) {
	let params;
	if (source instanceof Blob) params = { data: await source.arrayBuffer() };
	else if (typeof source === 'string') params = { url: source };
	else params = { data: source };

	const pdf = await pdfjsLib.getDocument(params).promise;
	const total = pdf.numPages;
	const n = Math.min(maxPages ?? total, total);
	const images = [];
	for (let i = 1; i <= n; i++) {
		const page = await pdf.getPage(i);
		const viewport = page.getViewport({ scale });
		const canvas = document.createElement('canvas');
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
		images.push(canvas.toDataURL('image/jpeg', 0.85));
	}
	return { images, total };
}
