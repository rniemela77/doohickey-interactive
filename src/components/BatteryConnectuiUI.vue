<template>
	<div class="battery-indicator" style="display:flex; gap: 1rem; justify-content: space-between;">
		<div style="display:flex; align-items: center;">
			<svg style="height: 1rem; width: 1rem; margin-right: 0.5rem;" viewBox="0 0 16 16" fill="white"
				xmlns="http://www.w3.org/2000/svg">
				<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
				<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
				<g id="SVGRepo_iconCarrier">
					<path d="M14 2H0V14H14V11H16V5H14V2Z" fill="#fff"></path>
				</g>
			</svg>
			<div v-for="i in 12" :key="i" class="battery-indicator-bar"
				:style="{ backgroundColor: i <= 2 ? 'white' : 'transparent', border: `1px solid ${i <= 2 ? 'white' : 'grey'}`, width: '5px', height: '10px', marginRight: '1px' }">
			</div>
		</div>

		<div style="display:flex; align-items: center;">
			<svg style="height: 1rem; width: 1rem; margin-right: 0.5rem;" viewBox="0 0 16 16" fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
				<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
				<g id="SVGRepo_iconCarrier">
					<path
						d="M0 7L1.17157 5.82843C2.98259 4.01741 5.43884 3 8 3C10.5612 3 13.0174 4.01742 14.8284 5.82843L16 7L14.5858 8.41421L13.4142 7.24264C11.9783 5.8067 10.0307 5 8 5C5.96928 5 4.02173 5.8067 2.58579 7.24264L1.41421 8.41421L0 7Z"
						fill="#fff"></path>
					<path
						d="M4.24264 11.2426L2.82843 9.82843L4 8.65685C5.06086 7.59599 6.49971 7 8 7C9.50029 7 10.9391 7.59599 12 8.65686L13.1716 9.82843L11.7574 11.2426L10.5858 10.0711C9.89999 9.38527 8.96986 9 8 9C7.03014 9 6.1 9.38527 5.41421 10.0711L4.24264 11.2426Z"
						fill="#fff"></path>
					<path
						d="M8 15L5.65685 12.6569L6.82842 11.4853C7.13914 11.1746 7.56057 11 8 11C8.43942 11 8.86085 11.1746 9.17157 11.4853L10.3431 12.6569L8 15Z"
						fill="#fff"></path>
				</g>
			</svg>

			<div style="display:flex;">
				<div v-for="i in 3" :key="i" class="battery-indicator-bar"
					:style="{ backgroundColor: i <= 2 ? 'white' : 'transparent', border: `1px solid ${i <= 2 ? 'white' : 'grey'}`, width: '5px', height: '10px', marginRight: '1px' }">
				</div>
			</div>
		</div>
	</div>
</template>
