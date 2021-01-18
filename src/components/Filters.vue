<template>
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="0%" height="0%">

    <filter id="EdgeDetect">
      <feConvolveMatrix
          order="3 3"
          preserveAlpha="true"
          kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
      />
    </filter>



    <filter id="Turbulence">
      <feTurbulence
          type="turbulence"
          baseFrequency="0.05"
          numOctaves="2"
          result="turbulence"
      />
      <feDisplacementMap
          in2="turbulence"
          in="SourceGraphic"
          scale="50"
          xChannelSelector="R"
          yChannelSelector="G"
      />
    </filter>




  </svg>
</template>

<script>
export default {
name: "filters"
}
</script>

<style scoped>

</style>