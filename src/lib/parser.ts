import * as cheerio from 'cheerio';

export const headers = {
	v0: {
		// for www.pinterest.com
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.0.0 Safari/537.36',
		Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.5',
		DNT: '1',
		'Upgrade-Insecure-Requests': '1',
		Connection: 'keep-alive'
	},
	v1v2: {
		// for www.pinterest.com
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.0.0 Safari/537.36',
		Accept: 'application/json, text/javascript, */*, q=0.01',
		'Accept-Language': 'en-US,en;q=0.5',
		'Accept-Encoding': 'gzip, deflate, br',
		Referer: 'https://www.pinterest.com/',
		'X-Requested-With': 'XMLHttpRequest',
		'X-APP-VERSION': 'c643827', // or '4c8c36f'
		'X-Pinterest-AppState': 'active',
		'X-Pinterest-PWS-Handler': 'www/[username]/[slug]/[section_slug].js',
		DNT: '1',
		Connection: 'keep-alive',
		'Sec-Fetch-Dest': 'empty',
		'Sec-Fetch-Mode': 'cors',
		'Sec-Fetch-Site': 'same-origin',
		TE: 'Trailers'
	},
	v3: {
		// for i.pining.com
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.0.0 Safari/537.36',
		Accept: 'image/webp,*/*',
		'Accept-Language': 'en-US,en;q=0.5',
		Referer: 'https://www.pinterest.com/',
		Connection: 'keep-alive',
		Pragma: 'no-cache',
		'Cache-Control': 'no-cache',
		TE: 'Trailers'
	},
	v4: {
		// for v.pinimg.com
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.0.0 Safari/537.36',
		Accept: '*/*',
		'Accept-Language': 'en-US,en;q=0.5',
		Origin: 'https://www.pinterest.com',
		DNT: '1',
		Referer: 'https://www.pinterest.com/',
		Connection: 'keep-alive',
		Pragma: 'no-cache',
		'Cache-Control': 'no-cache'
	}
};

export async function getPinImage(
	pinId: string,
	headers: Record<string, string>
): Promise<string | undefined> {
	// 重试机制
	try {
		// 发送 HTTP 请求
		const response = await fetch(`https://www.pinterest.com/pin/${pinId}/`, { headers });
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const htmlContent = await response.text();
		// 解析 HTML
		const $ = cheerio.load(htmlContent);
		const scripts = $('script')
			.map((i, el) => $(el).text())
			.get()
			.join('\n');
		console.log('所有 script 标签的内容：', scripts);

		// 使用正则表达式，寻找 https://i.pinimg.com/originals/... 的 url，只需要第一个，返回
		const match = /https:\/\/i\.pinimg\.com\/originals\/[^\s'"]+/i.exec(scripts);
		if (match) {
			console.log('匹配到的图片 URL:', match[0]);
			return match[0]; // 返回匹配到的 URL
		}
	} catch (error: any) {
		console.error(`get pin info 失败： ${error.message}`);
		throw error;
	}
}
