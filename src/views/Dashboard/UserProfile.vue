<script setup lang="ts">

import Realname from "../Dashboard/Realname.vue";
import UserInfo from "@/components/UserInfo.vue";
</script>

<template>
  <div class="user-profile">
    <n-card title="用户信息">
        <UserInfo />
    </n-card>
    <n-card title="实人认证">
        <Realname />
    </n-card>
  </div>
</template>

<style scoped lang="scss">
  .n-card {
    margin-top: 20px;
  }
</style>