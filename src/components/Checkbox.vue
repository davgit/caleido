<template>
	<div class="container">
		<div class="inline">
			<label>{{ label }}</label>
			<input type="checkbox" v-model="checkboxValue">
		</div>
	</div>
</template>

<script>
import {useModelWrapper} from '../composables/modelWrapper'

export default {
	name: 'Slider',
	props: {
		label: String,
		modelValue: Boolean
	},
	emits: ["update:modelValue"],
	setup(props, {emit}) {
		return {
			checkboxValue: useModelWrapper(props, emit, 'modelValue'),
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
	height: 30px;
	width: 100%;
	text-align: left;
	display: flex;
	justify-content: center;
	flex-direction: column;
}

.inline {
	width: 100%;
	height: 20px;
}

label {
	user-select: none;
}

input {
	width: 20px;
	height: 20px;
	padding: 0;
	margin: 0;
	float: right;
}
</style>
