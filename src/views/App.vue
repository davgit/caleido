<template>
  <router-view />
</template>

<script>

export default {
  name: 'App',
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
  background-color: white;
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
