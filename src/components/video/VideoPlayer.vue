<!-- src/components/video/VideoPlayer.vue -->
<template>
  <div class="video-container">
    <video
      ref="videoRef"
      class="video-player"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMetadataLoaded"
    >
      <source :src="videoUrl" type="video/mp4">
    </video>

    <div class="controls">
      <button @click="togglePlay">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <TimelineMarker
        :progress="progress"
        :duration="duration"
        :markers="markers"
      />
      <button @click="toggleFullscreen">⛶</button>
    </div>

    <div class="marker-controls">
      <select v-model="selectedCharacter">
        <option value="">Select character...</option>
        <option v-for="char in characters" :key="char" :value="char">
          {{ char }}
        </option>
      </select>
      <button
        @click="addMarker"
        :disabled="!selectedCharacter"
      >
        Add Marker
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TimelineMarker from './TimelineMarker.vue'

defineProps<{
  videoUrl: string
  characters: string[]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const duration = ref(0)
const progress = ref(0)
const selectedCharacter = ref('')
const markers = ref<Array<{ id: number, time: number, character: string }>>([])

const loadMarkers = () => {
  const saved = localStorage.getItem('videoMarkers')
  if (saved) markers.value = JSON.parse(saved)
}

const saveMarkers = () => {
  localStorage.setItem('videoMarkers', JSON.stringify(markers.value))
}

const togglePlay = () => {
  if (!videoRef.value) return
  isPlaying.value ? videoRef.value.pause() : videoRef.value.play()
  isPlaying.value = !isPlaying.value
}

const toggleFullscreen = () => {
  if (!videoRef.value) return
  if (!document.fullscreenElement) {
    videoRef.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const onTimeUpdate = () => {
  if (!videoRef.value) return
  progress.value = (videoRef.value.currentTime / duration.value) * 100
}

const onMetadataLoaded = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

const addMarker = () => {
  if (!videoRef.value || !selectedCharacter.value) return
  markers.value.push({
    id: Date.now(),
    time: videoRef.value.currentTime,
    character: selectedCharacter.value
  })
  saveMarkers()
}

onMounted(loadMarkers)
</script>

<style scoped>
.video-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video-player {
  width: 100%;
  border-radius: 8px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.controls button {
  padding: 8px;
  border: none;
  background: #42b983;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.marker-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.marker-controls select,
.marker-controls button {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.marker-controls button {
  background: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}

.marker-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
