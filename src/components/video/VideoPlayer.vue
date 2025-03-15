<template>
  <div class="video-container">
    <!-- 添加上传区域 -->
    <div v-if="!localVideoUrl" class="upload-area">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        accept="video/*"
        class="file-input"
      />
      <button @click="triggerFileInput" class="upload-button">
        上传视频
      </button>
      <p>或者使用默认视频</p>
      <button @click="useDefaultVideo" class="default-button">
        使用默认视频
      </button>
      <p v-if="uploadError" class="error-message">{{ uploadError }}</p>
      <div v-if="isUploading" class="upload-progress">
        <p>上传中... {{ uploadProgress }}%</p>
        <div class="progress-bar-outer">
          <div :style="{ width: uploadProgress + '%' }" class="progress-bar-inner"></div>
        </div>
      </div>
    </div>

    <video
      v-show="localVideoUrl || videoUrl"
      ref="videoRef"
      class="video-player"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMetadataLoaded"
    >
      <source :src="localVideoUrl || videoUrl" type="video/mp4">
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

    <!-- 添加进度条显示 -->
    <div class="progress-bar">
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import TimelineMarker from './TimelineMarker.vue'
import { uploadToMinio } from '@/utils/upload'

const props = defineProps<{
  videoUrl: string
  characters: string[]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const duration = ref(0)
const currentTime = ref(0) // 添加当前时间
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
  currentTime.value = videoRef.value.currentTime // 更新当前时间
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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(loadMarkers)

const localVideoUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const uploadError = ref('')
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
const isUploading = ref(false)
const uploadProgress = ref(0)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  uploadError.value = ''
  uploadProgress.value = 0
  
  // 添加文件验证
  if (!ALLOWED_TYPES.includes(file.type)) {
    uploadError.value = '不支持的文件类型，请上传 MP4、WebM 或 OGG 格式的视频'
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    uploadError.value = '文件大小不能超过 100MB'
    return
  }

  try {
    isUploading.value = true
    
    // 检查文件是否为空
    if (file.size === 0) {
      throw new Error('文件内容为空')
    }
    
    const localUrl = URL.createObjectURL(file)
    
    // 添加重试机制
    let retries = 3
    let uploadedUrl = null
    
    while (retries > 0) {
      try {
        uploadedUrl = await uploadToMinio(file, (progress) => {
          uploadProgress.value = Math.round(progress * 100)
        })
        break
      } catch (error) {
        retries--
        if (retries === 0) throw error
        await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒后重试
      }
    }
    
    if (!uploadedUrl) {
      throw new Error('上传失败')
    }
    
    localVideoUrl.value = localUrl
    console.log('文件上传成功，访问地址:', uploadedUrl)
    
  } catch (error) {
    console.error('上传失败:', error)
    uploadError.value = error instanceof Error 
      ? `上传失败: ${error.message}` 
      : '文件上传失败，请重试'
    
    if (localVideoUrl.value) {
      URL.revokeObjectURL(localVideoUrl.value)
      localVideoUrl.value = ''
    }
  } finally {
    isUploading.value = false
    if (target) target.value = ''
  }
}

const useDefaultVideo = () => {
  localVideoUrl.value = ''
}

// 组件销毁时清理本地视频URL
onUnmounted(() => {
  if (localVideoUrl.value) {
    URL.revokeObjectURL(localVideoUrl.value)
  }
})
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

/* 添加进度条样式 */
.progress-bar {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.upload-area {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #42b983;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.upload-button,
.default-button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.upload-button:hover,
.default-button:hover {
  background: #3aa876;
}

.default-button {
  background: #666;
}

.default-button:hover {
  background: #555;
}

.error-message {
  color: #ff4444;
  margin-top: 10px;
  text-align: center;
}

.upload-progress {
  width: 100%;
  margin-top: 10px;
}

.progress-bar-outer {
  width: 100%;
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
}

.progress-bar-inner {
  height: 100%;
  background-color: #42b983;
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
