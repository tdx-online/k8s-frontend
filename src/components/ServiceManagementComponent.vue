<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus'

const tableData = ref([]);
const pageSize = ref(10);
const currentPage = ref(1);
const totalItems = ref(tableData.value.length); // 总条目数
const dialogVisible = ref(false);
const newServiceData = ref('');

// 根据当前页和分页大小计算显示的数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 重置为第一页
  updateCurrentTableData();
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  updateCurrentTableData();
};

const updateCurrentTableData = () => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  currentTableData.value = tableData.value.slice(start, end);
};

const fetchServices = () => {
  axios.get('/services').then(res => {
    tableData.value = res.data;
    totalItems.value = tableData.value.length;
    currentPage.value = 1;
  });
};

const delService = (row) => {
  axios.delete(`/service/${row.namespace}/${row.name}`).then(res => {
    if(res.status === 200) {
      ElMessage({
        message: '删除成功',
        type: 'success',
        duration: 2000
      });
      fetchServices();
    }else {
      ElMessage({
        message: '删除失败',
        type: 'error',
        duration: 2000
      });
    }
  });
};

const createService=()=>{
  console.log(newServiceData)
  axios.post('/service', JSON.parse(newServiceData.value),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).then(res => {
    if(res.status === 200) {
      ElMessage({
        message: '创建成功',
        type: 'success',
        duration: 2000
      });
      fetchServices();
    }else {
      ElMessage({
        message: '创建失败',
        type: 'error',
        duration: 2000
      });
    }
  });
}
fetchServices()
</script>

<template>
  <div>
    <el-button type="primary" @click="dialogVisible = true" size="large" style="float: right; margin-right: 100px; margin-bottom: 10px;">新建</el-button>
  </div>
  <el-table :data="currentTableData" border stripe style="width: 100%;" >
    <el-table-column align="center" fixed label="序号" >
      <template #default="{ $index }">
        <span>{{ $index + 1 }}</span>
      </template>
    </el-table-column>
    <el-table-column align="center" label="名称" prop="name"  />
    <el-table-column align="center" label="命名空间" prop="namespace"  />
    <el-table-column label="类型" prop="type"  align="center" />
    <el-table-column label="clusterIP" prop="clusterIP"  align="center"  />
    <el-table-column label="端口" prop="ports"  align="center"/>
    <el-table-column align="center" fixed="right" label="操作" >
      <template #default="scope">
        <el-button plain size="large" type="danger" @click="delService(scope.row)">删除</el-button>
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

  <el-dialog v-model="dialogVisible" title="新建 Service">
    <el-input type="textarea" autosize v-model="newServiceData" placeholder="请输入新建 Service 的配置" style="margin-bottom: 10px"></el-input>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="createService">确 定</el-button>
    </span>
  </el-dialog>
</template>

<style scoped>

</style>