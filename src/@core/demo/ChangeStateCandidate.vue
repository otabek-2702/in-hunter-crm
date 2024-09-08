<script setup>
import { ref } from 'vue';
import DialogCloseBtn from '@core/components/DialogCloseBtn.vue';

const props = defineProps(['id'])

const isDialogVisible = ref(false);
const comment = ref('');

const onCancel = () => {
  comment.value = ''
  isDialogVisible = false
}

const onBlock = () => {
  
  isDialogVisible = false
}

const onArchive = () => {
  
  isDialogVisible = false
}

const onNextState = () => {
  
  isDialogVisible = false
}

</script>

<template>
  <VDialog v-model="isDialogVisible" max-width="600">
    <!-- Dialog Activator -->
    <template #activator="{ props }">
      <VIcon
        v-bind="props"
        @click="
          (event) => {
            event.stopPropagation();
          }
        "
        size="30"
        icon="bx-comment"
      ></VIcon>
    </template>

    <!-- Dialog Content -->
    <VCard title="User Profile">
      {{props.id || 's'}}
      <DialogCloseBtn variant="text" size="small" @click="isDialogVisible = false" />

      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextarea label="Default" />
          </VCol>
          <VCol cols="3" class="px-1">
            <VBtn class="w-100" >
              Bekor qilish
              <VIcon  icon="bx-minus-circle" class="ml-1 mr-0"/>
            </VBtn>
          </VCol>
          <VCol cols="3" class="px-1">
            <VBtn class="w-100" color="error " >
              Bloklash
              <VIcon icon="bx-block" class="ml-1 mr-0"/>
            </VBtn>
          </VCol>
          <VCol cols="3" class="px-1">
            <VBtn class="w-100" color="secondary" >
              Arxivlash
              <VIcon  icon="bx-archive-in" class="ml-1 mr-0"/>
            </VBtn>
          </VCol>
          <VCol cols="3" class="px-1">
            <VBtn class="w-100" color="success" >
              Keyingi
              <VIcon  icon="bx-right-arrow-alt" class="ml-1 mr-0"/>
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <!-- <VCardText class="d-flex justify-end gap-2">
        <VBtn color="secondary" variant="tonal" @click="isDialogVisible = false"> Close </VBtn>
        <VBtn @click="isDialogVisible = false"> Save </VBtn>
      </VCardText> -->
    </VCard>
  </VDialog>
</template>
