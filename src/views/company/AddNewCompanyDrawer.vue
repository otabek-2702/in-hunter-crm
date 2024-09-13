<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import { requiredValidator } from '@validators';
import { nextTick, ref, watchEffect } from 'vue';
import AppDrawerHeaderSection from '@core/components/AppDrawerHeaderSection.vue';
import axios from '@axios';
import { toast } from 'vue3-toastify';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:isDrawerOpen', 'fetchDatas']);

const isFetching = ref(false);
const isFormValid = ref(false);
const refForm = ref();
const title = ref();
const phone_number = ref();
const description = ref();

// 👉 drawer close
const closeNavigationDrawer = () => {
  nextTick(() => {
    emit('update:isDrawerOpen', false);
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

const onSubmit = () => {
  isFetching.value = true;
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        const response = await axios.post('/companies', {
          title: title.value,
          phone_number: phone_number.value,
          description: description.value,
        });

        if (response.status == 201) {
          toast('Успешно', {
            theme: 'auto',
            type: 'success',
            dangerouslyHTMLString: true,
          });
          emit('fetchDatas');

          closeNavigationDrawer();
        }
      } catch (error) {
        console.error('Ошибка:', error);
      } finally {
        isFetching.value = false;
      }
    }
  });
};

const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val);
  if (!val) {
    nextTick(() => {
      refForm.value?.reset();
      refForm.value?.resetValidation();
    });
  }
};
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection title="Add Company" @cancel="closeNavigationDrawer" />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->

          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
            :disabled="isFetching"
          >
            <VRow>
              <VCol cols="12">
                <VTextField v-model="title" :rules="[requiredValidator]" label="Title" />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="phone_number"
                  :rules="[requiredValidator]"
                  label="Phone number"
                />
              </VCol>
              <VCol cols="12">
                <VTextarea label="Description" v-model="description" />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn :loading="isFetching" :disabled="isFetching" type="submit" class="me-3">
                  Submit
                </VBtn>
                <VBtn type="reset" variant="tonal" color="secondary" @click="closeNavigationDrawer">
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
