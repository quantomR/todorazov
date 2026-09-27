import { supabase } from '@lib/supabase';

const BUCKET = 'applications';

// Public: upload a CV to the private bucket, return its storage path.
export const uploadCv = async (file) => {
	const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
	const path = `${crypto.randomUUID()}.${ext}`;
	const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
		contentType: file.type || 'application/octet-stream',
		upsert: false,
	});
	if (error) throw error;
	return path;
};

// Public: submit an application — anon RLS allows insert only, no `.select()`.
export const createApplication = async (application) => {
	const { error } = await supabase.from('applications').insert([
		{
			position_id: application.position_id || null,
			name: application.name,
			email: application.email,
			phone: application.phone || null,
			message: application.message || null,
			cv_path: application.cv_path || null,
			cv_name: application.cv_name || null,
		},
	]);
	if (error) throw error;
};

// Admin: applications with their position title.
export const getApplications = async () => {
	const { data, error } = await supabase
		.from('applications')
		.select('*, positions(title_bg, title_en)')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
};

export const updateApplicationStatus = async (id, status) => {
	const { error } = await supabase.from('applications').update({ status }).eq('id', id);
	if (error) throw error;
};

export const deleteApplication = async (id) => {
	const { error } = await supabase.from('applications').delete().eq('id', id);
	if (error) throw error;
};

// Admin: short-lived signed URL to download a CV from the private bucket.
export const getCvUrl = async (path) => {
	const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 120);
	if (error) throw error;
	return data.signedUrl;
};
