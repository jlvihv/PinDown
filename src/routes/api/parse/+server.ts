import { json } from '@sveltejs/kit';
import { getPinImage } from '$lib/parser';
import { headers } from '$lib/parser';

export async function POST({ request }) {
	try {
		const { url } = await request.json();
		
		// 从URL中提取Pinterest ID
		const pinIdMatch = url.match(/\/pin\/([^/]+)/);
		if (!pinIdMatch) {
			return json({ error: '无效的Pinterest URL' }, { status: 400 });
		}
		
		const pinId = pinIdMatch[1];
		const imageUrl = await getPinImage(pinId, headers.v0);
		
		if (!imageUrl) {
			return json({ error: '无法解析图片URL' }, { status: 404 });
		}
		
		return json({ imageUrl });
	} catch (error) {
		console.error('解析失败:', error);
		return json({ error: '解析失败' }, { status: 500 });
	}
}
