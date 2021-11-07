<template>
	<Filters></Filters>
	<div class="dummy-container" :style="{'min-width':dummyContainerWidth, height:'100%;'}"></div>
	<div class="editor-container">
		<div :style="{'min-height':'3vh', width:'100%'}"></div>
		<div class="canvasWindow" @wheel.prevent="scrollWheelScale($event)" :style="{'filter': filterBlurEdges()}" ref="capture">

			<div class="circleWrapper"
				:style="{
				// 'overflow': isCircular ? 'hidden': 'initial',
				'overflow': 'hidden',
				'border-radius': isCircular ? '100%': '0%',
				'width'   : sliceHeight+'px',
				'height'  : sliceHeight+'px'
				}">
				<div v-if="sectors !== 2">

					<div
						ref="sectorImage"
						v-for="n in sectors"
						:key="n"
						class="imageContainer"
						@mousedown="startDrag($event)"
						@touchstart="startDrag($event)"
						@wheel.prevent="scrollWheelZoom($event)"
						:style="{
                  'background-image'     : imgImageURL(),
                  'width'                : imgWidth(),
                  'height'               : imgHeight(),
                  'transform'            : imgTransform(n),
                  'clip-path'            : imgClipPath(),
                  'background-position'  : imgBackgroundPosition(imgX/(zoom/100), imgY/(zoom/100)),
                  'background-size'      : imageSize(),
                  'opacity'              : opacity,
                  'filter'               : applyFilters(),
                }">
					</div>
				</div>
				<div
					v-if="sectors === 2"
					class="imageContainer"
					@mousedown="startDrag($event)"
					@touchstart="startDrag($event)"
					@wheel.prevent="scrollWheelZoom($event)"
					:style="{
                'background-image'   : imgImageURL(),
                'width'              : 'inherit',
                'height'             : 'inherit',
                'transform'          : 'translate(-50%, -50%)',
                'background-position': imgBackgroundPosition(-imgX, imgY),
                'opacity'            : opacity,
                'filter'             : applyFilters()
              }">
				</div>
			</div>
			<div
				ref="blendImage"
				class="blend-image"
				:style="{
					'background-image': blendImageURL(),
					'background-color': 'blue',
					'background-size' : '100% 100%',
					'mix-blend-mode'  : blendMode,
					'border-radius'   : isCircular ? '100%'   : '0%',
					'width'           : sliceHeight+'px',
					'height'          : sliceHeight+'px',
					'opacity'         : blendOpacity,
					'opacity'         : blendOpacity,
					'filter'          : applyOverlayFilters()
				}">
			</div>
		</div>
		<transition name="fade">
			<div class="menuWindow" @wheel.prevent="scrollWheelScale($event)">
				<router-link to="/">
					<button>Start Page</button>
				</router-link>
				<button @click="newRandomImage(1000)">New Random Image</button>
				<button @click="takeScreenshot">Download</button>
				<div class="blend-image-preview" :style="{'background-image': blendImageURL()}">
					<div class="clear-blend" @click="clearBlend">
						x
					</div>
				</div>
				<button @click="setCurrentImageAsBlend">Save as Blend</button>
				<button @click="nextBlendMode" label="Blend Mode">Blend Mode {{ blendModes.indexOf(blendMode) }}:
					{{ blendMode }}
				</button>
				<button @click="recurse">Recurse</button>
				<Checkbox label="Circular" v-model="isCircular"></Checkbox>
				<Checkbox label="Invert" v-model="isInverted"></Checkbox>
<!--				<Checkbox label="Animate" v-model="isPlay"></Checkbox>-->
				<Slider label="Animate" :min="-20" :max="20" v-model="animationSpeed"></Slider>


			</div>
		</transition>
		<div class="graph-wrapper">
			<div id="jsxgraph" class="jxgbox"></div>
			<button ref="resetGraphButton" class="reset-graph">Reset</button>
		</div>

	</div>

</template>

<script>

import JXG from 'jsxgraph'
import Filters from '../components/Filters'
import Slider from '../components/Slider'
import Checkbox from '../components/Checkbox'
//import Select from '../components/Select'
import {ref, computed, watch, onMounted} from 'vue'
import {toPng, toBlob} from 'dom-to-image'


export default {
	name: 'Editor',
	components: {
		Slider,
		Checkbox,
		//Select,
		Filters,
	},
	props: {
		userImage: String
	},
	setup(props) {
		let xText, yText;
		let capture = ref(null);
		let selectedFileURL = ref(props.userImage);
		let blendFileURL = ref(false);
		let imageURL = computed(() => {
			if (selectedFileURL.value) {
				return selectedFileURL.value;
			}
		});
		let blendURL = computed(() => {
			if (blendFileURL.value) {
				return blendFileURL.value;
			}
		});
		let sectors     = ref(6);
		let rotateValue = ref(60);
		// let sliceHeight = ref(400);
		let sliceHeight = ref((window.innerHeight-(window.innerHeight*0.06)) );
		let sliceWidth  = ref(2 * sliceHeight.value * Math.tan(Math.PI / sectors.value));
		let circumRadius = computed(() => {
			return Math.sqrt(Math.pow(sliceWidth.value / 2, 2) + Math.pow(sliceHeight.value, 2))
		});
		let sideLength = computed(() => {
			return sliceHeight.value * Math.tan(Math.PI / sectors.value)
		});
		let sliceAngle  = ref(100);
		let imgX        = ref(0);
		let imgY        = ref(0);
		let zoom        = ref(120);
		let opacity     = ref(1);
		let scale       = ref(1);
		let sync        = ref(true);
		let blendMode   = ref("normal");
		let isCircular  = ref(true);
		let isAutoAlign = ref(true);
		let blurEdges   = ref(0);
		let brightness  = ref(100);
		let contrast    = ref(100);
		let grayscale   = ref(0);
		let hueRotate   = ref(0);
		let saturate    = ref(100);
		let sepia       = ref(0);

		let blendOpacity = ref(0.1);
		let blendHue     = ref(0);
		let blendImage   = ref(false);
		let sectorImage   = ref(false);

		let animationSpeed = ref(0);

		let isPlay       = ref(true);
		let isAnimating  = ref(false);
		let isInverted   = ref(false);
		let blendModes = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'saturation', 'color', 'luminosity'];
		let actionKeys = {
			Control: {pressed: false}
		};

		let initialX             = ref(0);
		let initialY             = ref(0);
		let xOffset              = ref(-imgX.value);
		let yOffset              = ref(-imgY.value);
		let currentX             = ref(0);
		let currentY             = ref(0);
		let isDragging           = ref(false);
		let resetGraphButton	 = ref(false);
		let dummyContainerWidth	 = ref(window.innerWidth/4 + 'px');

		window.addEventListener('resize', function(){
			if(window.innerWidth/4 < 250){
				dummyContainerWidth.value = '250px';
			}else{
				dummyContainerWidth.value = window.innerWidth/4 + 'px';
			}
			sliceHeight.value = (window.innerHeight-(window.innerHeight*0.06));
			distributeEven();
		});

		let xName = ref('');
		let yName = ref('');

		const imgImageURL = () => "url('" + imageURL.value + "')";

		const blendImageURL = () => "url('" + blendURL.value + "')";

		const imgTransform = n => 'translate(-50%, 0%) rotate(' + (n * rotateValue.value) + 'deg) scale(' + scale.value + ')';

		const imgClipPath = () => 'polygon(50% 0%,' + (50 - sliceAngle.value / 2) + '% 100%, ' + (50 + sliceAngle.value / 2) + '% 100%)';

		const imgBackgroundPosition = (imgX, imgY) => imgX + '% ' + imgY + '%';

		const imgWidth = () => sliceWidth.value + 'px';

		const imgHeight = () => sliceHeight.value + 'px';

		const imageSize = () => zoom.value + '% ' + zoom.value + '%';

		const alignRotation = () => {
			rotateValue.value = 360 / sectors.value;
		};

		function distributeEven() {
			alignRotation();
			sliceWidth.value = sideLength.value*2;
		}

		function hideCursor() {
			document.body.style.cursor = "none"
		}

		function showCursor() {
			document.body.style.cursor = "default"
		}

		function applyFilters() {
			return filterBrightness() + filterHue() + filterContrast() + filterGrayscale() + filterInvert() + filterSaturate() + filterSepia()
		}

		function applyOverlayFilters() {
			return filterblendHue()
		}

		function filterBlurEdges() {
			return 'blur(' + blurEdges.value + 'px) '
		}

		function filterBrightness() {
			return 'brightness(' + brightness.value + '%) '
		}

		function filterContrast() {
			return 'contrast(' + contrast.value + '%) '
		}

		function filterGrayscale() {
			return 'grayscale(' + grayscale.value + '%) '
		}

		function filterHue() {
			return 'hue-rotate(' + hueRotate.value + 'deg) '
		}

		function filterblendHue() {
			return 'hue-rotate(' + blendHue.value + 'deg) '
		}

		function filterInvert() {
			return 'invert(' + (isInverted.value * 100) + '%) '
		}

		function filterSaturate() {
			return 'saturate(' + saturate.value + '%) '
		}

		function filterSepia() {
			return 'sepia(' + sepia.value + '%) '
		}


		function nextBlendMode() {
			blendMode.value = blendModes[blendModes.indexOf(blendMode.value) + 1];
		}

		function clearBlend() {
			blendFileURL.value = "";
		}

		function saveAs(url, filename) {
			let link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

		function takeScreenshot() {
			toPng(capture.value)
				.then(function (dataUrl) {
					saveAs(dataUrl, 'caleido.png')
				})
				.catch(function (error) {
					console.error('oops, something went wrong!', error);
				});
		}

		function recurse() {
			toBlob(capture.value)
				.then(function (blob) {
					var image = new Image();
					image.src = URL.createObjectURL(blob);
					selectedFileURL.value = image.src;
				})
				.catch(function (error) {
					console.error('oops, something went wrong!', error);
				});
		}

		function setCurrentImageAsBlend() {
			toBlob(capture.value)
				.then(function (blob) {
					var image = new Image();
					image.src = URL.createObjectURL(blob);
					blendFileURL.value = image.src;
				})
				.catch(function (error) {
					console.error('oops, something went wrong!', error);
				});
		}

		let animate;
		animate = function () {
			imgY.value += animationSpeed.value;
			if (isPlay.value) {
				isAnimating.value = true;
				requestAnimationFrame(animate);
			}
		}
		animate();

		watch([sectors, isAutoAlign], () => {
			if (isAutoAlign.value) {
				distributeEven()
			}
		});

		watch([animationSpeed], () => {
			if (animationSpeed.value === 0) {
				isPlay.value = false;
				isAnimating.value = false;
			}else{
				isPlay.value = true;
				if(!isAnimating.value){
					animate();
				}
			}
		});


		window.addEventListener('keydown', function (e) {
			if (actionKeys[e.key]) {
				actionKeys[e.key].pressed = true;
			}
		});

		window.addEventListener('keyup', function (e) {
			if (actionKeys[e.key]) {
				actionKeys[e.key].pressed = false;
			}
		});

		function scrollWheelZoom(e) {
			if (actionKeys["Control"].pressed) {
				zoom.value += e.deltaY * -0.1;
			} else {
				zoom.value += e.deltaY * -0.01;
			}

			zoom.value = Math.min(Math.max(10, zoom.value), 1000);
		}

		// function scrollWheelScale(e) {
		//
		// 	if (e.target.className === "imageContainer") {
		// 		return;
		// 	}
		// 	if (actionKeys["Control"].pressed) {
		// 		scale.value += e.deltaY * -0.001;
		// 	} else {
		// 		scale.value += e.deltaY * -0.0001;
		// 	}
		// 	scale.value = Math.min(Math.max(0.01, scale.value), 10);
		// }
		function scrollWheelScale() { return; }

		let randomInteger = function (min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		};

		function newRandomImage(resolution) {

			fetch('https://source.unsplash.com/random/' + resolution + '' + randomInteger(10, 99) + 'x' + resolution + '' + randomInteger(10, 99))
				.then(response => response.blob())
				.then(image => {
					selectedFileURL.value = URL.createObjectURL(image);
				});
		}

		function startDrag(e) {
			if (e) {

				if (e.touches) {
					initialX.value = e.touches[0].clientX - xOffset.value;
					initialY.value = e.touches[0].clientY - yOffset.value;
				} else {
					initialX.value = e.clientX - xOffset.value;
					initialY.value = e.clientY - yOffset.value;
				}
				isDragging.value = true;
				hideCursor();

				document.addEventListener("mousemove", drag);
				document.addEventListener("mouseup", endDrag);
				document.addEventListener("touchmove", drag);
				document.addEventListener("touchend", endDrag);
			}
		}

		function endDrag() {
			initialX.value = currentX.value;
			initialY.value = currentY.value;

			isDragging.value = false;
			showCursor();
			document.removeEventListener("mousemove", drag);
			document.removeEventListener("mouseup", endDrag);
			document.removeEventListener("touchmove", drag);
			document.removeEventListener("touchend", endDrag);
		}

		function drag(e) {
			if (isDragging.value) {


				//if touch or mouse
				if (e.touches) {
					currentX.value = e.touches[0].clientX - initialX.value;
					currentY.value = e.touches[0].clientY - initialY.value;
				} else {
					e.preventDefault();
					currentX.value = e.clientX - initialX.value;
					currentY.value = e.clientY - initialY.value;
				}


				xOffset.value = currentX.value;
				yOffset.value = currentY.value;

				imgX.value = -currentX.value;
				imgY.value = -currentY.value;

			}
		}

		onMounted(() => {
			let board = JXG.JSXGraph.initBoard('jsxgraph', {
				boundingbox: [-0.5, 10.5, 10.5, -0.5],
				axis: true,
				grid: false,
				showCopyright: false,
				showNavigation: false,
				pan: {enabled: false, needTwoFingers: true},
				zoom: {enabled: false},
				defaultAxes: {
					x: {ticks: {label: {visible: false}}},
					y: {ticks: {label: {visible: false}}}
				}
			});
			xText = board.create('text', [9, 0.5, function () {
				return xName.value
			}], {color: 'white', anchorX: 'right'});
			yText = board.create('text', [0.5, 9, function () {
				return yName.value
			}], {color: 'white'});

			let graphPoint = function (x, y, name, color, xName, yName, xRef, yRef, xFactor, yFactor, options) {
				options = options || {};
				let fullOptions = {
					name: name,
					label: {
						color: 'black',
						highlight: false,
						offset: [0, 0],
						anchorX: 'middle',
						anchorY: 'middle',
						fontSize: 9
					},
					highlightFillcolor: false,
					highlightStrokeWidth: 2,
					highlightStrokeColor: color,
					snapToGrid: false,
					size: 9,
					fillColor: color,
					strokeWidth: 0,
					strokeColor: color,
					showInfobox: false,
					...options
				}
				let point = board.create('point', [x, y], fullOptions);
				point.on('over', function () {
					xText.setAttribute({color: color});
					yText.setAttribute({color: color});
					xText.setText(xName);
					yText.setText(yName);
				})
				point.on('out', function () {
					xText.setText('');
					yText.setText('');
				})
				point.coords.on('update', function () {
					xRef.value = point.X() * xFactor;
					yRef.value = point.Y() * yFactor;
				});
				return point;
			};


			let cb = graphPoint(2, 2, 'CB', 'red', 'Brightness', 'Contrast', brightness, contrast, 50, 50, {
				snapToGrid: false,
				snapSizeX: 0.1,
				snapSizeY: 0.1
			});
			let sh = graphPoint(0, 2, 'SH', 'magenta', 'Hue', 'Saturation', hueRotate, saturate, 36, 50);
			let sg = graphPoint(1, 0, 'SG', 'gray', 'Grayscale', 'Sepia', grayscale, sepia, 10, 10);
			let ob = graphPoint(10, 0, 'OB', 'darkgray', 'Opacity', 'BlurEdges', opacity, blurEdges, 0.1, 10);

			//blend-image
			let blend = graphPoint(5, 1, 'blend', 'darkgray', 'Hue', 'Opacity', blendHue, blendOpacity ,36, 0.1,{face:'[]',size:15});

			resetGraphButton.value.onclick = function(){
				cb.moveTo([2,2],500);
				sh.moveTo([0,2],500);
				sg.moveTo([1,0],500);
				ob.moveTo([10,0],500);
				blend.moveTo([5,0],500);
			}

			let sectorSlider = board.create('slider', [[1, 10], [9, 10], [2, 6, 60]], {
				size: 9,
				strokeColor: 'blue',
				name: '',
				snapWidth: 1,
				precision: 0,
				label: {color: 'white'},
				baseline: {strokeColor: 'gray'}
			});
			sectorSlider.on('drag', function () {
				sectors.value = this.Value();
				sectorSlider.label.setText(this.Value());
				if (this.Value() === 2) {
					sectorSlider.label.setText('1')
				}
			});

			sectorSlider.on('over', function () {
				xText.setText('Sectors');
				yText.setText(' ');
				yText.setAttribute({color: 'yellow'});
			})
			sectorSlider.on('out', function () {
				xText.setText('');
				yText.setText('');
				yText.setAttribute({color: 'yellow'})
			})

			window.addEventListener('resize', function () {
				board.setBoundingBox([-0.5, 10.5, 10.5, -0.5], true);
			})

		});


		return {
			sectors,
			rotateValue,
			sliceAngle,
			sliceWidth,
			sliceHeight,
			imgX,
			imgY,
			zoom,
			opacity,
			scale,
			sync,
			imageURL,
			blendURL,
			blendMode,
			blendModes,
			circumRadius,
			sideLength,
			isCircular,
			isAutoAlign,
			isDragging,
			blurEdges,
			brightness,
			contrast,
			grayscale,
			hueRotate,
			saturate,
			sepia,
			blendOpacity,
			blendHue,
			isPlay,
			isInverted,
			capture,
			resetGraphButton,
			dummyContainerWidth,
			blendImage,
			sectorImage,
			animationSpeed,
			imgImageURL,
			blendImageURL,
			imgTransform,
			imgClipPath,
			imgWidth,
			imgHeight,
			imgBackgroundPosition,
			imageSize,
			startDrag,
			scrollWheelScale,
			scrollWheelZoom,
			applyFilters,
			applyOverlayFilters,
			filterBlurEdges,
			takeScreenshot,
			recurse,
			nextBlendMode,
			setCurrentImageAsBlend,
			newRandomImage,
			clearBlend

		}
	}
}
</script>

<style>

.editor-container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}



#jsxgraph {
	height: 100%;
	width: 100%;
	z-index: 999;
}

.graph-wrapper {
	width: 200px;
	height: 200px;
	display: block;
	position: absolute;
	bottom: 60px;
	left: 20px;
}

.reset-graph {
	margin-top: 15px;
	z-index:9999;
}

button {
	background-color: #111111;
	color: gray;
	height: 30px;
	width: 100%;
	border-radius: 20px;
	border: 1px solid #1c1c1c;
	outline: none;
	margin: 0 auto;
	margin-bottom: 10px;
}

button:hover {
	background-color: #262626;
}

button:active {
	background-color: #005CC8;
}

select {
	background-color: transparent;
	color: gray;
	outline: none;
	border: none;
	width: 150px;
	margin: 0 auto;
	font-size: 1em;
	margin-bottom: 20px;
}


.imageContainer {
	width: 50vh;
	height: 50vh;
	position: absolute;
	top: 50%;
	left: 50%;
	transform-origin: 50% 0%;

}

.blend-image-preview {
	border: 1px solid #424242;
	width: 200px;
	height: 200px;
	margin-top: 20px;
	margin-bottom: 10px;
	background-size: contain;
	background-repeat: no-repeat;
	position: relative;
}

.clear-blend {
	width:20px;
	height:20px;
	position:absolute;
	right:0;
	top:0;
	cursor: pointer;
}

.clear-blend:active {
	transform: scale(0.9);
}

.circleWrapper {
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	position: absolute;
	overflow: hidden;
	border-radius: 100%;
}


.canvasWindow {
	width: calc(94vh);

	height: calc(94vh);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.blend-image {
	width:50%;
	height:50%;
	left:50%;
	top:50%;
	transform: translate(-50%, -50%);
	position: absolute;
	overflow: hidden;
	pointer-events:none;
	background-position: -50% -50%;
}

.menuWindow {
	width: 200px;
	height: auto;
	display: flex;
	flex-direction: column;
	padding: 0 20px;
	z-index: 999;
	background-color: transparent;
	padding-top: 20px;
	position: absolute;
	left: 0;

}

@media all and (min-width:767px) and (max-width: 1024px) {

	.dummy-container {
		display:none;
	}

	.menuWindow {

		width: 50%;
		position:absolute;
		right:0;
		bottom:0;
		left:unset;

	}

	.blend-image-preview {
		display:none;
	}

	.editor-container {
		height: 100vh;
		width: 100%;
	}

	.canvasWindow {
		transform:scale(0.6) translate(-15%, -30%);

	}

	.graph-wrapper {
		width: 300px;
		height: 300px;
		display: block;
		position: absolute;
		bottom: 10px;
		left: 10px;
	}

}

@media all and (max-width: 767px) {

	.dummy-container {
		display:none;
	}

	.menuWindow {

		width: 40%;
		position:absolute;
		right:0;
		bottom:0;
		left:unset;

	}

	.blend-image-preview {
		display:none;
	}

	.editor-container {
		height: 100vh;
		width: 100%;
	}

	.canvasWindow {
		transform: scale(0.45) translate(-55%, -55%);
	}

	.graph-wrapper {
		width: 150px;
		height: 150px;
		display: block;
		position: absolute;
		bottom: 10px;
		left: 10px;
	}

}

</style>
