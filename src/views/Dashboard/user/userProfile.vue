<script setup lang="ts">
import Realname from "@/views/Dashboard/user/realName.vue";
import UserInfo from "@/components/UserInfo.vue";
import { NCard } from "naive-ui";
</script>

<template>
  <div class="user-profile">
    <NCard title="用户信息">
        <UserInfo />
    </NCard>
    <NCard title="实人认证">
        <Realname />
    </NCard>
  </div>
</template>

<style scoped lang="scss">
  .n-card {
    margin-top: 20px;
  }
</style>