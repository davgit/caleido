<template>
  <div class="container">
    <div class="inline">
      <label>{{label}}</label>
      <select v-model="selectValue">
        <option v-for="option in options" :key="option">{{option}}</option>
      </select>
    </div>
  </div>
</template>

<script>
import { useModelWrapper } from '../composables/modelWrapper'

export default {
  name: 'Slider',
  props: {
    label       : String,
    options     : Array,
    modelValue  : String
  },
  emits: ["update:modelValue"],
  setup(props,{emit}){
    return {
      selectValue: useModelWrapper(props, emit, 'modelValue'),
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  height:50px;
  width:100%;
  text-align: left;
  display:flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.inline{
  width:100%;
  height:20px;
}

label {
  user-select: none;
}

select {
float:right;
}
</style>
