<script setup>
import { ref } from 'vue';

import ClusterInfo from "@/components/ClusterInfoComponent.vue";
import Pod from '@/components/PodManagementComponent.vue'
import Deployment from '@/components/DeploymentManagementComponent.vue'
import Service from '@/components/ServiceManagementComponent.vue'
import ConfigMap from '@/components/ConfigMapManagementComponent.vue'
const activeName = ref('info');

const handleClick = (tab) => {
  console.log(tab);
};
</script>

<template>
  <el-tabs v-model="activeName" class="left-top-tabs" @tab-click="handleClick">
    <el-tab-pane label="资源概览" name="info"><ClusterInfo/></el-tab-pane>
    <el-tab-pane label="Pod管理" name="pod"><Pod/></el-tab-pane>
    <el-tab-pane label="Deployment管理" name="deployment"><Deployment/></el-tab-pane>
    <el-tab-pane label="Service管理" name="service"><Service/></el-tab-pane>
    <el-tab-pane label="ConfigMap管理" name="configMap"><ConfigMap/></el-tab-pane>
  </el-tabs>
</template>

<style scoped>

</style>
