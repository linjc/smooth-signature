<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import pcDemo from './components/pcDemo.vue'
import mbDemo from './components/mbDemo.vue'

const isMobile = (/Android|iPhone|iPad|Mobile/i).test(window.navigator.userAgent);

</script>

<template>
  <div>
    <mbDemo v-if="isMobile" />
    <pcDemo v-else />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
