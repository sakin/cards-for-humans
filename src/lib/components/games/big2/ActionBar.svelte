<script lang="ts">
	interface Props {
		canPlay: boolean;
		canPass: boolean;
		hasSelection: boolean;
		onPlay: () => void;
		onPass: () => void;
		onClear: () => void;
	}

	let { canPlay, canPass, hasSelection, onPlay, onPass, onClear }: Props = $props();
</script>

<!-- Mobile: fixed bottom -->
<div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg p-4 safe-area-bottom z-10">
	<div class="flex gap-2 justify-center">
		<button
			type="button"
			class="
				px-6
				py-3
				bg-blue-600
				text-white
				font-semibold
				rounded-lg
				shadow-md
				disabled:opacity-50
				disabled:cursor-not-allowed
				enabled:hover:bg-blue-700
				enabled:active:scale-95
				transition-all
				min-w-[100px]
			"
			disabled={!canPlay || !hasSelection}
			onclick={onPlay}
		>
			Play
		</button>
		<button
			type="button"
			class="
				px-6
				py-3
				bg-gray-600
				text-white
				font-semibold
				rounded-lg
				shadow-md
				disabled:opacity-50
				disabled:cursor-not-allowed
				enabled:hover:bg-gray-700
				enabled:active:scale-95
				transition-all
				min-w-[100px]
			"
			disabled={!canPass}
			onclick={onPass}
		>
			Pass
		</button>
		<button
			type="button"
			class="
				px-6
				py-3
				bg-white
				text-gray-800
				border-2
				border-gray-300
				font-semibold
				rounded-lg
				shadow-md
				disabled:opacity-50
				disabled:cursor-not-allowed
				enabled:hover:bg-gray-50
				enabled:active:scale-95
				transition-all
				min-w-[100px]
			"
			disabled={!hasSelection}
			onclick={onClear}
		>
			Clear
		</button>
	</div>
</div>

<!-- Desktop: static, centered -->
<div class="hidden lg:block py-6">
	<div class="flex gap-4 justify-center">
		<button
			type="button"
			class="
				px-8
				py-4
				bg-blue-600
				text-white
				font-semibold
				rounded-lg
				shadow-md
				disabled:opacity-50
				disabled:cursor-not-allowed
				enabled:hover:bg-blue-700
				enabled:active:scale-95
				transition-all
				min-w-[120px]
			"
			disabled={!canPlay || !hasSelection}
			onclick={onPlay}
		>
			Play
		</button>
		<button
			type="button"
			class="
				px-8
				py-4
				bg-gray-600
				text-white
				font-semibold
				rounded-lg
				shadow-md
				disabled:opacity-50
				disabled:cursor-not-allowed
				enabled:hover:bg-gray-700
				enabled:active:scale-95
				transition-all
				min-w-[120px]
			"
			disabled={!canPass}
			onclick={onPass}
		>
			Pass
		</button>
		<button
			type="button"
			class="
				px-8
				py-4
				bg-white
				text-gray-800
				border-2
				border-gray-300
				font-semibold
				rounded-lg
				shadow-md
				disabled:opacity-50
				disabled:cursor-not-allowed
				enabled:hover:bg-gray-50
				enabled:active:scale-95
				transition-all
				min-w-[120px]
			"
			disabled={!hasSelection}
			onclick={onClear}
		>
			Clear
		</button>
	</div>
</div>
