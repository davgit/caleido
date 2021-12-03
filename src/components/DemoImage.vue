<template>
	<div class="demo-image" :style="{'background-image':imgImageURL()}"></div>
</template>

<script>


export default {
	name: "DemoImage",
	props: {
		url: String
	},
	setup(props) {

		function imgImageURL() {
			return "url('" + props.url + "')"
		}

		return {
			imgImageURL
		}
	}
}
</script>

<style scoped>

.demo-image {
	width: 100px;
	height: 100%;
	min-width: 100px;
	min-height: 100px;
	border: 1px solid #4c4b4b;
	border-radius: 100%;
	background-size: 100%;
	background-position: center;
	display: flex;
	margin: 0 auto;
	box-shadow: 5px 5px 10px black;
	background-size: cover;
	cursor: pointer;
}

.demo-image:hover {
	opacity: 0.8;
	transform: scale(1.02);
}

.demo-image:active {
	transform: scale(0.95);
}

@media all and (max-width: 500px) {
	.demo-image {
		width: 60px;
		min-width: 60px;
		height: 60px;
		min-height: 60px;

	}
}

</style>