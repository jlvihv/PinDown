<script lang="ts">
	import { Check, Copy, Download, ExternalLink, Image, Loader2 } from 'lucide-svelte';
	import { fade, fly, scale } from 'svelte/transition';

	let url = '';
	let imageUrl: string | null = null;
	let loading = false;
	let error: string | null = null;
	let copied = false;

	async function parseUrl() {
		if (!url) {
			error = '请输入 Pinterest URL';
			return;
		}

		// 简单验证 URL 格式
		if (!url.includes('pinterest.com/pin/')) {
			error = '请输入有效的 Pinterest 图片 URL';
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
	class="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50"
>
	<!-- SVG 背景装饰 -->
	<div class="absolute inset-0 z-0 overflow-hidden">
		<!-- 顶部波浪 -->
		<svg
			class="absolute top-0 left-0 w-full opacity-10"
			viewBox="0 0 1440 320"
			xmlns="http://www.w3.org/2000/svg"
			preserveAspectRatio="none"
		>
			<path
				fill="#6366f1"
				d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,224C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
			></path>
		</svg>

		<!-- 右侧圆形 -->
		<div
			class="absolute top-1/4 right-0 h-96 w-96 translate-x-1/2 transform rounded-full bg-gradient-to-br from-purple-300 to-indigo-300 opacity-20 blur-3xl filter"
		></div>

		<!-- 左侧圆形 -->
		<div
			class="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/4 transform rounded-full bg-gradient-to-tr from-blue-300 to-teal-300 opacity-20 blur-3xl filter"
		></div>

		<!-- 底部波浪 -->
		<svg
			class="absolute bottom-0 left-0 w-full opacity-10"
			viewBox="0 0 1440 320"
			xmlns="http://www.w3.org/2000/svg"
			preserveAspectRatio="none"
		>
			<path
				fill="#8b5cf6"
				d="M0,96L48,122.7C96,149,192,203,288,202.7C384,203,480,149,576,117.3C672,85,768,75,864,90.7C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
			></path>
		</svg>

		<!-- 装饰点 -->
		<div
			class="absolute top-1/3 left-1/4 h-4 w-4 animate-pulse rounded-full bg-indigo-400 opacity-30"
		></div>
		<div
			class="absolute top-2/3 left-1/2 h-6 w-6 animate-pulse rounded-full bg-blue-400 opacity-30"
			style="animation-delay: 1s;"
		></div>
		<div
			class="absolute top-1/4 right-1/3 h-5 w-5 animate-pulse rounded-full bg-purple-400 opacity-30"
			style="animation-delay: 1.5s;"
		></div>
		<div
			class="absolute right-1/4 bottom-1/3 h-3 w-3 animate-pulse rounded-full bg-indigo-400 opacity-30"
			style="animation-delay: 0.5s;"
		></div>
	</div>

	<header
		class="relative z-10 bg-white/80 py-4 shadow-lg backdrop-blur-md"
		in:fly={{ y: -20, duration: 800, delay: 200 }}
	>
		<div class="container mx-auto flex items-center justify-between px-4">
			<a href="/" class="flex items-center gap-2 text-2xl font-bold text-indigo-600">
				<div class="rounded-full bg-indigo-100 p-2">
					<Image class="h-6 w-6 text-indigo-600" />
				</div>
				<span>PinDown</span>
			</a>
			<a
				href="https://github.com/jlvihv/PinDown"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-indigo-600"
			>
				<span>GitHub</span>
				<ExternalLink class="h-4 w-4" />
			</a>
		</div>
	</header>

	<main
		class="relative z-10 container mx-auto flex flex-grow flex-col items-center justify-center p-4 md:p-8"
	>
		<div class="w-full max-w-2xl" in:fly={{ y: 20, duration: 800, delay: 400 }}>
			<div class="mb-10 text-center">
				<h1 class="mb-3 text-4xl font-bold text-gray-800 md:text-5xl">
					<span class="text-indigo-600">Pinterest</span> 图片下载器
				</h1>
				<p class="text-lg text-gray-600">轻松获取高清原图，一键下载您喜爱的 Pinterest 图片</p>
			</div>

			<div class="overflow-hidden rounded-2xl bg-white/80 shadow-xl backdrop-blur-md">
				<div class="p-6 md:p-8">
					<div class="relative">
						<input
							type="text"
							placeholder="输入 Pinterest URL (例如：https://www.pinterest.com/pin/123456789/)"
							class="w-full rounded-xl border-2 border-gray-200 py-4 pr-32 pl-4 transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
							bind:value={url}
							on:keydown={(e) => e.key === 'Enter' && parseUrl()}
						/>
						<button
							class="absolute top-2 right-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 font-medium text-white shadow-md transition-opacity duration-200 hover:opacity-90"
							on:click={parseUrl}
							disabled={loading}
							aria-label="解析URL"
						>
							{#if loading}
								<Loader2 class="h-5 w-5 animate-spin" />
							{:else}
								解析
							{/if}
						</button>
					</div>

					{#if error}
						<div
							class="mt-3 flex items-center gap-1 text-sm text-red-500"
							in:fly={{ y: 10, duration: 300 }}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{error}</span>
						</div>
					{/if}

					{#if !imageUrl && !loading && !error}
						<div
							class="mt-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-6 text-center backdrop-blur-sm"
							in:fade={{ duration: 300 }}
						>
							<div class="mb-4 flex justify-center">
								<div class="rounded-full bg-indigo-100 p-3">
									<Image class="h-8 w-8 text-indigo-500" />
								</div>
							</div>
							<p class="text-gray-500">粘贴 Pinterest 图片链接，点击"解析"按钮获取原图</p>
						</div>
					{/if}

					{#if imageUrl}
						<div class="mt-6" in:scale={{ duration: 400, delay: 200, start: 0.95, opacity: 0 }}>
							<div class="group relative">
								<div
									class="absolute inset-0 scale-[1.01] -rotate-1 transform rounded-xl bg-gradient-to-r from-indigo-200 to-purple-200 opacity-70 transition-transform duration-300 group-hover:scale-[1.02]"
								></div>
								<div
									class="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
								>
									<img
										src={imageUrl}
										alt="Pinterest图片"
										class="h-auto w-full rounded-lg object-contain"
										loading="lazy"
									/>
								</div>
							</div>

							<div class="mt-6 flex flex-col gap-3 sm:flex-row">
								<button
									class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white shadow-md transition-opacity duration-200 hover:opacity-90"
									on:click={downloadImage}
									in:fly={{ x: -10, duration: 300, delay: 300 }}
								>
									<Download class="h-5 w-5" />
									<span>下载图片</span>
								</button>

								<button
									class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white/80 px-4 py-3 font-medium text-gray-700 backdrop-blur-sm transition-colors duration-200 hover:border-indigo-300"
									on:click={copyImageUrl}
									in:fly={{ x: 10, duration: 300, delay: 400 }}
								>
									{#if copied}
										<Check class="h-5 w-5 text-green-500" />
										<span class="text-green-500">已复制！</span>
									{:else}
										<Copy class="h-5 w-5" />
										<span>复制图片链接</span>
									{/if}
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="mt-8 text-center text-sm text-gray-500">
				<p>支持所有 Pinterest 图片链接，高效稳定的下载体验</p>
			</div>
		</div>
	</main>

	<footer
		class="relative z-10 mt-10 bg-white/80 py-6 backdrop-blur-md"
		in:fly={{ y: 20, duration: 800, delay: 600 }}
	>
		<div class="container mx-auto px-4 text-center">
			<p class="text-gray-600">&copy; 2025 PinDown - 简单高效的 Pinterest 图片下载工具</p>
			<div class="mt-2 flex justify-center gap-4 text-sm">
				<a href="#" class="text-gray-500 transition-colors duration-200 hover:text-indigo-600"
					>关于我们</a
				>
				<a href="#" class="text-gray-500 transition-colors duration-200 hover:text-indigo-600"
					>使用帮助</a
				>
				<a href="#" class="text-gray-500 transition-colors duration-200 hover:text-indigo-600"
					>隐私政策</a
				>
			</div>
		</div>
	</footer>
</div>
