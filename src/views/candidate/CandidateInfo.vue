<script setup>
import axios from '@axios';
import { computed } from 'vue';
import { toast } from 'vue3-toastify';
import AccountImg from '@/assets/images/candidates/account.png';
import { requiredValidator } from '@validators';

const props = defineProps({
  candidateId: {
    required: true,
  },
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:isDrawerOpen, fetchDatas']);

const refForm = ref();
const isFetching = ref(false);
const isFetchingStart = ref(true);
const languages_list = ref([]);
const full_name = ref();
const phone_number = ref();
const age = ref();
const address = ref();
const gender = ref('man');
const positive_skills = ref();
const apps_text = ref();
const apps = ref();
const photo = ref();
const languages = ref([]);

const onFormCancel = () => {
  emit('update:isDrawerOpen', false);
  nextTick(() => {
    setTimeout(() => {
      refForm.value?.reset();
    }, 500);
  });
};

const onFormSubmit = () => {
  refForm.value.validate().then(async ({ valid }) => {
    if (valid) {
      isFetching.value = true;
      try {
        await axios.put(`/candidates/${props.candidateId}`, {
          full_name: full_name.value,
          age: age.value,
          apps_text: apps_text.value,
          apps: apps.value,
          gender: gender.value,
          phone_number: phone_number.value,
          address: address.value,
          positive_skills: positive_skills.value,
          languages: Array.from(languages.value),
        });

        toast('Успешно удалено', {
          theme: 'auto',
          type: 'success',
          dangerouslyHTMLString: true,
        });
        // Убедитесь, что fetchCandidates вызывается только после успешного обновления
        emit('fetchDatas');
        onFormCancel();
      } catch (error) {
        console.error('Ошибка при обновлении кандидата:', error);
      } finally {
        isFetching.value = false;
      }
    }
  });
};

const fetchData = async () => {
  try {
    isFetchingStart.value = true;

    let candidate = await axios.get('/candidates/' + props.candidateId);

    full_name.value = candidate.data.full_name;
    address.value = candidate.data.address;
    gender.value = candidate.data.gender_slug;
    age.value = candidate.data.age;
    phone_number.value = candidate.data.phone_number;
    positive_skills.value = candidate.data.positive_skills;
    apps.value = candidate.data.apps;
    photo.value = candidate.data.photo;
    apps_text.value = candidate.data.apps_text;

    languages.value = candidate.data.languages
      .split(',') // Разбиваем строку по запятой
      .filter(Boolean)
      .map(Number);
  } catch (error) {
    console.log('Ошибка', error);
  } finally {
    isFetchingStart.value = false;
  }
};

watch(
  () => props.candidateId,
  (newVal) => {
    if (newVal) fetchData();
  },
);

const candidatePhoto = computed(() => {
  if (photo.value) {
    return '';
  }
  return AccountImg;
});

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
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="props.isDrawerOpen"
    @update:model-value="(v) => emit('update:isDrawerOpen', v)"
  >
    <VCard class="pa-sm-9 pa-5">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn variant="text" size="small" @click="onFormCancel" />

      <VCardItem class="text-center">
        <VCardTitle class="text-h5">User Information </VCardTitle>
      </VCardItem>

      <!-- Loader -->
      <div v-if="isFetchingStart" class="d-flex h-screen align-center justify-center">
        <VProgressCircular color="primary" indeterminate></VProgressCircular>
      </div>

      <VCardText>
        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          ref="refForm"
          @submit.prevent="onFormSubmit"
          :disabled="isFetching"
          v-if="!isFetchingStart"
        >
          <VRow>
            <!-- 👉 Full Name -->
            <VCol cols="12">
              <VRow>
                <VCol cols="3">
                  <img
                    :src="candidatePhoto"
                    alt="avatar"
                    :style="{ width: '100%', borderRadius: '5px' }"
                  />
                </VCol>

                <VCol cols="9">
                  <VRow>
                    <VCol cols="6">
                      <VTextField
                        v-model="full_name"
                        :rules="[requiredValidator]"
                        label="Full name"
                      />
                    </VCol>

                    <VCol cols="6">
                      <VTextField
                        type="number"
                        v-model="age"
                        :rules="[requiredValidator]"
                        label="Age"
                      />
                    </VCol>
                    <VCol cols="6">
                      <VTextField
                        v-model="phone_number"
                        :rules="[requiredValidator]"
                        label="Phone number"
                      />
                    </VCol>

                    <VCol cols="6" class="d-flex align-center">
                      <VRadioGroup v-model="gender" inline :rules="[requiredValidator]">
                        <VRadio label="Man" value="man" density="compact" />
                        <VRadio label="Woman" value="woman" density="compact" />
                      </VRadioGroup>
                    </VCol>
                  </VRow>
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="6">
              <VTextField
                v-model="positive_skills"
                :rules="[requiredValidator]"
                label="Positive skills"
              />
            </VCol>

            <VCol cols="6">
              <VTextField v-model="apps_text" :rules="[requiredValidator]" label="Apps text" />
            </VCol>

            <VCol cols="6">
              <VTextField v-model="apps" :rules="[requiredValidator]" label="Apps" />
            </VCol>

            <VCol cols="6">
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
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn :loading="isFetching" :disabled="isFetching" type="submit"> Submit </VBtn>

              <VBtn color="secondary" variant="tonal" @click="onFormCancel"> Cancel </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
