export async function GET({ url }) {
	try {
		const imageUrl = url.searchParams.get('url');

		if (!imageUrl) {
			return new Response('缺少图片URL参数', { status: 400 });
		}

		// 获取图片
		const response = await fetch(imageUrl);

		if (!response.ok) {
			return new Response('获取图片失败', { status: response.status });
		}

		// 从URL中提取文件名
		const fileName = imageUrl.split('/').pop() || 'pinterest_image.jpg';

		// 设置响应头，使浏览器下载文件而不是显示
		const headers = new Headers(response.headers);
		headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

		// 返回图片数据
		return new Response(response.body, {
			status: 200,
			headers
		});
	} catch (error) {
		console.error('下载失败:', error);
		return new Response('下载失败', { status: 500 });
	}
}
