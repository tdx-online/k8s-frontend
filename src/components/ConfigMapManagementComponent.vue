<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import yaml from 'js-yaml'

const tableData = ref([])
const pageSize = ref(10)
const currentPage = ref(1)
const totalItems = ref(0) // 总条目数
const dialogVisible = ref(false)
const newConfigMapData = ref('')
let fetchInterval = null

// 根据当前页和分页大小计算显示的数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  if (tableData.value === null) {
    return []
  }
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
  currentTableData.value = tableData.value === null ? 0 : tableData.value.slice(start, end)
}

const fetchConfigMaps = () => {
  axios.get('/configmaps').then(res => {
    tableData.value = res.data
    totalItems.value = tableData.value === null ? 0 : tableData.value.length
    currentPage.value = 1
  })
}

const delConfigMap = (row) => {
  axios.delete(`/configmap/${row.namespace}/${row.name}`).then(res => {
    if (res.status === 200) {
      ElMessage({
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      fetchConfigMaps()
    } else {
      ElMessage({
        message: '删除失败',
        type: 'error',
        duration: 2000
      })
    }
  })
}

const createConfigMap = () => {
  // console.log(newConfigMapData)
  let param
  try {
    param = JSON.parse(newConfigMapData.value)
  } catch (e) {
    try {
      param = yaml.load(newConfigMapData.value)
    } catch (e) {
      ElMessage({
        message: '请输入正确的配置',
        type: 'error',
        duration: 2000
      })
      return
    }
  }
  axios.post('/configmap', param,
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
      newConfigMapData.value = ''
      dialogVisible.value = false
      fetchConfigMaps()
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

onMounted(() =>{
  fetchConfigMaps()
  fetchInterval = setInterval(fetchConfigMaps, 5000)
})

onUnmounted(()=>{
  clearInterval(fetchInterval)
})

</script>

<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true" size="large"
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
    <el-table-column label="键" prop="keys" align="center" />
    <el-table-column align="center" fixed="right" label="操作">
      <template #default="scope">
        <el-button plain size="large" type="danger" @click="delConfigMap(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination v-if="tableData === null ? false : tableData.length > 0"
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

  <el-dialog v-model="dialogVisible" title="新建 ConfigMap">
    <el-input type="textarea" autosize v-model="newConfigMapData" placeholder="请输入新建 ConfigMap 的配置"
              style="margin-bottom: 10px"></el-input>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="createConfigMap">确 定</el-button>
    </span>
  </el-dialog>
</template>

<style scoped>

</style>