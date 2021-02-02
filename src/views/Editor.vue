<template>
  <Filters></Filters>
  <transition name="fade">
    <div class="settingsWindow" ref="settingsDiv" v-if="!isDragging" @wheel.prevent="scrollWheelScale($event)">
      <Slider label="Sectors"     :min="3"    :max="60"  v-model.number="NValue"        ></Slider>
      <Slider label="Rotate"      :min="0"    :max="360"  v-model.number="rotateValue"  :step="0.1" ></Slider>
      <Slider label="Opacity"     :min="0"    :max="1"    v-model.number="opacity"      :step="0.01" ></Slider>
    </div>
  </transition>

  <div class="canvasWindow" @wheel.prevent="scrollWheelScale($event)" :style="{'filter': filterBlurEdges()}" ref="capture">
    <div class="circleWrapper"
         :style="{
            'overflow': isCircular ? 'hidden': 'initial',
            'width'   : sliceHeight*2*scale+'px',
            'height'  : sliceHeight*2*scale+'px'
    }">
      <div
          v-for="n in NValue"
          :key="n" class="imageContainer"
          @mousedown="startDrag($event)"
          @touchstart="startDrag($event)"
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
      <router-link to="/"><button>Main Menu</button></router-link>
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
      <button @click="takeScreenshot">Download Mandala (PNG)</button>
    </div>
  </transition>
  <div class="graph-wrapper">
    <div id="jsxgraph" class="jxgbox"></div>
  </div>

</template>

<script>

import JXG from 'jsxgraph'
import Filters from '../components/Filters'
import Slider from '../components/Slider'
import Checkbox from '../components/Checkbox'
import Select from '../components/Select'
import {ref, computed, watch, onMounted } from 'vue'
import { toPng, toBlob } from 'dom-to-image'


export default {
  name: 'Editor',
  components: {
    Slider,
    Checkbox,
    Select,
    Filters,
  },
  props:{
    userImage:String
  },
  setup(props){
    let xText, yText;
    let showWelcome     = ref(true);
    let capture         = ref(null);
    let selectedFileURL = ref(props.userImage);
    let imageURL        = computed( () => {
      if(selectedFileURL.value){
        return selectedFileURL.value
      } else {
        return require("../images/Karina.jpg")
      }

    } );
    let NValue          = ref(6);
    let rotateValue     = ref(60);
    let sliceWidth      = ref(462.9);
    let sliceHeight     = ref(400);
    let circumRadius    = computed(() => { return Math.sqrt(Math.pow(sliceWidth.value/2, 2) + Math.pow(sliceHeight.value, 2))});
    let sideLength      = computed(() => { return 2*sliceHeight.value*Math.tan(Math.PI/NValue.value)});
    let sliceAngle      = ref(100);
    let imgX            = ref(70);
    let imgY            = ref(183);
    let zoom            = ref(223);
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
    let xOffset    = ref(-imgX.value);
    let yOffset    = ref(-imgY.value);
    let currentX   = ref(0);
    let currentY   = ref(0);
    let isDragging = ref(false);

    let xName = ref('x');
    let yName = ref('y');

    function startButton() { showWelcome.value = false; }
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
      toPng(capture.value)
          .then(function (dataUrl) {
            saveAs(dataUrl, 'mandala.png')
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

        if(e.touches) {
          initialX.value = e.touches[0].clientX - xOffset.value;
          initialY.value = e.touches[0].clientY - yOffset.value;
        }else{
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
        if(e.touches){
          currentX.value = e.touches[0].clientX - initialX.value;
          currentY.value = e.touches[0].clientY - initialY.value;
        }else{
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
          boundingbox:[-1,10,10,-1],
          axis:true,
          grid:true,
          showCopyright:false,
          showNavigation:false
        });
        xText = board.create('text',[9,0.5,function(){return xName.value}],{color:'white',anchorX:'right'});
        yText = board.create('text',[0.5,9,function(){return yName.value}],{color:'white'});

        let p1 = board.create('point',[1,1],{name:'BC',label:{color:'white'},snapToGrid:false, size:7, fillColor:'yellow', strokeWidth:0, showInfobox:false});
        p1.on('drag', function(){
          brightness.value = p1.X()*50;
          contrast.value = p1.Y()*50;
        });
        p1.on('over', function(){xText.setText('Brightness'); yText.setText('Contrast');})
        p1.on('out', function(){xText.setText('x'); yText.setText('y');})


        let p2 = board.create('point',[4.63,4],{name:'WH',label:{color:'white'},snapToGrid:false, size:7, fillColor:'red', strokeWidth:0, showInfobox:false});
        p2.on('drag', function(){
          sliceWidth.value = p2.X()*100;
          sliceHeight.value = p2.Y()*100;
        });
        p2.on('over', function(){xText.setText('Width'); yText.setText('Height');})
        p2.on('out', function(){xText.setText('x'); yText.setText('y');})

        let p3 = board.create('point',[2.23,1],{name:'ZS',label:{color:'white'},snapToGrid:false, size:7, fillColor:'red', strokeWidth:0, showInfobox:false});
        p3.on('drag', function(){
          zoom.value = p3.X()*100;
          scale.value = p3.Y();
        });
        p3.on('over', function(){xText.setText('Zoom'); yText.setText('Scale');})
        p3.on('out', function(){xText.setText('x'); yText.setText('y');})

    });


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
      startButton,
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

html{
  overflow:hidden;
}

body {
  position:relative;
  margin:0;
  padding:0;
  height: 100%;
  overflow: hidden;
  background-color: black;
}

#jsxgraph{
  height:100%;
  width:100%;
  z-index:99999;
}

.graph-wrapper {
  width:300px;
  height:300px;
  display: block;
  position:absolute;
  border:1px solid white;
  bottom:0;
  left:0;
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

.imageContainer {
  background-image:url(../images/Trumpet.jpg);
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

@media all and (max-width: 799px) {
  .menuWindow {
    display: none;
  }
  .settingsWindow {
    display: none;
  }
}

</style>
