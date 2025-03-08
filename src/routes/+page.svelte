<script lang="ts">
	import { Check, CircleX, Copy, Download, Image, Loader2 } from 'lucide-svelte';
	import { fade, fly, scale } from 'svelte/transition';

	let url = $state('');
	let imageUrl: string | null = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);
	let copied = $state(false);

	async function parseUrl() {
		if (!url) {
			error = '请输入 Pinterest URL';
			return;
		}

		loading = true;
		error = null;
		imageUrl = null;

		try {
			const response = await fetch('/api/parse', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ url })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || '解析失败';
				return;
			}

			imageUrl = data.imageUrl;
		} catch (err) {
			error = '请求失败，请稍后重试';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function downloadImage() {
		if (imageUrl) {
			window.location.href = `/api/download?url=${encodeURIComponent(imageUrl)}`;
		}
	}

	function copyImageUrl() {
		if (imageUrl) {
			navigator.clipboard.writeText(imageUrl);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}
</script>

<div
	class="relative flex min-h-screen flex-col overflow-y-auto bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50
	dark:from-slate-900 dark:via-slate-800 dark:to-slate-700"
>
	<!-- SVG 背景装饰 -->
	<div class="absolute inset-0 z-0 overflow-hidden">
		<!-- 顶部波浪 -->
		<svg class="absolute top-0 left-0 w-full opacity-10" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
			<path
				fill="#6366f1"
				d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,224C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
			></path>
		</svg>

		<!-- 右侧圆形 -->
		<div class="absolute top-1/4 right-0 h-96 w-96 translate-x-1/2 transform rounded-full bg-gradient-to-br from-purple-300 to-indigo-300 opacity-20 blur-3xl filter dark:from-purple-800 dark:to-indigo-900"></div>

		<!-- 左侧圆形 -->
		<div class="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/4 transform rounded-full bg-gradient-to-tr from-blue-300 to-teal-300 opacity-20 blur-3xl filter dark:from-blue-800 dark:to-teal-800"></div>

		<!-- 底部波浪 -->
		<svg class="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
			<path
				fill="#8b5cf6"
				d="M0,96L48,122.7C96,149,192,203,288,202.7C384,203,480,149,576,117.3C672,85,768,75,864,90.7C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
			></path>
		</svg>
	</div>

	<div class="navbar">
		<div class="container mx-auto px-4">
			<div class="flex-1">
				<a href="/" class="btn btn-ghost text-xl text-indigo-600 dark:text-indigo-200">
					<Image class="h-6 w-6 text-indigo-600 dark:text-indigo-200" />
					PinDown
				</a>
			</div>
		</div>
	</div>

	<main class="relative z-10 container mx-auto flex flex-grow flex-col items-center justify-center p-2">
		<div class="w-full max-w-3xl" in:fly={{ y: 20, duration: 800, delay: 400 }}>
			<div class="mb-10 text-center">
				<h1 class="text-base-content mb-3 text-4xl font-bold md:text-5xl">
					<span class="text-rose-500">Pinterest</span>
					图片下载器
				</h1>
				<p class="text-lg">轻松获取高清原图，一键下载您喜爱的 Pinterest 图片</p>
			</div>

			<div>
				<div class="p-4 md:p-6">
					<div class="flex w-full justify-between gap-4 rounded-xl border-2 border-slate-200 p-4">
						<input type="text" placeholder="输入 Pinterest URL" class="w-full bg-transparent text-lg outline-none" bind:value={url} onkeydown={(e) => e.key === 'Enter' && parseUrl()} />
						<button class="w-28 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 font-medium text-white shadow transition-opacity duration-200 hover:opacity-90" onclick={parseUrl} disabled={loading} aria-label="解析URL">
							{#if loading}
								<div class="flex items-center justify-center">
									<Loader2 class="size-5 animate-spin" />
								</div>
							{:else}
								解析
							{/if}
						</button>
					</div>

					{#if error}
						<div class="mt-3 flex items-center gap-1 text-sm text-red-500" in:fly={{ y: 10, duration: 300 }}>
							<CircleX class="size-4 text-red-500" />
							<span>{error}</span>
						</div>
					{/if}

					{#if !imageUrl && !loading && !error}
						<div class="mt-6 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center" in:fade={{ duration: 300 }}>
							<div class="mb-4 flex justify-center">
								<div class="rounded-full bg-indigo-100 p-3">
									<Image class="h-8 w-8 text-indigo-500" />
								</div>
							</div>
							<p class="text-slate-500">粘贴 Pinterest 图片链接，点击"解析"按钮获取原图</p>
						</div>
					{/if}

					{#if imageUrl}
						<div class="mt-6" in:scale={{ duration: 400, delay: 200, start: 0.95, opacity: 0 }}>
							<div class="overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
								<img src={imageUrl} alt="Pinterest图片" class="h-auto w-full rounded-lg object-contain" loading="lazy" />
							</div>

							<div class="mt-6 flex flex-col gap-3 sm:flex-row">
								<button
									class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white shadow-md transition-opacity duration-200 hover:opacity-90"
									onclick={downloadImage}
									in:fly={{ x: -10, duration: 300, delay: 300 }}
								>
									<Download class="h-5 w-5" />
									<span>下载图片</span>
								</button>

								<button
									class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white/80 px-4 py-3 font-medium text-slate-700 backdrop-blur-sm transition-colors duration-200 hover:border-indigo-300"
									onclick={copyImageUrl}
									in:fly={{ x: 10, duration: 300, delay: 400 }}
								>
									{#if copied}
										<Check class="size-5 text-green-500" />
										<span class="text-green-500">已复制！</span>
									{:else}
										<Copy class="size-5" />
										<span>复制图片链接</span>
									{/if}
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>

	<footer class="footer footer-center text-base-content p-10">
		<p>Copyright © 2025 PinDown - 简单高效的 Pinterest 图片下载工具</p>
	</footer>
</div>

<style>
</style>
