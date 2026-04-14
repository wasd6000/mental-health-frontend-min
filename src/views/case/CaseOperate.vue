<template>
  <div class="case-operate-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">个案操作</span>
    </div>
    <el-card>
      <el-form :model="operateForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-select v-model="operateForm.type" placeholder="请选择操作类型" style="width: 100%">
            <el-option label="进展更新" value="progress" />
            <el-option label="结案" value="close" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="operateForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item>
          <el-button @click="$router.back()">取消</el-button>
          <el-button type="primary" @click="submitOperate">提交</el-button>
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
const operateForm = ref({ type: '', remark: '' })

function submitOperate() {
  ElMessage.success('操作成功')
  router.back()
}
</script>

<style scoped>
.case-operate-page {
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
