<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import { nextTick, ref, watch } from 'vue';
import AppDrawerHeaderSection from '@core/components/AppDrawerHeaderSection.vue';
import axios from '@axios';
import { toast } from 'vue3-toastify';
import { VOverlay, VProgressCircular } from 'vuetify/components';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },

  id: {
    required: true,
  },
});

const emit = defineEmits(['update:isDrawerOpen', 'fetchDatas']);
const isFetching = ref(false);
const isFetchingStart = ref(true);
const isFormValid = ref(false);
const refForm = ref();
const name_uz = ref();
const name_ru = ref();

// 👉 drawer close
const closeNavigationDrawer = (val = false) => {
  emit('update:isDrawerOpen', val);
  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};
const onSubmit = () => {
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      isFetching.value = true;
      try {
        let body = {
          name_uz: name_uz.value,
          name_ru: name_ru.value,
        };

        const response = await axios.patch(`/job_positions/${props.id}`, body);
        if (response.status == 200) {
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



const fetchDataById = async () => {
  isFetchingStart.value = true;
  try {
    const { data } = await axios.get(`/job_positions/${props.id}`);
    name_uz.value = data.name_uz;
    name_ru.value = data.name_ru;
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    isFetchingStart.value = false;
  }
};

watch(
  () => props.isDrawerOpen,
  (newVal) => newVal && fetchDataById(),
);
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="closeNavigationDrawer"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection title="Update Employee" @cancel="closeNavigationDrawer" />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->

          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
            :disabled="isFetching"
            v-if="!isFetchingStart"
          >
            <VRow>
              <VCol cols="12">
                <VTextField v-model="name_ru" :rules="[requiredValidator]" label="Title" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="name_uz" :rules="[requiredValidator]" label="Title" />
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

          <div v-if="isFetchingStart" class="d-flex h-screen align-center justify-center">
            <VProgressCircular color="primary" indeterminate></VProgressCircular>
          </div>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
