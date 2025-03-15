<!-- src/components/video/TimelineMarker.vue -->
<template>
  <div class="timeline">
    <div class="progress" :style="{ width: `${progress}%` }"></div>
    <div
      v-for="marker in markers"
      :key="marker.id"
      class="marker"
      :style="{ left: `${(marker.time / duration) * 100}%` }"
      :title="`${marker.character} at ${formatTime(marker.time)}`"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: number
  duration: number
  markers: Array<{
    id: number
    time: number
    character: string
  }>
}>()

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.timeline {
  position: relative;
  height: 20px;
  background: #2c3e50;
  border-radius: 4px;
  margin: 10px 0;
}

.progress {
  height: 100%;
  background: #42b983;
  border-radius: 4px;
  transition: width 0.1s linear;
}

.marker {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  background: #e74c3c;
  transform: translateX(-50%);
  cursor: pointer;
}
</style>
