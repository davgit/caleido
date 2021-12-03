<template>
	<div class="container">
		<div class="title">
			<span class="slider-label">{{ label }}</span>
		</div>
		<div class="inputDiv">
			<input
				class="inputSlider"
				type="range"
				:min="min"
				:max="max"
				:step="step"
				v-model.number="sliderValue"
			>
			<input
				class="inputField"
				type="number"
				:min="min"
				:max="max"
				:step="step"
				v-model.number="sliderValue"
			>
		</div>
	</div>
</template>

<script>
import {useModelWrapper} from '../composables/modelWrapper'

export default {
	name: 'Slider',
	props: {
		label: String,
		min: Number,
		max: Number,
		step: {type: Number, default: 1},
		modelValue: Number,
	},
	emits: ["update:modelValue", 'subtract'],
	setup(props, {emit}) {

		return {
			sliderValue: useModelWrapper(props, emit, 'modelValue')
		}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
	width: 100%;
	height: 30px;
	text-align: left;
	padding-bottom: 20px;

}

.title {
	width: 100%;
	display: flex;
	justify-content: start;
}

.slider-label {
	text-align: left;
}


.inputDiv {
	width: 100%;
	display: flex;
}

.inputSlider {
	width: 80%;
}

.inputField {
	width: 25%;
	font-size: 1em;
	background-color: transparent;
	color: gray;
	border: none;
	outline: none;
	text-align: right;
}

input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

input[type=number] {
	-moz-appearance: textfield;
}

input[type=range]::-webkit-slider-runnable-track {
	cursor: pointer;
	background: #111111;
	border-radius: 15px;
}

.animate-button {
	width: 25px;
	height: 20px;
	padding: 0;
	margin: 0;
	border-radius: 100%;
}


</style>
