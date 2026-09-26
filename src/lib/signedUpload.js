import { supabase } from '@lib/supabase';

/**
 * Two-step signed-URL upload to Supabase Storage (pattern from EPPV).
 *
 * The client asks Storage for a short-lived signed upload URL, then uploads
 * the file directly to it — no file bytes pass through an Edge Function, so
 * this is the right path for large files (video posters, big images) that
 * would blow a function's body limit. The bucket's RLS insert policy still
 * applies (authenticated admin only in this template).
 *
 * @param {string} bucket   storage bucket id (e.g. 'product-images')
 * @param {File}   file     the file to upload
 * @param {string} [prefix] optional folder prefix inside the bucket
 * @returns {{ path: string, publicUrl: string }}
 */
export async function signedUpload(bucket, file, prefix = '') {
	const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
	const path = `${prefix}${prefix ? '/' : ''}${crypto.randomUUID()}.${ext}`;

	const { data: signed, error: signErr } = await supabase.storage
		.from(bucket)
		.createSignedUploadUrl(path);
	if (signErr) throw signErr;

	const { error: upErr } = await supabase.storage
		.from(bucket)
		.uploadToSignedUrl(path, signed.token, file);
	if (upErr) throw upErr;

	const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
	return { path, publicUrl: pub.publicUrl };
}
