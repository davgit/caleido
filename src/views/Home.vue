<template>
  <div class="container">
    <div class="bg-image"></div>
        <div class="caleido-title-container" :style="{'opacity': titleOpacity}">
          <span class="caleido-title">caleido</span>
        </div>

        <div class="caleido-title-container-reflect" :style="{'opacity': titleReflectOpacity}">
          <span class="caleido-title">caleido</span>
        </div>
    <div class="drop-zone" @drop="onDrop" @dragover="isDragOver = true" @dragleave="isDragOver = false" @click="$refs.fileInput.click()">
      <input style="display: none" type="file" @change="onChange" ref="fileInput" accept="image/x-png,image/gif,image/jpeg,image/webp">
      <div class="drop-text-div" :style="{'opacity': titleOpacity}">
        <span class="drop-text" :class="{'highlight': isDragOver}"> Drop Image Here</span>
      </div>

    </div>

    <div class="bottom-section" :style="{'bottom': bottomPosition+'%' }">
      <div class="bottom-left">

          <div class="description-container">
            <h1>Looking through a kaleidoscope</h1>
            <span class="description">There is something pleasing about repetition. Any dull image could generate extraordinary patterns when seen through a kaleidoscope.<br><br> Thanks to <a href="https://unsplash.com/"  target="_blank" rel="noreferrer noopener">Unsplash</a> for random images.</span>
          </div>
      </div>

      <div class="bottom-middle">
        <span class="try-text">or try with demo image</span>
        <div class="images-row">
          <DemoImage :url="randomImage1" @click="start(randomImage1)" alt="Random1"></DemoImage>
          <DemoImage :url="randomImage2" @click="start(randomImage2)" alt="Random2"></DemoImage>
          <DemoImage :url="randomImage3" @click="start(randomImage3)" alt="Random3"></DemoImage>
        </div>
        <div class="images-row">
          <DemoImage :url="randomImage4" @click="start(randomImage4)" alt="Random4"></DemoImage>
          <DemoImage :url="randomImage5" @click="start(randomImage5)" alt="Random5"></DemoImage>
          <DemoImage :url="randomImage6" @click="start(randomImage6)" alt="Random6"></DemoImage>
        </div>
        <div class="random-row">
          <button class="random-button" @click="getRandomImage">Random Image</button>
        </div>

        <div class="quality-buttons-container">
          <button class="quality-button" :class="{'selected-quality':quality === 'low' }" @click="setQuality('low');getRandomImage()">Low</button>
          <button class="quality-button" :class="{'selected-quality':quality === 'medium' }" @click="setQuality('medium');getRandomImage()">Medium</button>
          <button class="quality-button" :class="{'selected-quality':quality === 'high' }" @click="setQuality('high');getRandomImage()">High</button>
        </div>




      </div>
      <div class="bottom-right">
        <div class="description-container-right">
          <h2>Upload, Remix, Download</h2>
          <span class="description">Supported file format: JPG, PNG, WEBP, GIF</span><br><br>
          <span class="description">• mouse click/drag: pan</span><br>
          <span class="description">• mouse wheel: zoom</span><br>
          <span class="description">• CTRL+mouse wheel: zoom x 10</span><br><br>
          <span class="description">The final image can be downloaded as a .PNG (with alpha). </span><br><br>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DemoImage from "@/components/DemoImage";
import {ref, onMounted} from 'vue'
import { useRouter } from 'vue-router'
//import {toBlob} from "dom-to-image";

export default {
  name: 'Home',
  components: {
    DemoImage
  },
  setup(){
    const router = useRouter();
    let rawImage        = ref(null);
    let quality = ref('medium');

    let randomInteger = function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    let selectedRandomImage = ref('https://source.unsplash.com/random/600x600');
    let randomImage1         = ref('');
    let randomImage2         = ref('');
    let randomImage3         = ref('');
    let randomImage4         = ref('');
    let randomImage5         = ref('');
    let randomImage6         = ref('');
    let resolution = ref(600);


    let getRandomImage = function(){
      var image1, image2, image3, image4, image5, image6;
      fetch('https://source.unsplash.com/random/'+resolution.value+''+randomInteger(10,99)+'x'+resolution.value+''+randomInteger(10,99))
          .then(response => response.blob())
          .then(image => {
            image1 = URL.createObjectURL(image);
            randomImage1.value = image1;
          });

      fetch('https://source.unsplash.com/random/'+resolution.value+''+randomInteger(10,99)+'x'+resolution.value+''+randomInteger(10,99))
          .then(response => response.blob())
          .then(image => {
            image2 = URL.createObjectURL(image);
            randomImage2.value = image2;
          });

      fetch('https://source.unsplash.com/random/'+resolution.value+''+randomInteger(10,99)+'x'+resolution.value+''+randomInteger(10,99))
          .then(response => response.blob())
          .then(image => {
            image3 = URL.createObjectURL(image);
            randomImage3.value = image3;
          });
      fetch('https://source.unsplash.com/random/'+resolution.value+''+randomInteger(10,99)+'x'+resolution.value+''+randomInteger(10,99))
          .then(response => response.blob())
          .then(image => {
            image4 = URL.createObjectURL(image);
            randomImage4.value = image4;
          });

      fetch('https://source.unsplash.com/random/'+resolution.value+''+randomInteger(10,99)+'x'+resolution.value+''+randomInteger(10,99))
          .then(response => response.blob())
          .then(image => {
            image5 = URL.createObjectURL(image);
            randomImage5.value = image5;
          });

      fetch('https://source.unsplash.com/random/'+resolution.value+''+randomInteger(10,99)+'x'+resolution.value+''+randomInteger(10,99))
          .then(response => response.blob())
          .then(image => {
            image6 = URL.createObjectURL(image);
            randomImage6.value = image6;
          });
    };

    getRandomImage();

    function setQuality(value){
      quality.value = value;
      switch(value){
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

    let titleOpacity        = ref(0);
    let titleReflectOpacity = ref(0);
    let titleLeft           = ref(50);
    let titleTop            = ref(50);
    let selectedFileURL     = ref(null);
    let fileInput           = ref(null);
    let isDragOver          = ref(false);
    let bottomPosition      = ref(-50);

    onMounted(() => {
      window.addEventListener("dragover",function(e){
        e.preventDefault();
      },false);
      window.addEventListener("drop",function(e){
        e.preventDefault();
      },false);

      setTimeout(function(){
        titleOpacity.value = 1;
        titleReflectOpacity.value = 0.05;
      },500);
      setTimeout(function(){
        bottomPosition.value = 0;
      },1500);

    });

    function start(image){
      router.push({name:'Editor', params:{userImage:image}});
    }


    function onChange(e) {
      selectedFileURL.value = URL.createObjectURL(e.target.files[0]);
      router.push({name:'Editor', params:{userImage:selectedFileURL.value}});
    }

    function onDrop(e){
      e.preventDefault();
      selectedFileURL.value = URL.createObjectURL(e.dataTransfer.files[0]);
      router.push({name:'Editor', params:{userImage:selectedFileURL.value}});
    }

    return{
      titleOpacity,
      titleReflectOpacity,
      titleLeft,
      titleTop,
      router,
      fileInput,
      isDragOver,
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


    }
  }
}
</script>

<style scoped>
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

h1 {
  font-family: Biysk;
}

h2 {
  font-family: Biysk;
  text-align: left;
}

.container{
  width:100%;
  height: 100vh;
  display:flex;
  justify-content: center;
}

.bg-image  {
  position:absolute;
  width:100%;
  height:100%;
  background-image: url('../images/caleido.png');
  background-repeat: no-repeat;
  background-position: center;
  opacity:0.1;
}

button {
  background-color:#111111;
  color:gray;
  height:100px;
  width:100%;
  border-radius: 100%;
  border:1px solid #1c1c1c;
  outline:none;
  margin:0 auto;
  margin-bottom:10px;
  font-size:1.5em;
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
  font-size:10vw;
  font-weight: bold;
  color: #7e98b5;
  pointer-events: none;
}

.caleido-title-container {

  left:50%;
  top:20%;
  position: absolute;
  transform:translate(-50%, -50%);
  transition: opacity;
  transition-duration: 3s;
  pointer-events: none;
}

.caleido-title-container-reflect {
  pointer-events: none;
  left:50%;
  top:20%;
  position: absolute;
  transform:translate(-50%, 10%) scale(1, -1);
  -webkit-mask-image: -webkit-gradient(linear, left top,
  left bottom, from(rgba(0,0,0,0)), to(rgba(0,0,0,1)) );
  filter: blur(8px);
  -webkit-filter: blur(3px);
  opacity:1;
  transition: opacity;
  transition-duration: 1.5s;
}


.image-raw {
  width:800px;
  height:800px;
  border:1px solid white;
  position:absolute;
  z-index:99999999;
  display: flex;
}

.drop-text-div {
 display: flex;
  margin:0 auto;
  margin-bottom:20%;
  transition: opacity;
  transition-duration: 3s;
}

.drop-text {
  font-family: Biysk;
  font-size:2em;
  pointer-events: none;
}

.highlight {
 font-size:2.1em;
 font-weight:bold;
 color: #6fa3e3;
}

.drop-zone {
  width:50vh;
  height:50vh;
  flex-direction: column;
  display:flex;
  justify-content: flex-end;
}

.bottom-section {
  width:100%;

  height:50vh;
  bottom:0;
  position:absolute;
  border-top:1px solid #222222;
  background-color: rgb(10, 12, 15, 0.3);
  display: flex;
  flex-direction: row;
  justify-content: center;
  overflow: hidden;
  transition: bottom;
  transition-duration: 0.7s;
  transition-timing-function: ease-in-out;

}

.bottom-left {
  width:33%;
  height:100%;
}

.bottom-middle {
  margin-top:20px;
  height:100%;
}

.bottom-right {
  width:33%;
  height:100%;
}

@media all and (max-width: 900px) {
  .bottom-left {
    display:none;
  }
  .bottom-right {
    display:none;
  }
}


.images-row {
  width:50vh;
  height:100px;
  display:flex;
  justify-content: space-between;
  margin:0 auto;
  margin-bottom: 30px;
  margin-top: 30px;
}

.random-row {
  width:200px;
  height:50px;
  margin:0 auto;
}

.random-button{
  height:50px;
  border-radius: 30px;
}

.try-text {
  font-family: Biysk;
  font-size:1.5em;
  margin-bottom: 30px;
}

.description-container {
  width:60%;
  margin:0 auto;
}

.description-container-right {
  width:60%;
  margin:0 auto;
  text-align: left;
}


.description {
  font-family: Biysk;
  font-size: 1.1em;
}

.quality-buttons-container {
  width:100%;
  height:30px;
  margin-top: 20px;
}

.quality-button {
  width:100px;
  height:20px;
  font-size:0.8em;
  border-radius: 10px;
  margin:5px;
}

.selected-quality {
  border:2px solid #6fa3e3;
}

</style>
