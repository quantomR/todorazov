import { supabase } from '@lib/supabase';

const generateInquiryNumber = () =>
	`INQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/** Public inquiry insert — anon RLS allows insert only, no `.select()`. */
export const createInquiry = async ({ name, email, phone, subject, message }) => {
	const inquiryNumber = generateInquiryNumber();
	const { error } = await supabase.from('inquiries').insert([
		{
			inquiry_number: inquiryNumber,
			client_name: name,
			client_email: email,
			client_phone: phone || null,
			subject: subject || null,
			message: message || null,
		},
	]);
	if (error) throw error;
	return { inquiryNumber };
};
