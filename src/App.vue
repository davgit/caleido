<template>
  <transition name="fade">
  <div class="welcome-window" v-if="showWelcome">
    <div class="welcome-content">
      <h1>Mandala Generator</h1>
      <span class="instructions" @mouseover="highlightUploadImage = true" @mouseout="highlightUploadImage = false">1. Upload an image(JPG, PNG, GIF), or use default image.</span><br><br>
      <span class="instructions" @mouseover="highlightSettings = true" @mouseout="highlightSettings = false">2. Play around with the various settings available. Click & drag inside mandala to adjust position. </span><br><br>
      <span class="instructions" @mouseover="highlightDownload = true" @mouseout="highlightDownload = false">3. Download Mandala.</span><br><br>
      <button class="start-button" @click="startButton">Start</button>
    </div>
  </div>
  </transition>
  <Filters></Filters>
  <transition name="fade">
    <div class="settingsWindow" ref="settingsDiv" v-if="!isDragging" @wheel.prevent="scrollWheelScale($event)" :class="{'highlighted':highlightSettings}">
      <Slider label="Sectors"     :min="3"    :max="120"  v-model.number="NValue"        ></Slider>
      <Slider label="Slice Width" :min="0.1"  :max="1000" v-model.number="sliceWidth"   :step="0.1" ></Slider>
      <Slider label="Slice Height" :min="0.1" :max="1000" v-model.number="sliceHeight"  :step="0.1" ></Slider>
      <Slider label="Scale"       :min="0.01" :max="10"   v-model.number="scale"        :step="0.1" ></Slider>
      <Slider label="SliceAngle"  :min="0"    :max="100"  v-model.number="sliceAngle"   :step="0.1" ></Slider>
      <Slider label="Rotate"      :min="0"    :max="360"  v-model.number="rotateValue"  :step="0.1" ></Slider>
      <Slider label="Zoom"        :min="1"    :max="1000" v-model.number="zoom"         :step="0.1" ></Slider>
      <Slider label="Opacity"     :min="0"    :max="1"    v-model.number="opacity"      :step="0.01" ></Slider>
      <Slider label="Blur Image"  :min="0"    :max="100"  v-model.number="blur"         :step="1" ></Slider>
      <Slider label="Blur"        :min="0"    :max="100"  v-model.number="blurEdges"    :step="1" ></Slider>
      <Slider label="Brightness"  :min="0"    :max="500"  v-model.number="brightness"   :step="1" ></Slider>
      <Slider label="Contrast"    :min="0"    :max="500"  v-model.number="contrast"     :step="1" ></Slider>
      <Slider label="Grayscale"   :min="0"    :max="100"  v-model.number="grayscale"    :step="1" ></Slider>
      <Slider label="Hue"         :min="0"    :max="360"  v-model.number="hueRotate"    :step="1" ></Slider>
      <Slider label="Invert"      :min="0"    :max="100"  v-model.number="invert"       :step="1" ></Slider>
      <Slider label="Saturate"    :min="0"    :max="500"  v-model.number="saturate"     :step="1" ></Slider>
      <Slider label="Sepia"       :min="0"    :max="100"  v-model.number="sepia"        :step="1" ></Slider>

    </div>
  </transition>

  <div class="canvasWindow" @wheel.prevent="scrollWheelScale($event)" :style="{'filter': filterBlurEdges()}" ref="capture">
    <div class="circleWrapper"
         :class="{'highlighted':highlightSettings}"
         :style="{
            'overflow': isCircular ? 'hidden': 'initial',
            'width'   : sliceHeight*2*scale+'px',
            'height'  : sliceHeight*2*scale+'px'
    }">
      <div
          v-for="n in NValue"
          :key="n" class="imageContainer"
          @mousedown="startDrag($event)"
          @wheel.prevent="scrollWheelZoom($event)"
          :style="{
              'background-image'   : imgImageURL(),
              'width'              : imgWidth(),
              'height'             : imgHeight(),
              'transform'          : imgTransform(n),
              'clip-path'          : imgClipPath(),
              'background-position': imgBackgroundPosition(imgX/(zoom/100), imgY/(zoom/100)),
              'background-size'    : imageSize(),
              'mix-blend-mode'     : blendMode,
              'opacity'            : opacity,
              'filter'             : applyFilters()
            }">
      </div>
    </div>
  </div>

  <transition name="fade">
    <div class="menuWindow" v-if="!isDragging" @wheel.prevent="scrollWheelScale($event)">
      <input style="display: none" type="file" @change="onFileSelected" ref="fileInput" accept="image/x-png,image/gif,image/jpeg">
      <button @click="$refs.fileInput.click()" :class="{'highlighted':highlightUploadImage}">Upload Image</button>
      <Select label="Defaults" :options="imageNames" v-model="selectedImage" @change="onSelectImage"></Select>
      <Select label="Blend Mode" :options="blendModes" v-model="blendMode"></Select>
      <Checkbox label="Circular" v-model="isCircular"></Checkbox>
      <div class="auto-align-container">
        <button class="align-button" @click="distributeEven">Align</button>
        <Checkbox label="Auto Align" v-model="isAutoAlign"></Checkbox>
      </div>
      <Checkbox label="Animate" v-model="isPlay"></Checkbox>
      <Checkbox label="Edge Detect" v-model="isEdgeDetect"></Checkbox>
      <Checkbox label="Turbulence" v-model="isTurbulence"></Checkbox>
      <button @click="recurse" >Recurse</button>
      <button @click="takeScreenshot" :class="{'highlighted':highlightDownload}">Download Mandala (PNG)</button>
    </div>
  </transition>
  <img width="75%" ref="screen">
</template>

<script>

import Filters from './components/Filters'
import Slider from './components/Slider'
import Checkbox from './components/Checkbox'
import Select from './components/Select'
import {ref, computed, watch } from 'vue'
import domtoimage from 'dom-to-image'


export default {
  name: 'App',
  components: {
    Slider,
    Checkbox,
    Select,
    Filters
  },
  setup(){
    let imageNames    = ["Karina", "Amethyst", "Cuckoo", "Herbie", "Hilmar", "Teapot", "Trumpet", "Flamingo", "Calavera"].sort();
    let selectedImage = ref("Cuckoo");
    let images = {
      Karina       : require("./images/Karina.jpg"),
      Amethyst     : require("./images/Amethyst.jpg"),
      Cuckoo       : require("./images/Cuckoo.jpg"),
      Herbie       : require("./images/Herbie.jpg"),
      Hilmar       : require("./images/Hilmar.png"),
      Teapot       : require("./images/Teapot.jpg"),
      Trumpet       : require("./images/Trumpet.jpg"),
      Flamingo       : require("./images/Flamingo.jpg"),
      Calavera       : require("./images/Calavera.jpg"),
    };

    let showWelcome     = ref(true);
    let highlightUploadImage = ref(false);
    let highlightDownload = ref(false);
    let highlightSettings = ref(false);
    let capture         = ref(null);
    let selectedFileURL = ref(images.Cuckoo);
    let imageURL        = computed( () => { if(selectedFileURL.value){ return selectedFileURL.value } } );
    let NValue          = ref(6);
    let rotateValue     = ref(60);
    let sliceWidth      = ref(462.9);
    let sliceHeight     = ref(400);
    let circumRadius    = computed(() => { return Math.sqrt(Math.pow(sliceWidth.value/2, 2) + Math.pow(sliceHeight.value, 2))});
    let sideLength      = computed(() => { return 2*sliceHeight.value*Math.tan(Math.PI/NValue.value)});
    let sliceAngle      = ref(100);
    let imgX            = ref(1);
    let imgY            = ref(1);
    let zoom            = ref(200);
    let opacity         = ref(1);
    let scale           = ref(1);
    let sync            = ref(true);
    let blendMode       = ref("normal");
    let isCircular      = ref(true);
    let isAutoAlign     = ref(true);
    let blur            = ref(0);
    let blurEdges       = ref(0);
    let brightness      = ref(100);
    let contrast        = ref(100);
    let grayscale       = ref(0);
    let hueRotate       = ref(0);
    let invert          = ref(0);
    let saturate        = ref(100);
    let sepia           = ref(0);

    let isPlay          = ref(false);
    let isEdgeDetect          = ref(false);
    let isTurbulence          = ref(false);
    let blendModes      = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'saturation', 'color', 'luminosity'];
    let actionKeys = {
      Control:{pressed:false}
    };

    let initialX   = ref(0);
    let initialY   = ref(0);
    let xOffset    = ref(0);
    let yOffset    = ref(0);
    let currentX   = ref(0);
    let currentY   = ref(0);
    let isDragging = ref(false);

    function startButton() { showWelcome.value = false; }
    function onFileSelected(e) { selectedFileURL.value = URL.createObjectURL(e.target.files[0]); }
    function onSelectImage(e)  { selectedFileURL.value = images[e.target.value]; }
    function imgImageURL() { return "url('"+imageURL.value+"')" }
    function imgTransform(n) { return 'translate(-50%, 0%) rotate('+(n*rotateValue.value)+'deg) scale('+scale.value+')' }
    function imgClipPath() { return 'polygon(50% 0%,'+(50-sliceAngle.value/2)+'% 100%, '+(50+sliceAngle.value/2)+'% 100%)' }
    function imgBackgroundPosition(imgX, imgY) { return imgX+'% '+imgY+'%' }
    function imgWidth() { return sliceWidth.value+'px' }
    function imgHeight() { return sliceHeight.value+'px' }
    function imageSize() { return zoom.value+'% '+zoom.value+'%' }
    function alignRotation() { rotateValue.value = 360/NValue.value; }
    function distributeEven() { alignRotation(); sliceWidth.value = sideLength.value; }
    function hideCursor() { document.body.style.cursor = "none"}
    function showCursor() { document.body.style.cursor = "default"}
    function applyFilters() {return filterBlur()+filterBrightness()+filterHue()+filterContrast()+filterGrayscale()+filterInvert()+filterSaturate()+filterSepia()+filterEdgeDetect()+filterTurbulence()}
    function filterBlur() { return 'blur('+blur.value+'px) ' }
    function filterBlurEdges() { return 'blur('+blurEdges.value+'px) ' }
    function filterBrightness() { return 'brightness('+brightness.value+'%) ' }
    function filterContrast() { return 'contrast('+contrast.value+'%) ' }
    function filterGrayscale() { return 'grayscale('+grayscale.value+'%) ' }
    function filterHue() {return 'hue-rotate('+hueRotate.value+'deg) '}
    function filterInvert() {return 'invert('+invert.value+'%) '}
    function filterSaturate() {return 'saturate('+saturate.value+'%) '}
    function filterSepia() {return 'sepia('+sepia.value+'%) '}
    function filterEdgeDetect() { if(isEdgeDetect.value) { return 'url(#EdgeDetect) ' } else { return '' } }
    function filterTurbulence() { if(isTurbulence.value) { return 'url(#Turbulence) ' } else { return '' } }

    function saveAs(url, filename) {
      let link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function takeScreenshot() {
      domtoimage.toPng(capture.value)
          .then(function (dataUrl) {
            saveAs(dataUrl, 'mandala.png')
          })
          .catch(function (error) {
            console.error('oops, something went wrong!', error);
          });
    }

    function recurse() {
      domtoimage.toBlob(capture.value)
          .then(function (blob) {
            var image = new Image();
            image.src = URL.createObjectURL(blob);
            selectedFileURL.value = image.src;
          })
          .catch(function (error) {
            console.error('oops, something went wrong!', error);
          });
    }

    let animate;
    let frame = 1;
    animate = function() {
      imgY.value += Math.sin(frame/250);
      //imgX.value += Math.cos(frame/250);
      if(isPlay.value){
        requestAnimationFrame(animate);
      }
      frame+= 10;
    }

    watch([NValue, isAutoAlign], () => {
      if(isAutoAlign.value) { distributeEven() }
    });

    watch([isPlay], () => {
      if(isPlay.value) { animate() }
    });





    window.addEventListener('keydown',function(e){
      if(actionKeys[e.key]){
        actionKeys[e.key].pressed = true;
      }
    });

    window.addEventListener('keyup',function(e){
      if(actionKeys[e.key]){
        actionKeys[e.key].pressed = false;
      }
    });

    function scrollWheelZoom(e){
      if(actionKeys["Control"].pressed){
        zoom.value += e.deltaY * -0.1;
      }else{
        zoom.value += e.deltaY * -0.01;
      }

      zoom.value = Math.min(Math.max(10, zoom.value), 1000);
    }

    function scrollWheelScale(e){
      if(e.target.className === "imageContainer"){ return; }
      if(actionKeys["Control"].pressed){
        scale.value += e.deltaY * -0.001;
      }else{
        scale.value += e.deltaY * -0.0001;
      }
      scale.value = Math.min(Math.max(0.01, scale.value), 10);
    }

    function startDrag(e) {

      if(e){
        initialX.value = e.clientX - xOffset.value;
        initialY.value = e.clientY - yOffset.value;
        isDragging.value = true;
        hideCursor();

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", endDrag);
      }
    }

    function endDrag() {
        initialX.value = currentX.value;
        initialY.value = currentY.value;

        isDragging.value = false;
        showCursor();
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", endDrag);
    }

    function drag(e) {
      if (isDragging.value) {

        e.preventDefault();
        currentX.value = e.clientX - initialX.value;
        currentY.value = e.clientY - initialY.value;

        xOffset.value = currentX.value;
        yOffset.value = currentY.value;

        imgX.value = -currentX.value;
        imgY.value = -currentY.value;

      }
    }


    return{
      NValue,
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
      images,
      imageNames,
      selectedImage,
      blendMode,
      blendModes,
      circumRadius,
      sideLength,
      isCircular,
      isAutoAlign,
      isDragging,
      blur,
      blurEdges,
      brightness,
      contrast,
      grayscale,
      hueRotate,
      invert,
      saturate,
      sepia,
      isPlay,
      isEdgeDetect,
      isTurbulence,
      capture,
      showWelcome,
      highlightUploadImage,
      highlightDownload,
      highlightSettings,
      startButton,
      onFileSelected,
      onSelectImage,
      alignRotation,
      distributeEven,
      imgImageURL,
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
      filterBlurEdges,
      takeScreenshot,
      recurse

    }
  }
}
</script>

<style>
span {
  user-select: none;
}
body {
  margin:0;
  padding:0;
  height: 100%;
  overflow: hidden;
  background-color: black;
}
button {
  background-color:#111111;
  color:gray;
  height:30px;
  width:100%;
  border-radius: 20px;
  border:1px solid #1c1c1c;
  outline:none;
  margin:0 auto;
  margin-bottom:10px;
}
button:hover {
  background-color: #262626;
}
button:active {
  background-color: #005CC8;
}

select {
  background-color:transparent;
  color:gray;
  outline:none;
  border:none;
  width:150px;
  margin:0 auto;
  font-size:1em;
  margin-bottom:20px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display:flex;
  flex-direction: row;
}

.welcome-window {
  width:80vh;
  height:80vh;
  position:absolute;
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
  border:1px solid white;
  z-index:99999;
  border-radius:100%;
  background-color:rgba(255, 255, 255, 0.8);
}

.welcome-content {
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
  position:absolute;
  width:60%;
}

.instructions {
  font-size:1.2em;
}

.instructions:hover {
  text-decoration: underline #6262db;
}

.start-button {
  width:100px;
  height:40px;
  font-size: 1em;
  color:white;
  background-color: #005CC8;
}

.start-button:hover {
  width:100px;
  color:white;
  background-color: #5594e2;
}

.start-button:active {
  width:95px;
  height:40px;
  color:white;
  background-color: #5594e2;
}


.imageContainer {
  background-image:url(images/Cuckoo.jpg);
  width:400px;
  height:400px;
  position:absolute;
  top:50%;
  left:50%;
  transform-origin: 50% 0%;

}

.circleWrapper {
  top:50%;
  left:50%;
  transform: translate(-50%, -50%);
  position:absolute;
  overflow:hidden;
  border-radius: 100%;
}

.settingsWindow {
  width:10%;
  height:100vh;
  display:flex;
  flex-direction: column;
  padding: 20px 20px;
  z-index:999;
  background-color: transparent;
  transition-duration: 0.5s;
  transition: opacity;
  position:absolute;
  left:0;
}

.canvasWindow {
  width:100%;
  height:100vh;
  display:flex;
  flex-direction: column;
  padding: 0 20px;
  overflow:hidden;
}

.menuWindow {
  width:13%;
  height:100vh;
  display:flex;
  flex-direction: column;
  padding: 0 20px;
  z-index:999;
  background-color: transparent;
  padding-top: 20px;
  position:absolute;
  right:0;

}

.auto-align-container {
  display:flex;
  flex-direction: row;
}

.align-button {
  margin-top:7px;
  margin-right:50px;
  width:100px;
}

.highlighted {
  outline: 2px dashed #6262db;

}



.fade-enter,
.fade-leave-to {
  visibility: hidden;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s;
}

</style>
