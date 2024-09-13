<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import { requiredValidator } from '@validators';
import { nextTick, ref, watchEffect } from 'vue';
import AppDrawerHeaderSection from '@core/components/AppDrawerHeaderSection.vue';
import axios from '@axios';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

const languages_list = ref([]);

const emit = defineEmits(['update:isDrawerOpen', 'fetchDatas']);

const isFetching = ref(false);
const isFormValid = ref(false);
const refForm = ref();
const full_name = ref();
const phone_number = ref();
const age = ref();
const address = ref();
const gender = ref('man');
const positive_skills = ref();
const apps_text = ref();
const apps = ref();
const languages = ref();

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false);
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
        await axios.post('/candidates', {
          full_name: full_name.value,
          age: age.value,
          languages: Array.from(languages.value),
          positive_skills: positive_skills.value,
          apps_text: apps_text.value,
          apps: apps.value,
          gender: gender.value,
          phone_number: phone_number.value,
          address: address.value,
        });
        emit('fetchDatas');
        emit('update:isDrawerOpen', false);
        nextTick(() => {
          refForm.value?.reset();
          refForm.value?.resetValidation();
        });
      } catch (error) {
        console.error(error);
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

const fetchLanguages = async function () {
  try {
    const response = await axios.get('/languages');
    languages_list.value = response.data;
  } catch (error) {
    console.error('Ошибка :', error);
  }
};

watchEffect(fetchLanguages);
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
    <AppDrawerHeaderSection title="Add Candidate" @cancel="closeNavigationDrawer" />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- 👉 Full name -->
              <VCol cols="12">
                <VTextField v-model="full_name" :rules="[requiredValidator]" label="Full name" />
              </VCol>

              <!-- 👉 Full name -->
              <VCol cols="12">
                <VTextField
                  v-model="phone_number"
                  :rules="[requiredValidator]"
                  label="Phone number"
                />
              </VCol>
              <VCol cols="12">
                <VTextField type="number" v-model="age" :rules="[requiredValidator]" label="Age" />
              </VCol>
              <VCol cols="12">
                <VTextField v-model="address" :rules="[requiredValidator]" label="Address" />
              </VCol>

              <VCol cols="12">
                <VRadioGroup v-model="gender" inline :rules="[requiredValidator]">
                  <VRadio label="Man" value="man" density="compact" />
                  <VRadio label="Woman" value="woman" density="compact" />
                </VRadioGroup>
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="positive_skills"
                  :rules="[requiredValidator]"
                  label="Positive skills"
                />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="apps_text" :rules="[requiredValidator]" label="Apps text" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="apps" :rules="[requiredValidator]" label="Apps" />
              </VCol>

              <VCol cols="12">
                <VSelect
                  multiple
                  persistent-hint
                  v-model="languages"
                  label="Select language"
                  :rules="[requiredValidator]"
                  :items="languages_list"
                  item-title="name_ru"
                  item-value="id"
                />
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
