<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'
import yaml from 'js-yaml'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const pageSize = ref(10)
const currentPage = ref(1)
const totalItems = ref(tableData.value.length) // 总条目数
const dialogVisible = ref(false)
const newPodData = ref('')

// 根据当前页和分页大小计算显示的数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tableData.value.slice(start, end)
})

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1 // 重置为第一页
  updateCurrentTableData()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  updateCurrentTableData()
}

const updateCurrentTableData = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  currentTableData.value = tableData.value.slice(start, end)
}

const fetchPods = () => {
  axios.get('/pods').then(res => {
    tableData.value = res.data
    totalItems.value = tableData.value.length
    currentPage.value = 1
  })
}

const delPod = (row) => {
  axios.delete(`/pod/${row.namespace}/${row.name}`).then(res => {
    if (res.status === 200) {
      ElMessage({
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      fetchPods()
    } else {
      ElMessage({
        message: '删除失败',
        type: 'error',
        duration: 2000
      })
    }
  })
}

const createPod = () => {
  // console.log(newPodData)
  let param
  try {
    param = JSON.parse(newPodData.value)
  } catch (e) {
    try {
      param = yaml.load(newPodData.value)
    } catch (e) {
      ElMessage({
        message: '请输入正确的配置',
        type: 'error',
        duration: 2000
      })
      return
    }
  }
  axios.post('/pod', param,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).then(res => {
    if (res.status === 200) {
      ElMessage({
        message: '创建成功',
        type: 'success',
        duration: 2000
      })
      dialogVisible.value = false
      newPodData.value = ''
      fetchPods()
    } else {
      ElMessage({
        message: '创建失败',
        type: 'error',
        duration: 2000
      })
    }
  }).catch(() => {
    ElMessage({
      message: '创建失败',
      type: 'error',
      duration: 2000
    })
  })
}
fetchPods()

const showCreateDialog = () => {
  newPodData.value = ''
  dialogVisible.value = true
}
</script>

<template>
  <div>
    <el-button type="primary" @click="showCreateDialog" size="large"
               style="float: right; margin-right: 100px; margin-bottom: 10px;">新建
    </el-button>
  </div>
  <el-table :data="currentTableData" border stripe style="width: 100%;">
    <el-table-column align="center" fixed label="序号">
      <template #default="{ $index }">
        <span>{{ $index + 1 }}</span>
      </template>
    </el-table-column>
    <el-table-column align="center" label="名称" prop="name" />
    <el-table-column align="center" label="命名空间" prop="namespace" />
    <el-table-column label="状态" prop="status" align="center" />
    <el-table-column label="IP" prop="podIP" align="center" />
    <el-table-column label="镜像" prop="images" align="center" />
    <el-table-column align="center" fixed="right" label="操作">
      <template #default="scope">
        <el-button plain size="large" type="danger" @click="delPod(scope.row)"
                   :disabled="scope.row.namespace === 'kube-system' || scope.row.namespace === 'kubernetes-dashboard'">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination v-if="tableData.length > 0"
                 @size-change="handleSizeChange"
                 @current-change="handleCurrentChange"
                 :current-page="currentPage"
                 :page-sizes="[10, 20, 30, 40]"
                 :page-size="pageSize"
                 layout="total, sizes, prev, pager, next, jumper"
                 :total="totalItems"
                 style="margin-top: 15px"
  >
  </el-pagination>

  <el-dialog v-model="dialogVisible" title="新建 Pod">
    <el-input type="textarea" autosize v-model="newPodData" placeholder="请输入新建 Pod 的配置"
              style="margin-bottom: 10px; " />
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="createPod">确 定</el-button>
    </span>
  </el-dialog>
</template>

<style scoped>

</style>