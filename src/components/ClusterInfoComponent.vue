<script setup>
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

class Queue {
  constructor() {
    this.queue = []
  }

  // ��Ӳ���
  enqueue(element) {
    this.queue.push(element)
  }

  // ���Ӳ���
  dequeue() {
    if (this.isEmpty()) {
      return '����Ϊ��'
    }
    return this.queue.shift()
  }

  // �鿴����Ԫ��
  peek() {
    if (this.isEmpty()) {
      return '����Ϊ��'
    }
    return this.queue[0]
  }

  // �������Ƿ�Ϊ��
  isEmpty() {
    return this.queue.length === 0
  }

  // ��ȡ���д�С
  size() {
    return this.queue.length
  }

  toArray() {
    return this.queue.slice() // ʹ�� slice ����������
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
    ElMessage({
      message: '获取集群信息失败',
      type: 'error',
      duration: 2000
    })
    // console.error(err)
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


// ����
const NodeCPUChartData = ref([])

// ��ȡ���ݲ���� nodeMetrics ͼ��
const initNodeCPUChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
    NodeCPUChartData.value = response.data.nodeMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
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

  // ȷ�� dataTime �� dataNodeCPU �����Ѿ�����䲢��������
  const timeData = dataTime.toArray().map(time => String(time)) // ȷ��ת��Ϊ�ַ�������
  const cpuData = dataNodeCPU.toArray() // ֱ��ʹ��toArray���

  const option = {
    title: { text: 'nodeCPU Usage' },
    xAxis: { type: 'category', data: timeData },
    yAxis: { type: 'value', name: 'CPU (ms)' },
    series: [{
      name: 'CPU Usage',
      type: 'line',
      data: cpuData, // ������� cpuData ��һ����ֵ����
      areaStyle: {}
    }]
  }

  nodeCPUChart.setOption(option)
}

const NodeMemoryChartData = ref([])

// ��ȡ���ݲ���� nodeMetrics ͼ��
const initNodeMemoryChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
    NodeMemoryChartData.value = response.data.nodeMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
    // console.log(NodeCPUChartData.value);
    // console.log(NodeCPUChartData.value.map(data => data.name));
    renderNodeMemoryChart()
  } catch (error) {
    console.error('Error fetching NodeCPUChartData data:', error)
  }
}

// ��Ⱦ nodeMetrics ͼ��
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
      data: dataTime.toArray() // �������ݸ�ʽΪ { time: '21:12', value: 0.1 }��������ȡʱ����Ϊ X ������
    },
    yAxis: {
      type: 'value',
      name: 'Memory (ms)'
    },
    series: [{
      data: dataNodeMemory.toArray(), // ��ȡ nodeMetrics ʹ������Ϊ Y ������
      type: 'line',
      areaStyle: {}
    }]
  }
  nodeMemoryChart.setOption(option)
}

// ����
const PodCPUChartData = ref([])

// ��ȡ���ݲ���� nodeMetrics ͼ��
const initPodCPUChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
    PodCPUChartData.value = response.data.podMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
    // console.log(NodeCPUChartData.value);
    // console.log(NodeCPUChartData.value.map(data => data.name));
    renderPodCPUChart()
  } catch (error) {
    console.error('Error fetching NodeCPUChartData data:', error)
  }
}

// ��Ⱦ podMetrics ͼ��
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
      data: dataTime.toArray() // �������ݸ�ʽΪ { time: '21:12', value: 0.1 }��������ȡʱ����Ϊ X ������
    },
    yAxis: {
      type: 'value',
      name: 'CPU (ms)'
    },
    series: [{
      data: dataPodCPU.toArray(), // ��ȡ nodeMetrics ʹ������Ϊ Y ������
      type: 'line',
      areaStyle: {}
    }]
  }
  podCPUChart.setOption(option)
}

// ����
const PodMemoryChartData = ref([])

// ��ȡ���ݲ���� nodeMetrics ͼ��
const initPodMemoryChart = async () => {
  try {
    const response = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
    PodMemoryChartData.value = response.data.podMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
    // console.log(NodeCPUChartData.value);
    // console.log(NodeCPUChartData.value.map(data => data.name));
    renderPodMemoryChart()
  } catch (error) {
    console.error('Error fetching NodeCPUChartData data:', error)
  }
}

// ��Ⱦ PodMetrics ͼ��
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
      data: dataTime.toArray() // �������ݸ�ʽΪ { time: '21:12', value: 0.1 }��������ȡʱ����Ϊ X ������
    },
    yAxis: {
      type: 'value',
      name: 'CPU (ms)'
    },
    series: [{
      data: dataPodMemory.toArray(), // ��ȡ nodeMetrics ʹ������Ϊ Y ������
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
  await fetchData()
  const now = new Date() // ��ȡ��ǰʱ��
  // const timestamp = now.getTime(); // ת��Ϊʱ���
// ��ȡСʱ�ͷ���
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
// ��ʽ��Сʱ�ͷ������
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  console.log(`Current time: ${formattedTime}`)

  if (dataTime.size() < 5) {
    dataTime.enqueue(formattedTime)
  } else {
    dataTime.dequeue()
    dataTime.enqueue(formattedTime)
  }
  //dataNodeCPU
  const responseCPU = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
  NodeCPUChartData.value = responseCPU.data.nodeMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
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
  const responseMemory = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
  NodeCPUChartData.value = responseMemory.data.nodeMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
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
  const responseDataPodCPU = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
  NodeCPUChartData.value = responseDataPodCPU.data.nodeMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
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
  const responseDataPodMemory = await axios.get('/cluster-load') // �ӷ�������ȡ nodeMetrics ���ݵ�ʾ���˵�
  NodeCPUChartData.value = responseDataPodMemory.data.nodeMetrics // ������������ص����ݸ�ʽ����ȷ�ģ�����ֱ�ӽ����ݸ�ֵ�� ref
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

let intervalId // ����һ���������ڱ��涨ʱ����ID
onMounted(() => {
  // fetchData()
  // ÿ��5�����һ��refreshPageAndLogTimestamp����
  // ȷ�����淵�صĶ�ʱ��ID
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
    <!-- ��һ�� -->
    <div id="nodeMetrics-chart-cpu" class="chart "></div>
    <div id="podMetrics-chart-cpu" class="chart "></div>
    <div id="nodeMetrics-chart-memory" class="chart "></div>
    <div id="podMetrics-chart-memory" class="chart "></div>
    <!-- �ڶ��� -->
    <div id="pods-chart" class="chart"></div>
    <div id="nodes-chart" class="chart"></div>
    <div id="deployments-chart" class="chart"></div>
    <div id="services-chart" class="chart"></div>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* �������У�ÿ�п����� */
  grid-template-rows: 1fr 1fr; /* �������У���һ�и߶��Զ��������ڶ��и߶���� */
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

/*!* ����ͼ������ *!*/
/*.col-2 {*/
/*  grid-column: span 2;*/
/*}*/
</style>

