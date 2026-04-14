<template>
  <div class="back-button-wrapper" :class="{ 'with-bg': withBackground }">
    <el-button 
      :type="buttonType" 
      :text="!withBackground"
      :icon="ArrowLeft" 
      @click="handleBack"
      class="back-btn"
    >
      {{ text }}
    </el-button>
    <span v-if="title" class="page-title">{{ title }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = defineProps({
  text: {
    type: String,
    default: '返回'
  },
  title: {
    type: String,
    default: ''
  },
  to: {
    type: String,
    default: ''
  },
  withBackground: {
    type: Boolean,
    default: false
  },
  buttonType: {
    type: String,
    default: 'default'
  }
})

const router = useRouter()

const handleBack = () => {
  if (props.to) {
    router.push(props.to)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.back-button-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-button-wrapper.with-bg {
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.back-btn {
  font-size: 14px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
</style>
