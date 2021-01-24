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

#nav {
  width:100%;
  height:20px;
  border:1px solid white;
}

</style>
