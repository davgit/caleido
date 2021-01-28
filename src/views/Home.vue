<template>
  <div class="container">
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
            <h1>We Love Mandalas</h1>
            <span class="description">There seems to be something pleasing about repetition. The most dull image could contain the most extraordinary patterns when seen through a kaleidoscope.</span>
          </div>
      </div>

      <div class="bottom-middle">
        <span class="try-text">or try with demo image</span>
        <div class="images-row">
          <DemoImage :url="images.Karina"  @click="start(images.Karina)" alt="Karina"></DemoImage>
          <DemoImage :url="images.Cuckoo"  @click="start(images.Cuckoo)" alt="Cuckoo"></DemoImage>
          <DemoImage :url="images.Trumpet" @click="start(images.Trumpet)" alt="Trumpet"></DemoImage>
        </div>
        <div class="images-row">
          <DemoImage :url="images.Herbie"   @click="start(images.Herbie)" alt="Herbie"></DemoImage>
          <DemoImage :url="images.Amethyst" @click="start(images.Amethyst)" alt="Amethyst"></DemoImage>
          <DemoImage :url="images.Calavera" @click="start(images.Calavera)" alt="Calavera"></DemoImage>
        </div>

      </div>
      <div class="bottom-right">
        <div class="description-container-right">
          <h2>Upload, Remix, Download</h2>
          <span class="description">Supported file format: JPG, PNG, WEBP, GIF</span><br><br>
          <span class="description">• mouse click/drag: pan</span><br>
          <span class="description">• mouse wheel: zoom</span><br>
          <span class="description">• CTRL+mouse wheel: zoom x 10</span><br><br>
          <span class="description">Download the current image at any time. Saved as a .PNG with alpha channel. </span><br><br>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DemoImage from "@/components/DemoImage";
import {ref, onMounted} from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  components: {
    DemoImage
  },
  setup(){
    const router = useRouter();

    let images = {
      Karina  : require("../images/Karina.jpg"),
      Amethyst: require("../images/Amethyst.png"),
      Cuckoo  : require("../images/Cuckoo.webp"),
      Herbie  : require("../images/Herbie.jpg"),
      Trumpet : require("../images/Trumpet.jpg"),
      Calavera: require("../images/Calavera.jpg"),
      
    };

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
      images,
      fileInput,
      isDragOver,
      bottomPosition,
      start,
      onChange,
      onDrop

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

@font-face {
  font-family: "Biysk";
  src: url("~@/fonts/Biysk.ttf") format("truetype");
}

.caleido-title {
  font-family: "Biysk";
  font-size:10vw;
  font-weight: bold;
  color: #446d9f;
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
 color: #6fa3e3;;
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
  background-color: #030303;
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
  width:33%;
  height:100%;
}

.bottom-right {
  width:33%;
  height:100%;
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


</style>
