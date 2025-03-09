import { getPinImage, getPinImageByUrl, headers } from '$lib/parser';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();
		const imageUrl = await getPinImageByUrl(url, headers.v0);

		if (!imageUrl) {
			return json({ error: '无法解析图片 URL' }, { status: 404 });
		}

		return json({ imageUrl });
	} catch (error) {
		console.error('解析失败：', error);
		return json({ error: '解析失败' }, { status: 500 });
	}
};
