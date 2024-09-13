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
  companies_list: { type: Array, required: true },
  job_positions_list: { type: Array, required: true },
});

const emit = defineEmits(['update:isDrawerOpen', 'fetchDatas']);

const isFetching = ref(false);
const isFormValid = ref(false);
const isValidLogin = ref(true);
const refForm = ref();
// const companies_list = ref([]);
const company_id = ref();
const job_position_id = ref();
const quantity = ref();
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
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      isFetching.value = true;
      try {
        const response = await axios.post('/vacancies', {
          company_id: company_id.value,
          job_position_id: job_position_id.value,
          quantity: quantity.value,
          description: description.value,
        });

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
    <AppDrawerHeaderSection title="Добавить новую вакансию" @cancel="closeNavigationDrawer" />

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
                <VSelect
                  v-model="company_id"
                  label="Select Company"
                  :items="props.companies_list"
                  item-title="title"
                  item-value="id"
                  clearable
                  clear-icon="bx-x"
                />
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="job_position_id"
                  label="Select Job"
                  :items="props.job_positions_list"
                  item-title="name_ru"
                  item-value="id"
                  clearable
                  clear-icon="bx-x"
                />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="quantity" label="Count" type="number" />
              </VCol>
              <VCol cols="12">
                <VTextarea v-model="description" label="Description" />
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
