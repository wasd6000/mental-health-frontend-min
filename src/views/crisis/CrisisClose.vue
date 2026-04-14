<template>
  <div class="crisis-close-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">危机出库/结案</span>
    </div>
    <el-card>
      <el-form :model="closeForm" label-width="100px">
        <el-form-item label="出库原因">
          <el-input v-model="closeForm.reason" type="textarea" :rows="4" placeholder="请输入出库原因" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="closeForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item>
          <el-button @click="$router.back()">取消</el-button>
          <el-button type="primary" @click="submitClose">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const closeForm = ref({ reason: '', remark: '' })

function submitClose() {
  ElMessage.success('提交成功')
  router.back()
}
</script>

<style scoped>
.crisis-close-page {
  padding: 20px;
  max-width: 800px;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
</style>
