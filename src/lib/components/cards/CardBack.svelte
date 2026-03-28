<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
	}

	let { size = 'md' }: Props = $props();

	const sizeClasses = $derived(
		size === 'sm'
			? 'w-[50px] h-[70px]'
			: size === 'lg'
				? 'w-[80px] h-[112px]'
				: 'w-[60px] h-[84px] md:w-[70px] md:h-[98px] lg:w-[80px] lg:h-[112px]'
	);
</script>

<div
	class="
		{sizeClasses}
		rounded-lg
		border-2
		border-gray-300
		shadow-md
		bg-gradient-to-br
		from-blue-600
		to-blue-800
		flex
		items-center
		justify-center
		text-white
		font-bold
		text-xs
	"
>
	<div class="opacity-50">
		<div class="rotate-45 text-4xl">♠</div>
	</div>
</div>
