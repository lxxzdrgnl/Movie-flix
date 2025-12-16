<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: ''
})
</script>

<template>
  <div class="loading-container">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ text || t('loading') }}</p>
    </div>
  </div>
</template>

<style scoped>
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
