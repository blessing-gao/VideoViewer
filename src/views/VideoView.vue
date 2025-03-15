<!-- src/views/video/VideoView.vue -->
<template>
  <div class="video-view">
    <h1>Video Player</h1>
    <VideoPlayer
      :video-url="videoUrl"
      :characters="characters"
    />
  </div>
</template>

<script setup lang="ts">
import VideoPlayer from '@/components/video/VideoPlayer.vue'

const videoUrl = 'https://weiwoyonzhe.oss-cn-hangzhou.aliyuncs.com/test.mp4'
const characters = ['Character A', 'Character B', 'Character C']
</script>

<style scoped>
.video-view {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}
</style>
