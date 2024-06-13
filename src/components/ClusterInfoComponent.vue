<script setup>
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'

class Queue {
  constructor() {
    this.queue = []
  }

  // 入队操作
  enqueue(element) {
    this.queue.push(element)
  }

  // 出队操作
  dequeue() {
    if (this.isEmpty()) {
      return '队列为空'
    }
    return this.queue.shift()
  }

  // 查看队首元素
  peek() {
    if (this.isEmpty()) {
      return '队列为空'
    }
    return this.queue[0]
  }

  // 检查队列是否为空
  isEmpty() {
    return this.queue.length === 0
  }

  // 获取队列大小
  size() {
    return this.queue.length
  }

  toArray() {
    return this.queue.slice() // 使用 slice 来复制数组
  }
}

const k8sData = {
  pods: {},
  nodes: {},
  deployments: {},
  services: {}
}

const fetchData = async () => {
  try {
    const res = await axios.get('/cluster-info')
    const data = res.data

    const countStatus = (items) => {
      const result = {}
      items.forEach(item => {
        if (result[item.status]) {
          result[item.status] += 1
        } else {
          result[item.status] = 1
        }
      })
      return result
    }

    k8sData.pods = countStatus(data.pods.items)
    k8sData.nodes = countStatus(data.nodes.items)
    k8sData.services = countStatus(data.services.items)
    k8sData.deployments = countStatus(data.deployments.items)

    createChart('pods-chart', 'Pods', k8sData.pods)
    createChart('nodes-chart', 'Nodes', k8sData.nodes)
    createChart('deployments-chart', 'Deployments', k8sData.deployments)
    createChart('services-chart', 'Services', k8sData.services)


  } catch (err) {
    console.error(err)
  }
}

const createChart = (id, title, data) => {
  const chartDom = document.getElementById(id)
  if (!chartDom) return
  const myChart = echarts.init(chartDom)
  const colors = {
    Running: 'green',
    Pending: 'yellow',
    Failed: 'red',
    Available: 'green',
    Unavailable: 'red',
    True: 'green',
    False: 'red',
    ClusterIP: 'green',
    NodePort: 'yellow',
    LoadBalancer: 'red'
  }

  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      bottom: 'bottom'
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(data).map(([key, value]) => ({
          name: key, value, itemStyle: { color: colors[key] || 'grey' }
        }))
      }
    ]
  }
  myChart.setOption(option)
}


// 数据
const NodeCPUChartData = ref([])

// 获取数据并填充 nodeMetrics 图表
const initNodeCPUChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
    NodeCPUChartData.value = response.data.nodeMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
    // console.log(NodeCPUChartData.value);
    // console.log(NodeCPUChartData.value.map(data => data.name));
    renderNodeCPUChart()
  } catch (error) {
    console.error('Error fetching NodeCPUChartData data:', error)
  }
}

const renderNodeCPUChart = () => {
  const chartDomNodeCPU = document.getElementById('nodeMetrics-chart-cpu')
  if (!chartDomNodeCPU) return
  const nodeCPUChart = echarts.init(chartDomNodeCPU)

  // 确保 dataTime 和 dataNodeCPU 队列已经被填充并且有数据
  const timeData = dataTime.toArray().map(time => String(time)) // 确保转换为字符串数组
  const cpuData = dataNodeCPU.toArray() // 直接使用toArray结果

  const option = {
    title: { text: 'nodeCPU Usage' },
    xAxis: { type: 'category', data: timeData },
    yAxis: { type: 'value', name: 'CPU (ms)' },
    series: [{
      name: 'CPU Usage',
      type: 'line',
      data: cpuData, // 这里假设 cpuData 是一个数值数组
      areaStyle: {}
    }]
  }

  nodeCPUChart.setOption(option)
}

const NodeMemoryChartData = ref([])

// 获取数据并填充 nodeMetrics 图表
const initNodeMemoryChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
    NodeMemoryChartData.value = response.data.nodeMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
    // console.log(NodeCPUChartData.value);
    // console.log(NodeCPUChartData.value.map(data => data.name));
    renderNodeMemoryChart()
  } catch (error) {
    console.error('Error fetching NodeCPUChartData data:', error)
  }
}

// 渲染 nodeMetrics 图表
const renderNodeMemoryChart = () => {
  // console.log("NodeCPUChartData.value");
  const chartDomNodeMemory = document.getElementById('nodeMetrics-chart-memory')
  if (!chartDomNodeMemory) return
  const nodeMemoryChart = echarts.init(chartDomNodeMemory)
  const option = {
    title: {
      text: 'nodeMemory Usage'
    },
    xAxis: {
      type: 'category',
      data: dataTime.toArray() // 假设数据格式为 { time: '21:12', value: 0.1 }，这里提取时间作为 X 轴数据
    },
    yAxis: {
      type: 'value',
      name: 'Memory (ms)'
    },
    series: [{
      data: dataNodeMemory.toArray(), // 提取 nodeMetrics 使用率作为 Y 轴数据
      type: 'line',
      areaStyle: {}
    }]
  }
  nodeMemoryChart.setOption(option)
}

// 数据
const PodCPUChartData = ref([])

// 获取数据并填充 nodeMetrics 图表
const initPodCPUChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
    PodCPUChartData.value = response.data.podMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
    // console.log(NodeCPUChartData.value);
    // console.log(NodeCPUChartData.value.map(data => data.name));
    renderPodCPUChart()
  } catch (error) {
    console.error('Error fetching NodeCPUChartData data:', error)
  }
}

// 渲染 podMetrics 图表
const renderPodCPUChart = () => {
  // console.log("NodeCPUChartData.value");
  const chartDomPodCPU = document.getElementById('podMetrics-chart-cpu')
  if (!chartDomPodCPU) return
  const podCPUChart = echarts.init(chartDomPodCPU)
  const option = {
    title: {
      text: 'podCPU Usage'
    },
    xAxis: {
      type: 'category',
      data: dataTime.toArray() // 假设数据格式为 { time: '21:12', value: 0.1 }，这里提取时间作为 X 轴数据
    },
    yAxis: {
      type: 'value',
      name: 'CPU (ms)'
    },
    series: [{
      data: dataPodCPU.toArray(), // 提取 nodeMetrics 使用率作为 Y 轴数据
      type: 'line',
      areaStyle: {}
    }]
  }
  podCPUChart.setOption(option)
}

// 数据
const PodMemoryChartData = ref([])

// 获取数据并填充 nodeMetrics 图表
const initPodMemoryChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
    PodMemoryChartData.value = response.data.podMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
    // console.log(NodeCPUChartData.value);
    // console.log(NodeCPUChartData.value.map(data => data.name));
    renderPodMemoryChart()
  } catch (error) {
    console.error('Error fetching NodeCPUChartData data:', error)
  }
}

// 渲染 PodMetrics 图表
const renderPodMemoryChart = () => {
  // console.log("NodeCPUChartData.value");
  const chartDomPodMemory = document.getElementById('podMetrics-chart-memory')
  if (!chartDomPodMemory) return
  const podMemoryChart = echarts.init(chartDomPodMemory)
  const option = {
    title: {
      text: 'podMemory Usage'
    },
    xAxis: {
      type: 'category',
      data: dataTime.toArray() // 假设数据格式为 { time: '21:12', value: 0.1 }，这里提取时间作为 X 轴数据
    },
    yAxis: {
      type: 'value',
      name: 'CPU (ms)'
    },
    series: [{
      data: dataPodMemory.toArray(), // 提取 nodeMetrics 使用率作为 Y 轴数据
      type: 'line',
      areaStyle: {}
    }]
  }
  podMemoryChart.setOption(option)
}

const dataNodeCPU = new Queue()
const dataNodeMemory = new Queue()
const dataPodCPU = new Queue()
const dataPodMemory = new Queue()
const dataTime = new Queue()

const refreshPageAndLogTimestamp = async () => {
  await fetchData();
  const now = new Date() // 获取当前时间
  // const timestamp = now.getTime(); // 转换为时间戳
// 获取小时和分钟
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
// 格式化小时和分钟输出
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  console.log(`Current time: ${formattedTime}`)

  if (dataTime.size() < 5) {
    dataTime.enqueue(formattedTime)
  } else {
    dataTime.dequeue()
    dataTime.enqueue(formattedTime)
  }
  //dataNodeCPU
  const responseCPU = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
  NodeCPUChartData.value = responseCPU.data.nodeMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
  const totalCPU = NodeCPUChartData.value.reduce((total, node) => {
    return total + parseInt(node.cpu, 10)
  }, 0)
  if (dataNodeCPU.size() < 5) {
    dataNodeCPU.enqueue(totalCPU / 1e6)
  } else {
    dataNodeCPU.dequeue()
    dataNodeCPU.enqueue(totalCPU / 1e6)
  }

  //dataNodeMemory
  const responseMemory = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
  NodeCPUChartData.value = responseMemory.data.nodeMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
  const totalMemory = NodeCPUChartData.value.reduce((total, node) => {
    return total + parseInt(node.memory, 10)
  }, 0)
  console.log(totalCPU / 1024)
  if (dataNodeMemory.size() < 5) {
    dataNodeMemory.enqueue(totalMemory / 1024)
  } else {
    dataNodeMemory.dequeue()
    dataNodeMemory.enqueue(totalMemory / 1024)
  }

  //dataPodCPU
  const responseDataPodCPU = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
  NodeCPUChartData.value = responseDataPodCPU.data.nodeMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
  const totalDataPodCPU = PodCPUChartData.value.reduce((total, node) => {
    return total + parseInt(node.cpu, 10)
  }, 0)
  console.log(totalDataPodCPU / 1e6)
  if (dataPodCPU.size() < 5) {
    dataPodCPU.enqueue(totalDataPodCPU / 1e6)
  } else {
    dataPodCPU.dequeue()
    dataPodCPU.enqueue(totalDataPodCPU / 1e6)
  }

  //dataPodCPU
  const responseDataPodMemory = await axios.get('/cluster-load') // 从服务器获取 nodeMetrics 数据的示例端点
  NodeCPUChartData.value = responseDataPodMemory.data.nodeMetrics // 假设服务器返回的数据格式是正确的，这里直接将数据赋值给 ref
  const totalDataPodMemory = PodCPUChartData.value.reduce((total, node) => {
    return total + parseInt(node.memory, 10)
  }, 0)
  console.log(totalDataPodMemory / 1e6)
  if (dataPodMemory.size() < 5) {
    dataPodMemory.enqueue(totalDataPodMemory / 1e6)
  } else {
    dataPodMemory.dequeue()
    dataPodMemory.enqueue(totalDataPodMemory / 1e6)
  }

  await initNodeCPUChart()
  await initNodeMemoryChart()
  await initPodCPUChart()
  await initPodMemoryChart()
}

let intervalId // 声明一个变量用于保存定时器的ID
onMounted(() => {
  // fetchData()
  // 每隔5秒调用一次refreshPageAndLogTimestamp函数
  // 确保保存返回的定时器ID
  refreshPageAndLogTimestamp()
  intervalId = setInterval(async () => {
    await refreshPageAndLogTimestamp()
  }, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="container">
    <!-- 第一行 -->
    <div id="nodeMetrics-chart-cpu" class="chart "></div>
    <div id="podMetrics-chart-cpu" class="chart "></div>
    <div id="nodeMetrics-chart-memory" class="chart "></div>
    <div id="podMetrics-chart-memory" class="chart "></div>
    <!-- 第二行 -->
    <div id="pods-chart" class="chart"></div>
    <div id="nodes-chart" class="chart"></div>
    <div id="deployments-chart" class="chart"></div>
    <div id="services-chart" class="chart"></div>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 定义四列，每列宽度相等 */
  grid-template-rows: 1fr 1fr; /* 定义两行，第一行高度自动调整，第二行高度相等 */
  width: 100vw;
  height: 90vh;
  gap: 0;
  justify-items: stretch;
  align-items: stretch;
}

.chart {
  width: 100%;
  height: 100%;
}

/*!* 控制图表列数 *!*/
/*.col-2 {*/
/*  grid-column: span 2;*/
/*}*/
</style>

