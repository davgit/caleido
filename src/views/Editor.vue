<template>
	<Filters></Filters>
	<div class="dummy-container" :style="{'min-width':dummyContainerWidth, height:'100%;'}"></div>
	<div class="editor-container">
		<div :style="{'min-height':'2vh', width:'100%'}"></div>
		<div class="canvasWindow" :style="{'filter': filterBlurEdges()}"
			ref="capture">
			<div
				id="under-layer"
				class="circleWrapper"
				:style="{
					'overflow'     : 'hidden',
					'border-radius': isCircular ? '100%': '0%',
					'width'        : sliceHeight+'px',
					'height'       : sliceHeight+'px',
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
				id="main-layer"
				class="circleWrapper"
				:style="{
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
				ref="blendImage1"
				class="blend-image"
				v-if="showBlendLayer1"
				:style="{
					'background-image': blendImageURL1(),
					'background-color': 'blue',
					'background-size' : '100% 100%',
					'mix-blend-mode'  : blendMode1,
					'border-radius'   : isCircular ? '100%'   : '0%',
					'width'           : sliceHeight+'px',
					'height'          : sliceHeight+'px',
					'opacity'         : blendOpacity1,
					'filter'          : applyOverlayFilters1()
				}">
			</div>

			<div
				ref="blendImage2"
				class="blend-image"
				v-if="showBlendLayer2"
				:style="{
					'background-image': blendImageURL2(),
					'background-color': 'blue',
					'background-size' : '100% 100%',
					'mix-blend-mode'  : blendMode2,
					'border-radius'   : isCircular ? '100%'   : '0%',
					'width'           : sliceHeight+'px',
					'height'          : sliceHeight+'px',
					'opacity'         : blendOpacity2,
					'filter'          : applyOverlayFilters2()
				}">
			</div>

		</div>
		<transition name="fade">
			<div class="menuWindow">
				<router-link to="/">
					<div class="caleido-title">
						<span style="color:#a01a58">c</span>
						<span style="color:#892b64">a</span>
						<span style="color:#723c70">l</span>
						<span style="color:#5c4d7d">e</span>
						<span style="color:#455e89">i</span>
						<span style="color:#2e6f95">d</span>
						<span style="color:#1780a1">o</span>
					</div>
				</router-link>
				<div class="topbar">
					<button class="topbar-button new-image-button"
						:style="{
								transform: 'rotate('+newImageRotateValue+'deg)'
							}"
						@click     = "newRandomImage(12)"
						@mouseover = "topbarTooltipText = 'New Image'"
						@mouseout  = "topbarTooltipText = ''"
					>
					</button>

					<button class="topbar-button download-button"
						@click     = "takeScreenshot"
						@mouseover = "topbarTooltipText = 'Download'"
						@mouseout  = "topbarTooltipText = ''"
					></button>

					<span class="topbar-tooltip">{{topbarTooltipText}}</span>
				</div>
				<div class="blends-container">
					<div class="blend-container" :style="{'border-right': '1px solid #424242'}">
						<div id="blendBox1" class="blend-image-preview" :style="{'background-image': blendImageURL1()}">
							blend1
							<div class="clear-blend" @click="clearBlend1">
								x
							</div>
						</div>
						<button class="blend-button" @click="setCurrentImageAsBlend(1)">Save Blend</button>
						<button class="blend-button" @click="nextBlendMode(1)">{{ blendMode1 }}</button>
					</div>
					<div class="blend-container">
						<div id="blendBox2" class="blend-image-preview" :style="{'background-image': blendImageURL2()}">
							blend2
							<div class="clear-blend" @click="clearBlend2">
								x
							</div>
						</div>
						<button class="blend-button" @click="setCurrentImageAsBlend(2)">Save Blend</button>
						<button class="blend-button" @click="nextBlendMode(2)">{{ blendMode2 }}</button>
					</div>
				</div>
				<button @click="nextImageSizeMode">Image Mode :
					{{ imageSizeMode }}
				</button>
				<button @click="recurse">Recurse</button>
				<Checkbox label="Circular" v-model="isCircular"></Checkbox>
				<Checkbox label="Blend Layer1" v-model="showBlendLayer1"></Checkbox>
				<Checkbox label="Blend Layer2" v-model="showBlendLayer2"></Checkbox>
				<Checkbox label="Invert" v-model="isInverted"></Checkbox>
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
import {ref, computed, watch, onMounted} from 'vue'
import {toPng, toBlob} from 'dom-to-image'


export default {
	name: 'Editor',
	components: {
		Slider,
		Checkbox,
		Filters,
	},
	props: {
		userImage: String
	},
	setup(props) {
		let xText, yText;
		let capture = ref(null);
		let selectedFileURL = ref(props.userImage);
		let blendFileURL1 = ref(false);
		let blendFileURL2 = ref(false);
		let imageURL = computed(() => {
			if (selectedFileURL.value) {
				return selectedFileURL.value;
			}
		});
		let blendURL1 = computed(() => {
			if (blendFileURL1.value) {
				return blendFileURL1.value;
			}
		});
		let blendURL2 = computed(() => {
			if (blendFileURL2.value) {
				return blendFileURL2.value;
			}
		});

		let sectors = ref(6);
		let rotateValue = ref(60);

		// let sliceHeight = ref(400);
		let sliceHeight = ref((window.innerHeight - (window.innerHeight * 0.06)));
		let sliceWidth = ref(2 * sliceHeight.value * Math.tan(Math.PI / sectors.value));
		let circumRadius = computed(() => {
			return Math.sqrt(Math.pow(sliceWidth.value / 2, 2) + Math.pow(sliceHeight.value, 2))
		});
		let sideLength = computed(() => {
			return sliceHeight.value * Math.tan(Math.PI / sectors.value)
		});
		let sliceAngle = ref(100);
		let imgX = ref(0);
		let imgY = ref(0);
		let zoom = ref(120);
		let opacity = ref(1);
		let scale = ref(1);
		let sync = ref(true);
		let blendMode1 = ref("normal");
		let blendMode2 = ref("normal");
		let isCircular = ref(true);
		let showUnderLayer = ref(true);
		let showBlendLayer1 = ref(true);
		let showBlendLayer2 = ref(true);
		let isAutoAlign = ref(true);
		let blurEdges = ref(0);
		let brightness = ref(100);
		let contrast = ref(100);
		let grayscale = ref(0);
		let hueRotate = ref(0);
		let saturate = ref(100);
		let sepia = ref(0);

		let blendOpacity1 = ref(0.1);
		let blendOpacity2 = ref(0.1);
		let blendHue1 = ref(0);
		let blendHue2 = ref(0);
		let blendImage1 = ref(false);
		let blendImage2 = ref(false);

		let sectorImage = ref(false);

		let animationSpeed = ref(0);

		let isPlay = ref(false);
		let isAnimating = ref(false);
		let isInverted = ref(false);
		let blendModes = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'saturation', 'color', 'luminosity'];
		let imageSizeMode = ref('Stretch');
		let imageSizeModes = ['Stretch', 'Fixed', 'Auto'];
		let actionKeys = {
			Control: {pressed: false}
		};

		let initialX = ref(0);
		let initialY = ref(0);
		let xOffset = ref(-imgX.value);
		let yOffset = ref(-imgY.value);
		let currentX = ref(0);
		let currentY = ref(0);
		let isDragging = ref(false);
		let resetGraphButton = ref(false);
		let dummyContainerWidth = ref(window.innerWidth / 4 + 'px');
		let newImageRotateValue = ref(0);
		let topbarTooltipText = ref("");


		window.addEventListener('resize', function () {
			if (window.innerWidth / 4 < 250) {
				dummyContainerWidth.value = '250px';
			} else {
				dummyContainerWidth.value = window.innerWidth / 4 + 'px';
			}
			sliceHeight.value = (window.innerHeight - (window.innerHeight * 0.06));
			distributeEven();
		});

		let xName = ref('');
		let yName = ref('');

		const imgImageURL = () => "url('" + imageURL.value + "')";

		const blendImageURL1 = () => "url('" + blendURL1.value + "')";
		const blendImageURL2 = () => "url('" + blendURL2.value + "')";

		const imgTransform = n => 'translate(-50%, 0%) translateZ(10px) rotate(' + (n * rotateValue.value) + 'deg) scale(' + scale.value + ')';

		const imgClipPath = () => 'polygon(50% 0%,' + (50 - sliceAngle.value / 2) + '% 100%, ' + (50 + sliceAngle.value / 2) + '% 100%)';

		const imgBackgroundPosition = (imgX, imgY) => imgX + '% ' + imgY + '%';

		const imgWidth = () => sliceWidth.value + 'px';

		const imgHeight = () => sliceHeight.value + 'px';

		// const imageSize = () => zoom.value + '% ' + zoom.value + '%';
		const imageSize = () => {
			let mode = imageSizeMode.value;
			if (mode === 'Stretch') {
				return zoom.value + '% ' + zoom.value + '%';
			} else {
				return mode;
			}
		};

		const alignRotation = () => {
			rotateValue.value = 360 / sectors.value;
		};

		function distributeEven() {
			alignRotation();
			sliceWidth.value = sideLength.value * 2;
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

		function applyOverlayFilters1() {
			return filterblendHue1()
		}

		function applyOverlayFilters2() {
			return filterblendHue2()
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

		function filterblendHue1() {
			return 'hue-rotate(' + blendHue1.value + 'deg) '
		}

		function filterblendHue2() {
			return 'hue-rotate(' + blendHue2.value + 'deg) '
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


		function nextBlendMode(blendIndex) {
			if(blendIndex === 1){
				let next = blendModes.indexOf(blendMode1.value) + 1;
				if (next > blendModes.length - 1) {
					next = 0;
				}
				blendMode1.value = blendModes[next];
			}else{
				let next = blendModes.indexOf(blendMode2.value) + 1;
				if (next > blendModes.length - 1) {
					next = 0;
				}
				blendMode2.value = blendModes[next];
			}
		}

		function nextImageSizeMode() {
			let next = imageSizeModes.indexOf(imageSizeMode.value) + 1;
			if (next > imageSizeModes.length - 1) {
				next = 0;
			}
			imageSizeMode.value = imageSizeModes[next];
		}

		function clearBlend1() {
			blendFileURL1.value = "";
		}

		function clearBlend2() {
			blendFileURL1.value = "";
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
					console.error('error, could not take screenshot!', error);
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
					console.error('error, could not do recurse!', error);
				});
		}

		function setCurrentImageAsBlend(blendIndex) {
			toBlob(capture.value)
				.then(function (blob) {
					var image = new Image();
					image.src = URL.createObjectURL(blob);
					if(blendIndex === 1){
						blendFileURL1.value = image.src;
					}else{
						blendFileURL2.value = image.src;
					}

				})
				.catch(function (error) {
					console.error('error, could not set blend layer!', error);
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
			} else {
				isPlay.value = true;
				if (!isAnimating.value) {
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

		let randomInteger = function (min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function rotateNewImage() {
			newImageRotateValue.value += 360;
		}

		function newRandomImage(resolution) {
			rotateNewImage();
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

			let blend1 = JXG.JSXGraph.initBoard('blendBox1', {
				boundingbox: [0, 10, 10, 0],
				axis: false,
				grid: {opacity:0.05},
				showCopyright: false,
				showNavigation: false,
				pan: {enabled: false, needTwoFingers: true},
				zoom: {enabled: false},
				moveTarget: document
			});

			blend1.create('image', [blendURL1.value,[0,0],[10,10]]);
			let blendPoint1 = blend1.create('point', [5,5],{showInfoBox:false, withlabel:false});
			// var blend1Circle = blend1.create('circle', [[5,5],[9.5,5]],{fixed:true, highlight:false, showInfoBox:false, withlabel:false});
			// blend1.create('glider', [10,5,blend1Circle],{showInfoBox:false, withlabel:false});

			blendPoint1.coords.on('update', function () {
				blendHue1.value = blendPoint1.X() * 36;
				blendOpacity1.value = blendPoint1.Y() * 0.1;
			});

			let blend2 = JXG.JSXGraph.initBoard('blendBox2', {
				boundingbox: [0, 10, 10, 0],
				axis: false,
				grid: {opacity:0.05},
				showCopyright: false,
				showNavigation: false,
				pan: {enabled: false, needTwoFingers: true},
				zoom: {enabled: false},
				moveTarget: document
			});

			blend2.create('image', [blendURL2.value,[0,0],[10,10]]);
			let blendPoint2 = blend2.create('point', [5,5],{showInfoBox:false, withlabel:false});
			// var blend2Circle = blend2.create('circle', [[5,5],[9.5,5]],{fixed:true, highlight:false, showInfoBox:false, withlabel:false});
			// blend2.create('glider', [10,5,blend2Circle],{showInfoBox:false, withlabel:false});

			blendPoint2.coords.on('update', function () {
				blendHue2.value = blendPoint2.X() * 36;
				blendOpacity2.value = blendPoint2.Y() * 0.1;
			});

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
			// let blend = graphPoint(5, 1, 'blend', 'darkgray', 'Hue', 'Opacity', blendHue, blendOpacity, 36, 0.1, {
			// 	face: '[]',
			// 	size: 15
			// });

			resetGraphButton.value.onclick = function () {
				cb.moveTo([2, 2], 500);
				sh.moveTo([0, 2], 500);
				sg.moveTo([1, 0], 500);
				ob.moveTo([10, 0], 500);
				// blend.moveTo([5, 0], 500);
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
			animationSpeed,
			blendHue1,
			blendHue2,
			blendImage1,
			blendImage2,
			blendMode1,
			blendMode2,
			blendModes,
			blendOpacity1,
			blendOpacity2,
			blendURL1,
			blendURL2,
			blurEdges,
			brightness,
			capture,
			circumRadius,
			contrast,
			dummyContainerWidth,
			grayscale,
			hueRotate,
			imageSizeMode,
			imageSizeModes,
			imageURL,
			imgX,
			imgY,
			isAutoAlign,
			isCircular,
			isDragging,
			isInverted,
			isPlay,
			newImageRotateValue,
			opacity,
			resetGraphButton,
			rotateValue,
			saturate,
			scale,
			sectorImage,
			sectors,
			sepia,
			showBlendLayer1,
			showBlendLayer2,
			showUnderLayer,
			sideLength,
			sliceAngle,
			sliceHeight,
			sliceWidth,
			sync,
			topbarTooltipText,
			zoom,
			applyFilters,
			applyOverlayFilters1,
			applyOverlayFilters2,
			blendImageURL1,
			blendImageURL2,
			clearBlend1,
			clearBlend2,
			filterBlurEdges,
			imageSize,
			imgBackgroundPosition,
			imgClipPath,
			imgHeight,
			imgImageURL,
			imgTransform,
			imgWidth,
			newRandomImage,
			nextBlendMode,
			nextImageSizeMode,
			recurse,
			scrollWheelZoom,
			setCurrentImageAsBlend,
			startDrag,
			takeScreenshot,
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
	z-index: 9999;
}

button {
	background-color: #111111;
	color: gray;
	height: 26px;
	width: 100%;
	border-radius: 20px;
	border: 1px solid #1c1c1c;
	outline: none;
	margin: 0 auto;
	margin-bottom: 10px;
	font-size: 0.8em;
	cursor:pointer;
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

.blends-container {
	display: flex;
	margin-bottom: 20px;
	border:1px solid #504646;
}

.blend-container {
	display: flex;
	flex-direction: column;
	width:100px;
	height:150px;
	overflow: hidden;
}

.blend-image-preview {
	width: 100px;
	height: 100px;
	background-size: contain;
	background-repeat: no-repeat;
	position: relative;
	text-align: left;
	font-size: 0.8em;
	color: #504646;
}

.blend-button {
	border-radius: 0;
	margin:0;
	width:100%;
	height:25px;
	font-size:0.8em;
}

.clear-blend {
	width: 15px;
	height: 20px;
	position: absolute;
	right: 0;
	top: 0;
	cursor: pointer;
	text-align: center;
	font-size: 1em;
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
	overflow: unset;
	padding:10px;
}

.blend-image {
	width: 50%;
	height: 50%;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	position: absolute;
	overflow: hidden;
	pointer-events: none;
	background-position: -50% -50%;
}

#under-layer {
	filter: blur(5px);
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

a, a:hover, a:focus, a:active {
	text-decoration: none;
	color: inherit;
}

.caleido-title {
	font-family: Biysk;
	width:100%;
	height:40px;
	font-size: 3em;
	margin-bottom: 20px;
	cursor: pointer;
	text-decoration: none;
}

.topbar {
	display: flex;
	flex-direction: row;
	height:40px;
	width: 100%;
	justify-content: space-evenly;
	position: relative;
	margin-bottom:30px;
}

.topbar-button {
	margin: 0;
	border-radius: 0;
	display:flex;
	background-color: transparent;
	border:none;
	width:40px;
	height:40px;
	background-size: contain;
	background-repeat: no-repeat;
	cursor: pointer;
}

.topbar-button:hover {
	background-color: transparent;
	filter: brightness(2);
}

.topbar-button:active {
	background-color: transparent;
	filter: brightness(2);
	transform:  scale(0.95);
}

.topbar-tooltip {
	position:absolute;
	left:50%;
	bottom:0;
	transform: translate(-50%, 100%);
	width:100px;
	font-family: Biysk;
	line-height: 30px;
}

.new-image-button {
	background-image: url("../images/icons/newimage.svg");
	transition: transform 1s ease;
}

.download-button {
	background-image: url("../images/icons/download.svg");
}



@media all and (min-width: 767px) and (max-width: 1024px) {

	.dummy-container {
		display: none;
	}

	.menuWindow {

		width: 50%;
		position: absolute;
		right: 0;
		bottom: 0;
		left: unset;

	}

	.blend-image-preview {
		display: none;
	}

	.editor-container {
		height: 100vh;
		width: 100%;
	}

	.canvasWindow {
		transform: scale(0.6) translate(-15%, -30%);

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
		display: none;
	}

	.menuWindow {

		width: 40%;
		position: absolute;
		right: 0;
		bottom: 0;
		left: unset;

	}

	.blend-image-preview {
		display: none;
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
