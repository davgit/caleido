<template>
	<div class="container">
		<div class="bg-image" :class="{'bg-active':(isHoveringDemo || isDragOver)}"></div>
		<div class="caleido-title-container" :style="{'opacity': titleOpacity}">
			<div class="caleido-title">
				<span style="color:#a01a58">c</span>
				<span style="color:#892b64">a</span>
				<span style="color:#723c70">l</span>
				<span style="color:#5c4d7d">e</span>
				<span style="color:#455e89">i</span>
				<span style="color:#2e6f95">d</span>
				<span style="color:#1780a1">o</span>
			</div>
		</div>

		<div class="caleido-title-container-reflect" :style="{'opacity': titleReflectOpacity}">
			<div class="caleido-title">
				<span style="color:#a01a58">c</span>
				<span style="color:#892b64">a</span>
				<span style="color:#723c70">l</span>
				<span style="color:#5c4d7d">e</span>
				<span style="color:#455e89">i</span>
				<span style="color:#2e6f95">d</span>
				<span style="color:#1780a1">o</span>
			</div>
		</div>
		<div class="drop-zone" @drop="onDrop" @dragover="isDragOver = true" @dragleave="isDragOver = false"
			@click="$refs.fileInput.click()">
			<input style="display: none" type="file" @change="onChange" ref="fileInput"
				accept="image/x-png,image/gif,image/jpeg,image/webp">
			<div class="drop-text-div" :style="{'opacity': titleOpacity}">
				<span class="drop-text" :class="{'highlight': isDragOver}"> Drop Image Here</span>
			</div>

		</div>

		<div class="bottom-section" :style="{'bottom': bottomPosition+'%' }">
			<div class="bottom-left">
				<div class="description-container">
					<h1>Looking through a kaleidoscope</h1>
					<div class="description">
						A <a href="https://wikipedia.org/wiki/Kaleidoscope" target="_blank">kaleidoscope</a> is an optical instrument with various reflecting surfaces aligned next to each other at an angle,
						resulting in some interesting symmetrical patterns. This web application plays around with that concept. I do recommend getting or
						<a href="https://www.wikihow.com/Make-a-Kaleidoscope" target="_blank">making</a> a real one if you get the chance though.<br><br>Enjoy!
					</div><br>
				</div>
				<div class="thanks-container">
					<div class="thanks-row">
						<h3 class="thanks-to"> Thanks to</h3>
					</div>
					<div class="thanks-row">
						<a href="https://vuejs.org/" target="_blank" rel="noreferrer noopener" class="thanks-link">VueJS</a> <span class="thanks-why">Javascript framework</span>
					</div>
					<div class="thanks-row">
						<a href="https://unsplash.com/" target="_blank" rel="noreferrer noopener" class="thanks-link">Unsplash</a> <span class="thanks-why">Random images</span>
					</div>
					<div class="thanks-row">
						<a href="https://jsxgraph.uni-bayreuth.de/" target="_blank" rel="noreferrer noopener" class="thanks-link">JSXGraph</a> <span class="thanks-why">Graph library</span>
					</div>
				</div>
			</div>

			<div class="bottom-middle">
				<span class="try-text">or try with demo image</span>
				<div class="images-row">
					<DemoImage :url="randomImage1" @click="start(randomImage1)" alt="Random1" @mouseover="isHoveringDemo = true" @mouseout="isHoveringDemo = false"></DemoImage>
					<DemoImage :url="randomImage2" @click="start(randomImage2)" alt="Random2" @mouseover="isHoveringDemo = true" @mouseout="isHoveringDemo = false"></DemoImage>
					<DemoImage :url="randomImage3" @click="start(randomImage3)" alt="Random3" @mouseover="isHoveringDemo = true" @mouseout="isHoveringDemo = false"></DemoImage>
				</div>
				<div class="images-row">
					<DemoImage :url="randomImage4" @click="start(randomImage4)" alt="Random4" @mouseover="isHoveringDemo = true" @mouseout="isHoveringDemo = false"></DemoImage>
					<DemoImage :url="randomImage5" @click="start(randomImage5)" alt="Random5" @mouseover="isHoveringDemo = true" @mouseout="isHoveringDemo = false"></DemoImage>
					<DemoImage :url="randomImage6" @click="start(randomImage6)" alt="Random6" @mouseover="isHoveringDemo = true" @mouseout="isHoveringDemo = false"></DemoImage>
				</div>
				<div class="random-row">
					<button class="random-button" @click="getRandomImage">Random Image</button>
				</div>


				<div class="quality-buttons-container">
					<span class="resolution-text">Resolution:</span>
					<button class="quality-button" :class="{'selected-quality':quality === 'low' }"
							@click="setQuality('low');getRandomImage()">Low
					</button>
					<button class="quality-button" :class="{'selected-quality':quality === 'medium' }"
							@click="setQuality('medium');getRandomImage()">Medium
					</button>
					<button class="quality-button" :class="{'selected-quality':quality === 'high' }"
							@click="setQuality('high');getRandomImage()">High
					</button>
				</div>


			</div>
			<div class="bottom-right">
				<div class="description-container-right">
					<h3>Pick an image</h3>
					<span class="description">Drag and drop your own image ( <div class="no-cloud-icon" @mouseover="showNoCloudText = true;" @mouseout="showNoCloudText = false;"></div> ), or pick one from the thousands of random images provided by Unsplash. <br>
						Set resolution to "Medium" or "High" for better quality images.<br>
						Supports: JPG, PNG, WEBP, GIF</span><br><br>
					<span class="no-cloud-text">{{noCloudText}}</span>

					<h3>Remix</h3>
					<span class="description">Here starts the fun. Use the mouse to drag/zoom inside the kaledioscope. There are plenty of ways to tweak image, play around!
					</span><br>
					<h3>Download</h3>
					<span class="description">Masterpiece? Download the file to your device. The file will be served as a .png with transparent background.</span><br>
				</div>
			</div>
		</div>
	</div>

	<!--Contact></Contact-->
</template>

<script>
import DemoImage from "@/components/DemoImage";
//import Contact from "@/components/Contact";
import {ref, onMounted, computed} from 'vue'
import {useRouter} from 'vue-router'

export default {
	name: 'Home',
	components: {
		DemoImage,
		//Contact
	},
	setup() {
		const router = useRouter();
		let rawImage = ref(null);
		let quality = ref('low');

		let randomInteger = function (min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		};

		let selectedRandomImage = ref('https://source.unsplash.com/random/600x600');
		let randomImage1 = ref('');
		let randomImage2 = ref('');
		let randomImage3 = ref('');
		let randomImage4 = ref('');
		let randomImage5 = ref('');
		let randomImage6 = ref('');
		let resolution = ref(6);
		let showNoCloudText = ref(false);
		let noCloudText = computed(function(){
			if(showNoCloudText.value){
				return 'The images are never leaving your device. All work happens locally.';
			}else{
				return '';
			}
		});


		let getRandomImage = function () {
			var image1, image2, image3, image4, image5, image6;
			fetch('https://source.unsplash.com/random/' + resolution.value + '' + randomInteger(10, 99) + 'x' + resolution.value + '' + randomInteger(10, 99))
				.then(response => response.blob())
				.then(image => {
					image1 = URL.createObjectURL(image);
					randomImage1.value = image1;
				});

			fetch('https://source.unsplash.com/random/' + resolution.value + '' + randomInteger(10, 99) + 'x' + resolution.value + '' + randomInteger(10, 99))
				.then(response => response.blob())
				.then(image => {
					image2 = URL.createObjectURL(image);
					randomImage2.value = image2;
				});

			fetch('https://source.unsplash.com/random/' + resolution.value + '' + randomInteger(10, 99) + 'x' + resolution.value + '' + randomInteger(10, 99))
				.then(response => response.blob())
				.then(image => {
					image3 = URL.createObjectURL(image);
					randomImage3.value = image3;
				});
			fetch('https://source.unsplash.com/random/' + resolution.value + '' + randomInteger(10, 99) + 'x' + resolution.value + '' + randomInteger(10, 99))
				.then(response => response.blob())
				.then(image => {
					image4 = URL.createObjectURL(image);
					randomImage4.value = image4;
				});

			fetch('https://source.unsplash.com/random/' + resolution.value + '' + randomInteger(10, 99) + 'x' + resolution.value + '' + randomInteger(10, 99))
				.then(response => response.blob())
				.then(image => {
					image5 = URL.createObjectURL(image);
					randomImage5.value = image5;
				});

			fetch('https://source.unsplash.com/random/' + resolution.value + '' + randomInteger(10, 99) + 'x' + resolution.value + '' + randomInteger(10, 99))
				.then(response => response.blob())
				.then(image => {
					image6 = URL.createObjectURL(image);
					randomImage6.value = image6;
				});
		};

		getRandomImage();

		function setQuality(value) {
			quality.value = value;
			switch (value) {
				case 'low':
					resolution.value = 6;
					break;
				case 'medium':
					resolution.value = 12;
					break;
				case 'high':
					resolution.value = 20;
					break;
			}

		}

		let titleOpacity = ref(0);
		let titleReflectOpacity = ref(0);
		let titleLeft = ref(50);
		let titleTop = ref(50);
		let selectedFileURL = ref(null);
		let fileInput = ref(null);
		let isDragOver = ref(false);
		let bottomPosition = ref(0);
		let isHoveringDemo = ref(false);


		onMounted(() => {
			window.addEventListener("dragover", function (e) {
				e.preventDefault();
			}, false);
			window.addEventListener("drop", function (e) {
				e.preventDefault();
			}, false);

			setTimeout(function () {
				titleOpacity.value = 1;
				titleReflectOpacity.value = 0.15;
			}, 500);
		});

		function start(image) {
			router.push({name: 'Editor', params: {userImage: image}});
		}


		function onChange(e) {
			selectedFileURL.value = URL.createObjectURL(e.target.files[0]);
			router.push({name: 'Editor', params: {userImage: selectedFileURL.value}});
		}

		function onDrop(e) {
			e.preventDefault();
			selectedFileURL.value = URL.createObjectURL(e.dataTransfer.files[0]);
			router.push({name: 'Editor', params: {userImage: selectedFileURL.value}});
		}

		return {
			titleOpacity,
			titleReflectOpacity,
			titleLeft,
			titleTop,
			router,
			fileInput,
			isDragOver,
			isHoveringDemo,
			bottomPosition,
			randomImage1,
			randomImage2,
			randomImage3,
			randomImage4,
			randomImage5,
			randomImage6,
			rawImage,
			selectedRandomImage,
			quality,
			setQuality,
			start,
			onChange,
			onDrop,
			getRandomImage,
			noCloudText,
			showNoCloudText,

		}
	}
}
</script>

<style scoped>
span {
	user-select: none;
}

html {
	overflow: hidden;
}

body {
	position: relative;
	margin: 0;
	padding: 0;
	height: 100%;
	overflow: hidden;
	background-color: black;
}

h1 {
	font-family: Biysk;
}

h2 {
	font-family: Biysk;
	text-align: left;
}

h3 {
	font-family: Biysk;
	margin-bottom: 5px;
	font-size: 1.4em;
}

a {
	text-decoration: none;
}

a:link, a:visited {
	color: #6fa3e3;
}

a:hover {
	color: #ffffff;
}


.container {
	width: 100%;
	height: 100vh;
	display: flex;
	justify-content: center;
}

.bg-image {
	position: absolute;
	width: 100%;
	height: 100%;
	background-image: url('../images/caleido2.webp');
	background-repeat: no-repeat;
	background-position: center;
	opacity: 0.05;
	transition: all 0.6s ease;
	z-index: -1;
}

.bg-active {
	opacity: 0.2;
}


button {
	background-color: #111111;
	color: gray;
	height: 100px;
	width: 100%;
	border-radius: 100%;
	border: 1px solid #1c1c1c;
	outline: none;
	margin: 0 auto;
	margin-bottom: 10px;
	font-size: 1.5em;
	font-family: "Biysk";
}

button:hover {
	background-color: #262626;
}

button:active {
	background-color: #005CC8;
}

.caleido-title {
	font-family: "Biysk";
	font-size: 10vw;
	font-weight: bold;
	color: #7e98b5;
	pointer-events: none;
}

.caleido-title-container {

	left: 50%;
	top: 20%;
	position: absolute;
	transform: translate(-50%, -50%);
	transition: opacity;
	transition-duration: 3s;
	pointer-events: none;
}

.caleido-title-container-reflect {
	pointer-events: none;
	left: 50%;
	top: 20%;
	position: absolute;
	transform: translate(-50%, 10%) scale(1, -1);
	-webkit-mask-image: -webkit-gradient(linear, left top,
	left bottom, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 1)));
	filter: blur(8px);
	-webkit-filter: blur(3px);
	opacity: 1;
	transition: opacity;
	transition-duration: 1.5s;
}


.drop-text-div {
	display: flex;
	margin: 0 auto;
	margin-bottom: 20%;
	transition: opacity;
	transition-duration: 3s;
}

.drop-text {
	font-family: Biysk;
	font-size: 2em;
	pointer-events: none;
}

.highlight {
	font-size: 2.1em;
	font-weight: bold;
	color: #6fa3e3;
}

.drop-zone {
	width: 50vh;
	height: 50vh;
	flex-direction: column;
	display: flex;
	justify-content: flex-end;
}

.bottom-section {
	width: 100%;

	height: 50vh;
	bottom: 0;
	position: absolute;
	border-top: 1px solid #222222;
	/*background-color: rgb(10, 12, 15, 0.3);*/
	background-image: linear-gradient(to right, rgba(9,50,63,0.2), rgba(63,10,35,0.2));
	display: flex;
	flex-direction: row;
	justify-content: center;
	overflow: hidden;
	transition: bottom;
	transition-duration: 0.7s;
	transition-timing-function: ease-in-out;

}

.bottom-left {
	width: 33%;
	height: 100%;
}

.bottom-middle {
	margin-top: 20px;
	height: 100%;
}

.bottom-right {
	width: 33%;
	height: 100%;
}

.images-row {
	width: 50vh;
	height: 100px;
	display: flex;
	justify-content: space-between;
	margin: 0 auto;
	margin-bottom: 30px;
	margin-top: 30px;
}

.random-row {
	width: 200px;
	height: 50px;
	margin: 0 auto;
}

.random-button {
	height: 50px;
	border-radius: 30px;
}

.try-text {
	font-family: Biysk;
	font-size: 1.5em;
	margin-bottom: 30px;
}

.resolution-text {
	font-family: Biysk;
	font-size: 1.3em;
	transform: translate(-110%, 30%);
	position: absolute;
}

.description-container {
	width: 60%;
	margin: 0 auto;
	margin-bottom: 20px;
	text-align: left;
}

.thanks-container {
	width: 60%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	font-family: Roboto, sans-serif;
}

.thanks-to {
	font-family: Biysk;
	justify-content: flex-start;
	margin-bottom: 5px;
}

.thanks-row {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

.thanks-link {
	width:35%;
	text-align: left;
}

.thanks-why {
	width: 65%;
	text-align: left;
}

.description-container-right {
	width: 60%;
	margin: 0 auto;
	text-align: left;
}

.no-cloud-icon {
	display: inline-block;
	width: 16px;
	height: 16px;
	background-image: url('../images/cloud_off.png');
	background-repeat: no-repeat;
	background-size: contain;
	border-style: none;
	transform:translate(0, 5px);
	opacity:0.7;
}

.no-cloud-icon:hover {
	opacity:1;
}

.no-cloud-text {
	font-size: 0.8em;
	font-family: Roboto, sans-serif;
}


.description {
	font-family: 'Roboto', sans-serif;
	font-size: 1em;
	text-align: left;
	color: #5e7085;
}

.quality-buttons-container {
	width: 100%;
	height: 30px;
	margin-top: 20px;
}

.quality-button {
	width: 100px;
	height: 20px;
	font-size: 0.8em;
	border-radius: 10px;
	margin: 5px;
}

.selected-quality {
	border: 2px solid #6fa3e3;
}


/********** RESPONSIVENESS ***********/


@media all and (max-width: 1400px) {
	.description-container,
	.description-container-right,
	.thanks-container {
		width: 80%;
	}

	.description {
		font-size: 0.8em;
	}

	.thanks-why,
	.thanks-link {
		font-size: 0.8em;
	}

}


@media all and (max-width: 900px) {
	.bottom-left {
		display: none;
	}

	.bottom-right {
		display: none;
	}
}
</style>
