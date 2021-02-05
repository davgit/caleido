<template>
  <Filters></Filters>
  <div class="editor-container">

    <div class="canvasWindow" @wheel.prevent="scrollWheelScale($event)" :style="{'filter': filterBlurEdges()}" ref="capture">
      <div class="circleWrapper"
           :style="{
              'overflow': isCircular ? 'hidden': 'initial',
              'width'   : sliceHeight*2*scale+'px',
              'height'  : sliceHeight*2*scale+'px'
      }">
        <div
            v-for="n in sectors"
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
        <button @click="nextBlendMode" label="Blend Mode">Blend Mode  {{blendModes.indexOf(blendMode)}}: {{blendMode}}</button>
        <Checkbox label="Circular" v-model="isCircular"></Checkbox>
        <Checkbox label="Invert" v-model="isInverted"></Checkbox>
        <Checkbox label="Animate" v-model="isPlay"></Checkbox>
        <Checkbox label="Edge Detect" v-model="isEdgeDetect"></Checkbox>
        <Checkbox label="Turbulence" v-model="isTurbulence"></Checkbox>
        <button @click="recurse" >Recurse</button>
        <button @click="takeScreenshot">Download</button>
      </div>
    </transition>
    <div class="graph-wrapper" v-show="!isDragging">
      <div id="jsxgraph" class="jxgbox"></div>
    </div>
  </div>
</template>

<script>

import JXG from 'jsxgraph'
import Filters from '../components/Filters'
//import Slider from '../components/Slider'
import Checkbox from '../components/Checkbox'
//import Select from '../components/Select'
import {ref, computed, watch, onMounted } from 'vue'
import { toPng, toBlob } from 'dom-to-image'


export default {
  name: 'Editor',
  components: {
    //Slider,
    Checkbox,
    //Select,
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
    let sectors          = ref(6);
    let rotateValue     = ref(60);
    let sliceWidth      = ref(462.9);
    let sliceHeight     = ref(400);
    let circumRadius    = computed(() => { return Math.sqrt(Math.pow(sliceWidth.value/2, 2) + Math.pow(sliceHeight.value, 2))});
    let sideLength      = computed(() => { return 2*sliceHeight.value*Math.tan(Math.PI/sectors.value)});
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
    let blurEdges       = ref(0);
    let brightness      = ref(100);
    let contrast        = ref(100);
    let grayscale       = ref(0);
    let hueRotate       = ref(0);
    let saturate        = ref(100);
    let sepia           = ref(0);

    let isPlay          = ref(false);
    let isEdgeDetect          = ref(false);
    let isTurbulence          = ref(false);
    let isInverted            = ref(false);
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

    let xName = ref('');
    let yName = ref('');

    function startButton() { showWelcome.value = false; }
    function imgImageURL() { return "url('"+imageURL.value+"')" }
    function imgTransform(n) { return 'translate(-50%, 0%) rotate('+(n*rotateValue.value)+'deg) scale('+scale.value+')' }
    function imgClipPath() { return 'polygon(50% 0%,'+(50-sliceAngle.value/2)+'% 100%, '+(50+sliceAngle.value/2)+'% 100%)' }
    function imgBackgroundPosition(imgX, imgY) { return imgX+'% '+imgY+'%' }
    function imgWidth() { return sliceWidth.value+'px' }
    function imgHeight() { return sliceHeight.value+'px' }
    function imageSize() { return zoom.value+'% '+zoom.value+'%' }
    function alignRotation() { rotateValue.value = 360/sectors.value; }
    function distributeEven() { alignRotation(); sliceWidth.value = sideLength.value; }
    function hideCursor() { document.body.style.cursor = "none"}
    function showCursor() { document.body.style.cursor = "default"}
    function applyFilters() {return filterBrightness()+filterHue()+filterContrast()+filterGrayscale()+filterInvert()+filterSaturate()+filterSepia()+filterEdgeDetect()+filterTurbulence()}
    function filterBlurEdges() { return 'blur('+blurEdges.value+'px) ' }
    function filterBrightness() { return 'brightness('+brightness.value+'%) ' }
    function filterContrast() { return 'contrast('+contrast.value+'%) ' }
    function filterGrayscale() { return 'grayscale('+grayscale.value+'%) ' }
    function filterHue() {return 'hue-rotate('+hueRotate.value+'deg) '}
    function filterInvert() {return 'invert('+(isInverted.value*100)+'%) '}
    function filterSaturate() {return 'saturate('+saturate.value+'%) '}
    function filterSepia() {return 'sepia('+sepia.value+'%) '}
    function filterEdgeDetect() { if(isEdgeDetect.value) { return 'url(#EdgeDetect) ' } else { return '' } }
    function filterTurbulence() { if(isTurbulence.value) { return 'url(#Turbulence) ' } else { return '' } }
    function nextBlendMode() { blendMode.value = blendModes[blendModes.indexOf(blendMode.value)+1]; }

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

    watch([sectors, isAutoAlign], () => {
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
          boundingbox:[-0.5,10.5,10.5,-0.5],
          axis:true,
          grid:false,
          showCopyright:false,
          showNavigation:false,
          pan:{enabled:false, needTwoFingers:true},
          zoom:{enabled:false},
          defaultAxes:{
            x:{ticks:{label:{visible:false}}},
            y:{ticks:{label:{visible:false}}}
          }
        });
        xText = board.create('text',[9,0.5,function(){return xName.value}],{color:'white',anchorX:'right'});
        yText = board.create('text',[0.5,9,function(){return yName.value}],{color:'white'});

        let hwGraph = board.create('functiongraph',[function(x){return x*sectors.value*0.143}],{strokeColor:'yellow', opacity:0.2, highlight:false,visible:false});
        let graphPoint = function(x,y,name,color,xName,yName,xRef,yRef,xFactor,yFactor, options){
          options = options || {};
          let fullOptions = {
            name:name,
            label:{color:'black', highlight:false, offset:[0,0], anchorX:'middle', anchorY:'middle',fontSize:9},
            highlightFillcolor:false,
            highlightStrokeWidth:2,
            highlightStrokeColor:color,
            snapToGrid:false,
            size:9,
            fillColor:color,
            strokeWidth:0,
            strokeColor:color,
            showInfobox:false,
            ...options}
          let point = board.create('point',[x,y],fullOptions);
          point.on('over', function(){ xText.setAttribute({color:color}); yText.setAttribute({color:color}); xText.setText(xName); yText.setText(yName);})
          point.on('out', function(){xText.setText(''); yText.setText('');})
          point.coords.on('update', function(){
            xRef.value = point.X()*xFactor;
            yRef.value = point.Y()*yFactor;
          });
          return point;
        };


      /*graphPoint(5,5, 'XY', 'red', 'X', 'Y', imgX, imgY, zoom.value/10, zoom.value/10);*/
      graphPoint(1,1, 'CB', 'red', 'Brightness', 'Contrast', brightness, contrast, 50, 50);
      let hw = graphPoint(4.63,4, 'HW', 'yellow', 'Width', 'Height', sliceWidth, sliceHeight, 100, 100,{face:'[]', attractors:[hwGraph], attractorDistance:0.3});
      graphPoint(2.23,1, 'SZ', 'blue', 'Zoom', 'Scale', zoom, scale, 100, 1,{face:'[]'});
      graphPoint(0,2, 'SH', 'magenta', 'Hue', 'Saturation', hueRotate, saturate, 36, 50);
      graphPoint(1,0, 'SG', 'gray', 'Grayscale', 'Sepia', grayscale, sepia, 10, 10);
      graphPoint(10,0, 'OB', 'darkgray', 'Opacity', 'BlurEdges', opacity, blurEdges, 0.1, 10,{snapToGrid:true, snapSizeX:0.5, snapSizeY:0.5});

      hw.on('over',function(){hwGraph.setAttribute({visible:true})});
      hw.on('out',function(){hwGraph.setAttribute({visible:false})});

      let sectorSlider = board.create('slider',[[1,10],[9,10],[3,6,60]],{name:'', snapWidth:1,precision:0, label:{color:'white'},baseline:{strokeColor:'gray'}});
      sectorSlider.on('drag',function(){
        sectors.value = this.Value();
      });
      sectorSlider.on('over', function(){ xText.setText('Sectors'); yText.setText('(Height)'); yText.setAttribute({color:'yellow'})})
      sectorSlider.on('out', function(){ xText.setText(''); yText.setText(''); yText.setAttribute({color:'yellow'})})



    });


    return{
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
      isPlay,
      isEdgeDetect,
      isTurbulence,
      isInverted,
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
      recurse,
      nextBlendMode

    }
  }
}
</script>

<style>

.editor-container {
  width:100%;
  height:100%;
  display: flex;
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
  bottom:35%;
  left:20px;
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
  justify-content: flex-start;
  flex-direction: row;
  margin-top:10px;
}

.align-button {
  margin-top:7px;
  margin-right:10px;
  width:100px;
}

@media all and (max-width: 799px) {
  .menuWindow {
    //display: none;
    padding-top:0;
    justify-content: flex-end;
    width:30%;
    transform:scale(0.7);
    transform-origin:bottom right;
  }
  .settingsWindow {
    width:3%;
    justify-content: flex-end;
    display:none;
  }

  .editor-container {
    height:100vh;
    width:100%;
  }

  .canvasWindow{
    height:55vh;
  }

  .graph-wrapper {
    width:250px;
    height:250px;
    display: block;
    position:absolute;
    bottom:10px;
    left:10px;
  }

}

</style>
