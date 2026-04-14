<template>
  <div class="music-therapy" :class="currentTheme">
    <!-- 顶部导航 -->
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回</el-button>
      <span class="nav-title">音乐放松</span>
      <div class="nav-actions">
        <el-dropdown @command="changeTheme">
          <el-button circle>
            <el-icon><Sunset /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="default">默认</el-dropdown-item>
              <el-dropdown-item command="night">夜间</el-dropdown-item>
              <el-dropdown-item command="nature">自然</el-dropdown-item>
              <el-dropdown-item command="ocean">海洋</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="main-layout">
      <!-- 左侧播放器区域 -->
      <div class="player-area">
        <!-- 可视化背景 -->
        <div class="visualizer-bg">
          <canvas ref="canvasRef" class="audio-canvas"></canvas>
        </div>

        <!-- 专辑封面 -->
        <div class="album-container" :class="{ playing: isPlaying }">
          <div class="album-disc">
            <div class="disc-inner">
              <img
                v-if="currentMusic?.cover"
                :src="currentMusic.cover"
                :alt="currentMusic.title"
              />
              <div v-else class="disc-placeholder">
                <el-icon><Headset /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 音乐信息 -->
        <div class="music-info" v-if="currentMusic">
          <h2 class="music-title">{{ currentMusic.title }}</h2>
          <p class="music-artist">{{ currentMusic.artist }}</p>
          <div class="music-tags">
            <el-tag size="small" type="info">{{ currentMusic.category }}</el-tag>
            <el-tag v-if="currentMusic.isFavorite" size="small" type="warning">已收藏</el-tag>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="progress-section">
          <span class="time-text">{{ formatTime(currentTime) }}</span>
          <div class="progress-track" @click="seekTo">
            <div class="progress-fill" :style="{ width: progress + '%' }">
              <span class="progress-thumb"></span>
            </div>
          </div>
          <span class="time-text">{{ formatTime(duration) }}</span>
        </div>

        <!-- 控制按钮 -->
        <div class="control-section">
          <div class="control-row">
            <el-button circle size="small" @click="togglePlayMode" :title="playModeText">
              <el-icon v-if="playMode === 'sequence'"><Sort /></el-icon>
              <el-icon v-else-if="playMode === 'random'"><Operation /></el-icon>
              <el-icon v-else><RefreshRight /></el-icon>
            </el-button>
            <el-button circle @click="prevMusic">
              <el-icon><DArrowLeft /></el-icon>
            </el-button>
            <el-button
              circle
              size="large"
              type="primary"
              class="play-btn"
              @click="togglePlay"
            >
              <el-icon :size="28" v-if="isPlaying"><VideoPause /></el-icon>
              <el-icon :size="28" v-else><VideoPlay /></el-icon>
            </el-button>
            <el-button circle @click="nextMusic">
              <el-icon><DArrowRight /></el-icon>
            </el-button>
            <el-button circle size="small" @click="showTimerDialog = true" :title="timerText">
              <el-icon><AlarmClock /></el-icon>
            </el-button>
          </div>

          <div class="volume-row">
            <el-icon class="volume-icon" @click="toggleMute">
              <Mute v-if="isMuted" />
              <Microphone v-else />
            </el-icon>
            <el-slider
              v-model="volume"
              :min="0"
              :max="100"
              @input="onVolumeChange"
              class="volume-slider"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-row">
          <el-button text @click="toggleFavorite">
            <el-icon><StarFilled v-if="currentMusic?.isFavorite" /><Star v-else /></el-icon>
            收藏
          </el-button>
          <el-button text @click="showBreathDialog = true">
            <el-icon><Sunny /></el-icon>
            呼吸练习
          </el-button>
          <el-button text @click="showMixerDialog = true">
            <el-icon><SetUp /></el-icon>
            白噪音
          </el-button>
        </div>
      </div>

      <!-- 右侧列表区域 -->
      <div class="list-area">
        <!-- 情绪选择 -->
        <div class="emotion-section">
          <h3 class="section-title">选择心情</h3>
          <div class="emotion-grid">
            <div
              v-for="emotion in emotions"
              :key="emotion.value"
              class="emotion-card"
              :class="{ active: selectedEmotion === emotion.value }"
              @click="selectEmotion(emotion.value)"
            >
              <span class="emotion-emoji">{{ emotion.emoji }}</span>
              <span class="emotion-label">{{ emotion.label }}</span>
            </div>
          </div>
        </div>

        <!-- 播放列表 -->
        <div class="playlist-section">
          <div class="section-header">
            <h3 class="section-title">播放列表</h3>
            <span class="music-count">{{ playlist.length }} 首</span>
          </div>
          <div class="playlist-scroll">
            <div
              v-for="(music, index) in playlist"
              :key="music.id"
              class="playlist-item"
              :class="{ active: currentMusic?.id === music.id }"
              @click="playMusic(index)"
            >
              <div class="item-index">
                <el-icon v-if="currentMusic?.id === music.id && isPlaying" class="playing-icon">
                  <VideoPlay />
                </el-icon>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="item-cover">
                <img v-if="music.cover" :src="music.cover" :alt="music.title" />
                <div v-else class="cover-placeholder">
                  <el-icon><Headset /></el-icon>
                </div>
              </div>
              <div class="item-info">
                <span class="item-title">{{ music.title }}</span>
                <span class="item-meta">{{ music.artist }} · {{ formatDuration(music.duration) }}</span>
              </div>
              <el-icon v-if="music.isFavorite" class="item-favorite"><StarFilled /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的音频元素 -->
    <audio
      ref="audioRef"
      :src="currentAudioSrc"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @error="onAudioError"
    ></audio>

    <!-- 白噪音音频 -->
    <audio ref="rainAudioRef" loop :src="whitenoiseSources.rain"></audio>
    <audio ref="waveAudioRef" loop :src="whitenoiseSources.wave"></audio>
    <audio ref="forestAudioRef" loop :src="whitenoiseSources.forest"></audio>
    <audio ref="fireAudioRef" loop :src="whitenoiseSources.fire"></audio>

    <!-- 定时器弹窗 -->
    <el-dialog v-model="showTimerDialog" title="睡眠定时" width="360px" class="timer-dialog">
      <div class="timer-options">
        <div
          v-for="option in timerOptions"
          :key="option.value"
          class="timer-option"
          :class="{ active: sleepTimer === option.value }"
          @click="setSleepTimer(option.value)"
        >
          <el-icon><AlarmClock /></el-icon>
          <span>{{ option.label }}</span>
        </div>
      </div>
      <div v-if="sleepTimer > 0" class="timer-countdown">
        <p>将在 <strong>{{ formatTimer(timerRemaining) }}</strong> 后停止播放</p>
        <el-button text type="danger" @click="cancelTimer">取消定时</el-button>
      </div>
    </el-dialog>

    <!-- 呼吸练习弹窗 -->
    <el-dialog
      v-model="showBreathDialog"
      title="呼吸练习"
      width="400px"
      class="breath-dialog"
      :close-on-click-modal="false"
    >
      <div class="breath-container">
        <div class="breath-circle" :class="breathPhase">
          <div class="breath-inner">
            <span class="breath-text">{{ breathText }}</span>
            <span class="breath-count">{{ breathCount }}</span>
          </div>
        </div>
        <p class="breath-hint">{{ breathHint }}</p>
      </div>
      <template #footer>
        <el-button v-if="!isBreathing" type="primary" @click="startBreathing">开始练习</el-button>
        <el-button v-else type="danger" @click="stopBreathing">停止</el-button>
      </template>
    </el-dialog>

    <!-- 白噪音混音弹窗 -->
    <el-dialog v-model="showMixerDialog" title="白噪音混音" width="400px" class="mixer-dialog">
      <div class="mixer-list">
        <div class="mixer-item">
          <div class="mixer-info">
            <span class="mixer-emoji">🌧️</span>
            <span class="mixer-name">雨声</span>
          </div>
          <el-slider v-model="whitenoiseVolumes.rain" :min="0" :max="100" @input="updateWhitenoise('rain')" />
        </div>
        <div class="mixer-item">
          <div class="mixer-info">
            <span class="mixer-emoji">🌊</span>
            <span class="mixer-name">海浪</span>
          </div>
          <el-slider v-model="whitenoiseVolumes.wave" :min="0" :max="100" @input="updateWhitenoise('wave')" />
        </div>
        <div class="mixer-item">
          <div class="mixer-info">
            <span class="mixer-emoji">🌲</span>
            <span class="mixer-name">森林</span>
          </div>
          <el-slider v-model="whitenoiseVolumes.forest" :min="0" :max="100" @input="updateWhitenoise('forest')" />
        </div>
        <div class="mixer-item">
          <div class="mixer-info">
            <span class="mixer-emoji">🔥</span>
            <span class="mixer-name">篝火</span>
          </div>
          <el-slider v-model="whitenoiseVolumes.fire" :min="0" :max="100" @input="updateWhitenoise('fire')" />
        </div>
      </div>
      <template #footer>
        <el-button @click="resetWhitenoise">重置</el-button>
        <el-button type="primary" @click="showMixerDialog = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Headset,
  VideoPlay,
  VideoPause,
  DArrowLeft,
  DArrowRight,
  Star,
  StarFilled,
  Mute,
  Microphone,
  AlarmClock,
  Sort,
  Operation,
  RefreshRight,
  Sunny,
  SetUp,
  Sunset,
} from '@element-plus/icons-vue'
import { getMusicList, getMusicByEmotion } from '@/api/selfHelp'

const audioRef = ref(null)
const canvasRef = ref(null)
const rainAudioRef = ref(null)
const waveAudioRef = ref(null)
const forestAudioRef = ref(null)
const fireAudioRef = ref(null)

const currentTheme = ref('default')
const currentMusic = ref(null)
const playlist = ref([])
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(70)
const currentTime = ref(0)
const duration = ref(0)
const selectedEmotion = ref('')
const playMode = ref('sequence')
const sleepTimer = ref(0)
const timerRemaining = ref(0)
let timerInterval = null
let animationId = null
let audioContext = null
let analyser = null
let dataArray = null

const currentAudioSrc = computed(() => {
  if (!currentMusic.value) return ''
  return currentMusic.value.audioUrl || '/audio/sample.mp3'
})

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const playModeText = computed(() => {
  const modes = { sequence: '顺序播放', random: '随机播放', loop: '单曲循环' }
  return modes[playMode.value]
})

const timerText = computed(() => {
  if (sleepTimer.value === 0) return '定时关闭'
  return `${Math.ceil(timerRemaining.value / 60)}分钟后关闭`
})

const emotions = [
  { value: 'relax', label: '放松', emoji: '😌' },
  { value: 'calm', label: '平静', emoji: '🧘' },
  { value: 'sleep', label: '助眠', emoji: '😴' },
  { value: 'focus', label: '专注', emoji: '🎯' },
  { value: 'happy', label: '愉悦', emoji: '😊' },
  { value: 'energy', label: '活力', emoji: '⚡' },
]

const timerOptions = [
  { value: 0, label: '不开启' },
  { value: 15, label: '15分钟' },
  { value: 30, label: '30分钟' },
  { value: 45, label: '45分钟' },
  { value: 60, label: '1小时' },
  { value: 90, label: '1.5小时' },
]

const whitenoiseSources = {
  rain: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
  wave: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3',
  forest: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
  fire: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3',
}

const whitenoiseVolumes = ref({
  rain: 0,
  wave: 0,
  forest: 0,
  fire: 0,
})

const showTimerDialog = ref(false)
const showBreathDialog = ref(false)
const showMixerDialog = ref(false)

const isBreathing = ref(false)
const breathPhase = ref('inhale')
const breathText = ref('准备')
const breathCount = ref(0)
const breathHint = ref('跟随圆圈的节奏，调整呼吸')
let breathInterval = null

function changeTheme(theme) {
  currentTheme.value = theme
}

function playMusic(index) {
  currentMusic.value = playlist.value[index]
  currentTime.value = 0
  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.load()
      audioRef.value.play().then(() => {
        isPlaying.value = true
        initAudioVisualizer()
      }).catch(err => {
        console.error('播放失败:', err)
        isPlaying.value = true
      })
    }
  })
}

function togglePlay() {
  if (!currentMusic.value) {
    if (playlist.value.length > 0) {
      playMusic(0)
    }
    return
  }

  if (isPlaying.value) {
    audioRef.value?.pause()
    isPlaying.value = false
  } else {
    audioRef.value?.play().catch(() => {
      isPlaying.value = true
    })
    isPlaying.value = true
  }
}

function prevMusic() {
  if (!currentMusic.value || playlist.value.length === 0) return
  const index = playlist.value.findIndex(m => m.id === currentMusic.value.id)
  const newIndex = index > 0 ? index - 1 : playlist.value.length - 1
  playMusic(newIndex)
}

function nextMusic() {
  if (!currentMusic.value || playlist.value.length === 0) return
  const index = playlist.value.findIndex(m => m.id === currentMusic.value.id)
  let newIndex

  if (playMode.value === 'random') {
    newIndex = Math.floor(Math.random() * playlist.value.length)
  } else {
    newIndex = index < playlist.value.length - 1 ? index + 1 : 0
  }
  playMusic(newIndex)
}

function togglePlayMode() {
  const modes = ['sequence', 'random', 'loop']
  const index = modes.indexOf(playMode.value)
  playMode.value = modes[(index + 1) % modes.length]
  ElMessage.success(playModeText.value)
}

function seekTo(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value
  currentTime.value = newTime
  if (audioRef.value) {
    audioRef.value.currentTime = newTime
  }
}

function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || 0
  }
}

function onEnded() {
  if (playMode.value === 'loop') {
    audioRef.value.currentTime = 0
    audioRef.value.play()
  } else {
    nextMusic()
  }
}

function onAudioError() {
  duration.value = currentMusic.value?.duration || 300
}

function onVolumeChange(value) {
  isMuted.value = value === 0
  if (audioRef.value) {
    audioRef.value.volume = value / 100
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (isMuted.value) {
    volume.value = 0
  } else {
    volume.value = 70
  }
  if (audioRef.value) {
    audioRef.value.volume = volume.value / 100
  }
}

function toggleFavorite() {
  if (currentMusic.value) {
    currentMusic.value.isFavorite = !currentMusic.value.isFavorite
    ElMessage.success(currentMusic.value.isFavorite ? '已收藏' : '已取消收藏')
  }
}

function selectEmotion(emotion) {
  selectedEmotion.value = emotion
  getMusicByEmotion(emotion).then(res => {
    if (res.code === 200 && res.data) {
      playlist.value = res.data
      if (playlist.value.length > 0) {
        playMusic(0)
      }
    }
  })
}

function setSleepTimer(minutes) {
  sleepTimer.value = minutes
  timerRemaining.value = minutes * 60

  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  if (minutes > 0) {
    timerInterval = setInterval(() => {
      timerRemaining.value--
      if (timerRemaining.value <= 0) {
        clearInterval(timerInterval)
        timerInterval = null
        sleepTimer.value = 0
        if (isPlaying.value) {
          togglePlay()
          ElMessage.info('定时结束，已停止播放')
        }
      }
    }, 1000)
    showTimerDialog.value = false
    ElMessage.success(`已设置${minutes}分钟后停止播放`)
  }
}

function cancelTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  sleepTimer.value = 0
  timerRemaining.value = 0
  ElMessage.info('已取消定时')
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

function startBreathing() {
  isBreathing.value = true
  breathCount.value = 0
  runBreathCycle()
}

function runBreathCycle() {
  breathPhase.value = 'inhale'
  breathText.value = '吸气'
  breathHint.value = '慢慢吸气，让腹部膨胀'

  setTimeout(() => {
    if (!isBreathing.value) return
    breathPhase.value = 'hold'
    breathText.value = '屏息'
    breathHint.value = '保持，感受气息充满身体'

    setTimeout(() => {
      if (!isBreathing.value) return
      breathPhase.value = 'exhale'
      breathText.value = '呼气'
      breathHint.value = '缓缓呼出，释放紧张'

      setTimeout(() => {
        if (!isBreathing.value) return
        breathCount.value++
        if (breathCount.value < 10) {
          runBreathCycle()
        } else {
          stopBreathing()
          ElMessage.success('呼吸练习完成！')
        }
      }, 4000)
    }, 4000)
  }, 4000)
}

function stopBreathing() {
  isBreathing.value = false
  breathPhase.value = 'inhale'
  breathText.value = '准备'
  breathHint.value = '跟随圆圈的节奏，调整呼吸'
}

function updateWhitenoise(type) {
  const audioRefs = {
    rain: rainAudioRef,
    wave: waveAudioRef,
    forest: forestAudioRef,
    fire: fireAudioRef,
  }
  const audioEl = audioRefs[type].value
  if (!audioEl) return

  const vol = whitenoiseVolumes.value[type]
  audioEl.volume = vol / 100

  if (vol > 0) {
    audioEl.play().catch(() => {})
  } else {
    audioEl.pause()
  }
}

function resetWhitenoise() {
  Object.keys(whitenoiseVolumes.value).forEach(key => {
    whitenoiseVolumes.value[key] = 0
    updateWhitenoise(key)
  })
}

function initAudioVisualizer() {
  if (!canvasRef.value || !audioRef.value) return

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioRef.value)
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      analyser.fftSize = 256
      dataArray = new Uint8Array(analyser.frequencyBinCount)
    }
    drawVisualizer()
  } catch (e) {
    drawFakeVisualizer()
  }
}

function drawVisualizer() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width = canvas.offsetWidth * 2
  const height = canvas.height = canvas.offsetHeight * 2

  function draw() {
    animationId = requestAnimationFrame(draw)

    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray)
    }

    ctx.clearRect(0, 0, width, height)

    const barCount = 64
    const barWidth = width / barCount
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.6)')

    for (let i = 0; i < barCount; i++) {
      let barHeight
      if (dataArray && isPlaying.value) {
        barHeight = (dataArray[i * 2] / 255) * height * 0.8
      } else {
        barHeight = Math.sin(Date.now() / 500 + i * 0.2) * 20 + 30
      }

      ctx.fillStyle = gradient
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight)
    }
  }

  draw()
}

function drawFakeVisualizer() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width = canvas.offsetWidth * 2
  const height = canvas.height = canvas.offsetHeight * 2

  function draw() {
    animationId = requestAnimationFrame(draw)
    ctx.clearRect(0, 0, width, height)

    const barCount = 64
    const barWidth = width / barCount
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.6)')

    for (let i = 0; i < barCount; i++) {
      let barHeight
      if (isPlaying.value) {
        barHeight = Math.sin(Date.now() / 200 + i * 0.3) * 40 + Math.random() * 30 + 40
      } else {
        barHeight = Math.sin(Date.now() / 500 + i * 0.2) * 15 + 25
      }

      ctx.fillStyle = gradient
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight)
    }
  }

  draw()
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(async () => {
  try {
    const res = await getMusicList()
    if (res.code === 200 && res.data) {
      playlist.value = res.data
      if (playlist.value.length > 0) {
        currentMusic.value = playlist.value[0]
        duration.value = currentMusic.value.duration || 300
      }
    }
  } catch (e) {
    console.error('加载音乐列表失败:', e)
  }

  nextTick(() => {
    drawFakeVisualizer()
  })
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.music-therapy {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  color: #fff;
  transition: background 0.5s ease;
}

.music-therapy.night {
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #2d2d2d 100%);
}

.music-therapy.nature {
  background: linear-gradient(135deg, #134e5e 0%, #1a472a 50%, #2d5a27 100%);
}

.music-therapy.ocean {
  background: linear-gradient(135deg, #0077b6 0%, #023e8a 50%, #03045e 100%);
}

.page-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.page-nav :deep(.el-button) {
  color: rgba(255, 255, 255, 0.9);
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.player-area {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.visualizer-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  opacity: 0.6;
}

.audio-canvas {
  width: 100%;
  height: 100%;
}

.album-container {
  width: 280px;
  height: 280px;
  margin: 0 auto 24px;
  position: relative;
  z-index: 1;
}

.album-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #2a2a4a, #1a1a2e);
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: none;
}

.album-container.playing .album-disc {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.disc-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #3a3a5a, #2a2a4a);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.disc-inner::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  background: #1a1a2e;
  border-radius: 50%;
  border: 4px solid #3a3a5a;
}

.disc-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.disc-placeholder {
  font-size: 60px;
  color: rgba(255, 255, 255, 0.3);
}

.music-info {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.music-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.music-artist {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px 0;
}

.music-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.time-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 45px;
  font-family: monospace;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.control-section {
  position: relative;
  z-index: 1;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.control-row :deep(.el-button) {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
}

.control-row :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.2);
}

.play-btn.el-button {
  width: 64px !important;
  height: 64px !important;
  background: linear-gradient(135deg, #8b5cf6, #6366f1) !important;
}

.volume-row {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 200px;
  margin: 0 auto;
}

.volume-icon {
  cursor: pointer;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
}

.volume-slider {
  flex: 1;
}

.volume-slider :deep(.el-slider__runway) {
  background: rgba(255, 255, 255, 0.15);
}

.volume-slider :deep(.el-slider__bar) {
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
}

.volume-slider :deep(.el-slider__button) {
  border-color: #8b5cf6;
}

.action-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  position: relative;
  z-index: 1;
}

.action-row :deep(.el-button) {
  color: rgba(255, 255, 255, 0.7);
}

.action-row :deep(.el-button:hover) {
  color: #fff;
}

.list-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.emotion-section,
.playlist-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .section-title {
  margin: 0;
}

.music-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.emotion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.emotion-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.emotion-card.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
}

.emotion-emoji {
  font-size: 24px;
}

.emotion-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.playlist-scroll {
  max-height: 400px;
  overflow-y: auto;
}

.playlist-scroll::-webkit-scrollbar {
  width: 4px;
}

.playlist-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.playlist-item.active {
  background: rgba(139, 92, 246, 0.2);
}

.item-index {
  width: 24px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.playing-icon {
  color: #8b5cf6;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.item-cover {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.item-favorite {
  color: #fbbf24;
  font-size: 14px;
}

.timer-dialog :deep(.el-dialog) {
  background: #1a1a2e;
  border-radius: 16px;
}

.timer-dialog :deep(.el-dialog__title) {
  color: #fff;
}

.timer-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.timer-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
}

.timer-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.timer-option.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
}

.timer-countdown {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.breath-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
}

.breath-dialog :deep(.el-dialog__title) {
  color: #fff;
}

.breath-container {
  text-align: center;
  padding: 20px 0;
}

.breath-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.2);
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 4s ease-in-out;
  border: 3px solid rgba(139, 92, 246, 0.5);
}

.breath-circle.inhale {
  transform: scale(1.3);
  background: rgba(139, 92, 246, 0.4);
  border-color: #8b5cf6;
}

.breath-circle.hold {
  transform: scale(1.3);
  background: rgba(99, 102, 241, 0.4);
  border-color: #6366f1;
}

.breath-circle.exhale {
  transform: scale(1);
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
}

.breath-inner {
  text-align: center;
}

.breath-text {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.breath-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.breath-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

.mixer-dialog :deep(.el-dialog) {
  background: #1a1a2e;
  border-radius: 16px;
}

.mixer-dialog :deep(.el-dialog__title) {
  color: #fff;
}

.mixer-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mixer-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mixer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.mixer-emoji {
  font-size: 20px;
}

.mixer-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.mixer-item :deep(.el-slider) {
  flex: 1;
}

.mixer-item :deep(.el-slider__runway) {
  background: rgba(255, 255, 255, 0.15);
}

.mixer-item :deep(.el-slider__bar) {
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .list-area {
    order: -1;
  }

  .emotion-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .playlist-scroll {
    max-height: 200px;
  }
}

@media (max-width: 640px) {
  .music-therapy {
    padding: 12px;
  }

  .player-area {
    padding: 20px;
  }

  .album-container {
    width: 200px;
    height: 200px;
  }

  .emotion-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
