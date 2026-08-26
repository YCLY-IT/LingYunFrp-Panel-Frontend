<template>
  <!-- 全局彩蛋组件集合 -->
  <KonamiEgg />
  <SearchEgg />
  <ConsoleEgg />
  <MidnightEgg />
  <CornerEgg />
  <KeyComboEgg />
</template>

<script setup lang="ts">
// 彩蛋组件（可以单独注释掉来禁用某个彩蛋）
import KonamiEgg from './eggs/EasterEgg.vue'
import SearchEgg from './eggs/SearchEgg.vue'
import ConsoleEgg from './eggs/ConsoleEgg.vue'
import MidnightEgg from './eggs/MidnightEgg.vue'
import CornerEgg from './eggs/CornerEgg.vue'
import KeyComboEgg from './eggs/KeyComboEgg.vue'
</script>
