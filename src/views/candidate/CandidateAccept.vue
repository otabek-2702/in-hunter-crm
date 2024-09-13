<script setup>
import { ref, watchEffect } from 'vue';
import axios from '@axios';
import DialogCloseBtn from '@core/components/DialogCloseBtn.vue';
import { computed } from 'vue';
import { toast } from 'vue3-toastify';
import { watch } from 'vue';

const props = defineProps({
  id: {
    type: [String, Number], // Указываем допустимые типы данных
    required: true, // Делаем обязательным
  },
});

const emit = defineEmits(['fetchDatas']);

const isDialogVisible = ref(false);
const isFetching = ref(false);
const comment = ref();
const selectedCompany = ref();
const selectedVacancy = ref();

const onFormCancel = () => {
  isDialogVisible = false;
};

const onSubmit = async () => {
  isFetching.value = true;
  try {
    await axios.post(`/candidates/${props.id}/update_state/accept`, {
      vacancy_id: selectedVacancy.value,
      company_id: selectedCompany.value,
      comment: comment.value,
    });

    toast('Успешно обновлено', {
      theme: 'auto',
      type: 'success',
      dangerouslyHTMLString: true,
    });
    comment.value = '';
    isDialogVisible.value = false;
  } catch (error) {
    console.error('Ошибка :', error);
  } finally {
    isFetching.value = false;
  }
};

const companies_list = ref([]);

const fetchCompanies = async () => {
  try {
    const response = await axios.get('/companies');
    companies_list.value = await response.data.companies;
  } catch (error) {
    console.error('Ошибка :', error);
  }
};
watchEffect(fetchCompanies);

const vacancies_list = ref([]);

const fetchVacancies = async () => {
  try {
    const response = await axios.get(`/vacancies?company_id=${selectedCompany.value}`);
    vacancies_list.value = await response.data.vacancies.map((el) => ({
      id: el.id,
      job_position_name_ru: el.job_position.name_ru,
    }));
  } catch (error) {
    console.error('Ошибка :', error);
  }
};
watch(selectedCompany, (newVal) => {
  if (newVal) fetchVacancies();
});
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
      <DialogCloseBtn variant="text" size="small" @click="onFormCancel" />

      <VCardText>
        <VRow class="justify-center">
          <VCol cols="12">
            <VTextarea label="Comment" v-model="comment" />
          </VCol>
          <VCol cols="6">
            <VSelect
              v-model="selectedCompany"
              label="Select Company"
              :items="companies_list"
              item-title="title"
              item-value="id"
              clearable
              clear-icon="bx-x"
            />
          </VCol>
          <VCol cols="6">
            <VSelect
              v-if="vacancies_list.length"
              v-model="selectedVacancy"
              label="Select Vacancy"
              :items="vacancies_list"
              item-title="job_position_name_ru"
              item-value="id"
              clearable
              clear-icon="bx-x"
            />
          </VCol>
          <!-- 👉 Submit and Cancel -->
          <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
            <VBtn @click="onSubmit" :loading="isFetching" :disabled="isFetching"> Submit </VBtn>

            <VBtn color="secondary" variant="tonal" @click="onFormCancel"> Cancel </VBtn>
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
