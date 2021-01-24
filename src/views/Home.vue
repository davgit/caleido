<template>
  <h1>Caledio</h1>
  <router-link to="/editor">Start</router-link>
</template>

<script>


export default {
  name: 'Home',
  components: {
  },
  setup(){



    return{
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
