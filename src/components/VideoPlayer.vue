<template>
  <vue-plyr>
    <video
      controls
      crossorigin
      playsinline
      :src="videoUrl"
    >
    </video>
  </vue-plyr>
</template>

<script setup>
import { VuePlyr } from 'vue-plyr'

defineProps({
  videoUrl: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.plyr {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>
