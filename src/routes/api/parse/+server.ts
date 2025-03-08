import { getPinImage, getPinImageByUrl, headers } from '$lib/parser';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();

		// 从 URL 中提取 Pinterest ID
		// const pinIdMatch = url.match(/\/pin\/([^/]+)/);
		// if (!pinIdMatch) {
		// 	return json({ error: '无效的 Pinterest URL' }, { status: 400 });
		// }

		// const pinId = pinIdMatch[1];
		// const imageUrl = await getPinImage(pinId, headers.v0);
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
