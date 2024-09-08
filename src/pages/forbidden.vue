<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import pageUnderMaintenance from '@images/pages/misc-under-maintenance.png'
import ErrorHeader from "@core/components/ErrorHeader.vue";

const pageMiscError = useGenerateImageVariant(pageUnderMaintenance, pageUnderMaintenance)
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      error-title="Forbidden ⚠️"
      error-description="Oops! 😖 The requested URL was forbidden."
    />

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="pageMiscError"
        alt="Coming Soon"
        :max-width="500"
        class="mx-auto"
      />
      <VBtn
        to="/"
        class="mt-10"
      >
        Back to Home
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>


