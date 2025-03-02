import * as path from 'path';

interface PinterestOptions {
	dir?: string;
	threadMax?: number;
	cut?: number;
	boardTimestamp?: boolean;
	logTimestamp?: boolean;
	force?: boolean;
	excludeSection?: boolean;
	rescrape?: boolean;
	imgOnly?: boolean;
	vOnly?: boolean;
	updateAll?: boolean;
	httpsProxy?: string;
	httpProxy?: string;
	cookies?: string;
}

async function downloadPinterest(url: string, options: PinterestOptions = {}): Promise<string[]> {
	const {
		dir = 'images',
		threadMax = 5,
		cut = -1,
		boardTimestamp = false,
		logTimestamp = false,
		force = false,
		excludeSection = false,
		rescrape = false,
		imgOnly = false,
		vOnly = false
	} = options;

	const headers = {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.0.0 Safari/537.36',
		Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.5',
		DNT: '1',
		'Upgrade-Insecure-Requests': '1',
		Connection: 'keep-alive'
	};

	const startTime = Date.now();

	if (!url) {
		console.error('Path cannot be empty.');
		return [];
	}

	url = url.trim();
	if (url.startsWith('https://pin.it/')) {
		console.log('[i] Try to expand shorten url');
		const response = await fetch(url, { headers });
		if (response.status === 200 && response.url.includes('/sent')) {
			url = response.url.split('/sent')[0];
			console.log('[i] Pin url is: ' + url + '/');
		}
	}

	const urlPath = decodeURIComponent(url.split('?')[0].split('#')[0]).replace(/\/$/, '');
	const slashPath = urlPath.replace(/^\//, '').split('/');

	if (slashPath.length === 0) {
		console.error(`[${'\u274C'}] Neither username/boardname nor valid link: ${url}`);
		return [];
	} else if (slashPath.length > 3) {
		console.error(
			'[!] Something wrong with Pinterest URL. Please report this issue at https://github.com/limkokhole/pinterest-downloader/issues, thanks.'
		);
		return [];
	}

	const fsFMax = 255; // Assuming a maximum filename length of 255 characters

	if (slashPath.length === 2 && slashPath[0] === 'pin') {
		console.log('[i] Job is download video/image of single pin page.');
		const pinId = slashPath[1];
		try {
			await getPinInfo(
				pinId,
				logTimestamp,
				urlPath,
				force,
				imgOnly,
				vOnly,
				dir,
				cut,
				fsFMax,
				headers
			);
		} catch (error) {
			console.error(error);
		}
		return [];
	}

	if (slashPath.length === 3) {
		const secPath = slashPath.join('/');
		const boardPath = slashPath.slice(0, 2).join('/');
		console.log(`[i] Job is download single section by username/boardname/section: ${secPath}`);
		if (
			slashPath[0] === 'search' ||
			slashPath[0] === 'categories' ||
			slashPath[2] === 'more_ideas'
		) {
			console.error(`[${'\u274C'}] Search, Categories, Topics, more_ideas are not supported.`);
			return [];
		}
		try {
			const board = await getBoardInfo(secPath, false, slashPath[2], boardPath, headers);
			await fetchImgs(
				board,
				// slashPath[0],
				// slashPath[1],
				// slashPath[2],
				// false,
				// boardTimestamp,
				logTimestamp,
				urlPath,
				force,
				rescrape,
				imgOnly,
				vOnly,
				dir,
				threadMax,
				headers,
				cut,
				fsFMax
			);
		} catch (error) {
			console.error(error);
		}
	} else if (slashPath.length === 2) {
		const boardPath = slashPath.join('/');
		console.log(`[i] Job is download single board by username/boardname: ${boardPath}`);
		if (slashPath[0] === 'search' || slashPath[0] === 'categories') {
			console.error(`[${'\u274C'}] Search, Categories and Topics not supported.`);
			return [];
		}
		try {
			const { board, sections } = await getBoardInfo(
				boardPath,
				excludeSection,
				null,
				null,
				headers
			);
			await fetchImgs(
				board,
				// slashPath[0],
				// slashPath[1],
				// null,
				// false,
				// boardTimestamp,
				logTimestamp,
				urlPath,
				force,
				rescrape,
				imgOnly,
				vOnly,
				dir,
				threadMax,
				headers,
				cut,
				fsFMax
			);
			if (!excludeSection && sections) {
				console.log(`[i] Trying to get ${sections.length} sections`);
				for (const section of sections) {
					const secPath = boardPath + '/' + section.slug;
					const board = await getBoardInfo(secPath, false, section.slug, boardPath, headers);
					await fetchImgs(
						board,
						// slashPath[0],
						// slashPath[1],
						// section.slug,
						// false,
						// boardTimestamp,
						logTimestamp,
						urlPath,
						force,
						rescrape,
						imgOnly,
						vOnly,
						dir,
						threadMax,
						headers,
						cut,
						fsFMax
					);
				}
			}
		} catch (error) {
			console.error(error);
		}
		return [];
	} else if (slashPath.length === 1) {
		console.log(`[i] Job is download all boards by username: ${slashPath[0]}`);
		if (slashPath[0] === 'search' || slashPath[0] === 'categories') {
			console.error(`[${'\u274C'}] Search, Categories and Topics not supported.`);
			return [];
		}
		try {
			const boards = await fetchBoards(slashPath[0], headers);
			for (const board of boards) {
				if (!board.name) {
					console.log('Skip no name');
					continue;
				}
				const boardPath = board.url.replace(/\/$/, '');
				const boardSlug = boardPath.includes('/') ? boardPath.split('/')[1] : boardPath;
				const isMainBoard = !boardPath.includes('/');
				board.owner = { id: board.id }; // Workaround for missing owner property
				await fetchImgs(
					board,
					// slashPath[0],
					// boardSlug,
					// null,
					// isMainBoard,
					// boardTimestamp,
					logTimestamp,
					urlPath,
					force,
					rescrape,
					imgOnly,
					vOnly,
					dir,
					threadMax,
					headers,
					cut,
					fsFMax
				);
				if (!excludeSection && board.section_count > 0) {
					console.log(`[i] Trying to get ${board.section_count} sections`);
					const { sections } = await getBoardInfo(boardPath, false, null, null, headers);
					for (const section of sections) {
						const secPath = boardPath + '/' + section.slug;
						const board = await getBoardInfo(secPath, false, section.slug, boardPath, headers);
						const [secUname, secBname] = boardPath.split('/');
						await fetchImgs(
							board,
							// secUname,
							// secBname,
							// section.slug,
							// false,
							// boardTimestamp,
							logTimestamp,
							urlPath,
							force,
							rescrape,
							imgOnly,
							vOnly,
							dir,
							threadMax,
							headers,
							cut,
							fsFMax
						);
					}
				}
			}
		} catch (error) {
			console.error(error);
		}
		return [];
	}
	return []
}

async function getBoardInfo(
	path: string,
	excludeSection: boolean,
	sectionSlug: string | null,
	boardPath: string | null,
	headers: Record<string, string>
) {
	const url = `https://www.pinterest.com/${path}/`;
	const response = await fetch(url, { headers });
	const text = await response.text();
	const data = JSON.parse(text.split('data:')[1].split('}"></script>')[0] + '}');
	const board =
		data.props.initialReduxState.tree.children[
			Object.keys(data.props.initialReduxState.tree.children)[0]
		].children.resource.data;

	if (excludeSection) {
		return { board };
	}

	const sections = board.sections.map((section: any) => ({
		id: section.id,
		title: section.title,
		slug: section.slug
	}));

	return { board, sections };
}

async function fetchBoards(username: string, headers: Record<string, string>) {
	const url = `https://www.pinterest.com/${username}/`;
	const response = await fetch(url, { headers });
	const text = await response.text();
	const data = JSON.parse(text.split('data:')[1].split('}"></script>')[0] + '}');
	const boards =
		data.props.initialReduxState.tree.children[
			Object.keys(data.props.initialReduxState.tree.children)[0]
		].children.resource.data;
	return boards;
}

async function fetchImgs(
	board: any,
	// username: string,
	// boardName: string,
	// sectionSlug: string | null,
	// isMainBoard: boolean,
	// boardTimestamp: boolean,
	logTimestamp: boolean,
	urlPath: string,
	force: boolean,
	rescrape: boolean,
	imgOnly: boolean,
	vOnly: boolean,
	dir: string,
	threadMax: number,
	headers: Record<string, string>,
	cut: number,
	fsFMax: number
) {
	let pins: any[] = [];
	let bookmark: string | null = null;
	let hasMore = true;

	while (hasMore) {
		const response: any = await fetch(
			`https://www.pinterest.com/resource/BoardFeedResource/get/?source_url=${urlPath}&data=%7B%22options%22%3A%7B%22board_id%22%3A%22${
				board.id
			}%22%2C%22page_size%22%3A25%2C%22field_set_key%22%3A%22detailed%22%2C%22access_via%22%3A%22board%22%7D%2C%22context%22%3A%7B%7D%7D${
				bookmark ? `&page_size=25&bookmark=${bookmark}` : ''
			}`,
			{ headers }
		);
		const data = await response.json();
		pins = pins.concat(data.resource_response.data);
		bookmark = data.resource_response.bookmark;
		hasMore = data.resource_response.bookmark !== null;
	}

	const filteredPins = pins.filter((pin) => {
		if (imgOnly && pin.videos) {
			return false;
		}
		if (vOnly && !pin.videos) {
			return false;
		}
		return true;
	});

	const pinIds = filteredPins.map((pin) => pin.id);
	const totalPins = pinIds.length;

	console.log(`[i] Total pins: ${totalPins}`);

	const imageUrls: string[] = [];
	for (const pinId of pinIds) {
		try {
			const imageUrl = await getPinInfo(
				pinId,
				logTimestamp,
				urlPath,
				force,
				imgOnly,
				vOnly,
				dir,
				cut,
				fsFMax,
				headers
			);
			if (imageUrl) {
				imageUrls.push(imageUrl);
			}
		} catch (error) {
			console.error(error);
		}
	}
	console.log(`[i] Image URLs: ${imageUrls.join(', ')}`);
	return imageUrls;
}

async function getPinInfo(
	pinId: string,
	logTimestamp: boolean,
	urlPath: string,
	force: boolean,
	imgOnly: boolean,
	vOnly: boolean,
	dir: string,
	cut: number,
	fsFMax: number,
	headers: Record<string, string>
) {
	const response = await fetch(
		`https://www.pinterest.com/resource/PinResource/get/?source_url=${urlPath}&data=%7B%22options%22%3A%7B%22id%22%3A%22${pinId}%22%2C%22field_set_key%22%3A%22detailed%22%7D%2C%22context%22%3A%7B%7D%7D`,
		{ headers }
	);
	const data = await response.json();
	const pin = data.resource_response.data;

	if (imgOnly && pin.videos) {
		return;
	}
	if (vOnly && !pin.videos) {
		return;
	}

	const img = pin.images['orig'] || pin.images['474x'];
	const video =
		(pin.videos && pin.videos['V_720P']) ||
		(pin.videos && pin.videos['V_480P']) ||
		(pin.videos && pin.videos['V_360P']) ||
		(pin.videos && pin.videos['V_240P']);

	const url = (video && video.url) || (img && img.url);
	const ext = url.split('.').pop().split('?')[0];

	const timestamp = logTimestamp ? `_${Date.now()}` : '';

	let filename = pin.title
		.replace(/[^a-z0-9]/gi, '_')
		.substring(0, fsFMax - ext.length - timestamp.length - 1);
	if (cut !== -1) {
		filename = filename.substring(0, cut);
	}

	return url;
}

export default downloadPinterest;
