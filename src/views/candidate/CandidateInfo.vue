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
const itemData = ref();

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

const fetchData = async () => {
  try {
    isFetchingStart.value = true;

    let candidate = await axios.get('/candidates/' + props.candidateId);

    itemData.value = await candidate.data;

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

// // Format the birthday input
// const formatBirthday = (value) => {
//   const digits = value.replace(/\D/g, '');

//   // If user is deleting and has less than 2 digits, return an empty string
//   if (digits.length < 2) return '';

//   let formatted = '';
//   if (digits.length <= 2) {
//     formatted = digits; // Only day
//   } else if (digits.length <= 4) {
//     formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`; // DD.MM
//   } else if (digits.length <= 8) {
//     formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`; // DD.MM.YYYY
//   } else {
//     formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`; // Keep it as DD.MM.YYYY for longer inputs
//   }

//   // Remove any trailing dot if not followed by a valid digit
//   if (formatted.endsWith('.') && formatted.length > 3) {
//     formatted = formatted.slice(0, -1);
//   }

//   return formatted;
// };

// // Handle input event to update the birthday
// const onInput = (e) => {
//   // Get the current value from the input
//   const value = e.target.value;
//   // Format the value
//   const formattedValue = formatBirthday(value);
//   // Update the birthday ref
//   birthday.value = formattedValue;
// };

// // Validate the birthday
// const validateBirthday = (value) => {
//   const parts = value.split('.');

//   if (parts.length !== 3) {
//     return 'Некорректный формат даты. Используйте DD.MM.YYYY.';
//   }

//   const day = parseInt(parts[0], 10);
//   const month = parseInt(parts[1], 10);
//   const year = parts[2];

//   // Validate day
//   if (isNaN(day) || day < 1 || day > 31) {
//     return 'Некорректный день. Должен быть от 01 до 31.';
//   }

//   // Validate month
//   if (isNaN(month) || month < 1 || month > 12) {
//     return 'Некорректный месяц. Должен быть от 01 до 12.';
//   }

//   // Validate year
//   const yearPrefix = year.slice(0, 2);
//   if (!/^(19|20)\d{2}$/.test(year) || year.length !== 4) {
//     return 'Некорректный год. Должен начинаться с 19 или 20.';
//   }

//   // Additional check for days in month (e.g., February)
//   if (month === 2 && day > 29) {
//     return 'Некорректный день для февраля.';
//   }

//   // Check for months with 30 days
//   if ([4, 6, 9, 11].includes(month) && day > 30) {
//     return 'Некорректный день для этого месяца.';
//   }

//   // If all validations pass
//   return true;
// };

const languages_label = computed(() => {
  const newArr = [];
  if (languages && languages_list) {
    languages.value?.map((n) => newArr.push(languages_list.value[n - 1].name_ru));

    return newArr?.join(', ');
  }
  return '';
});
</script>


<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="props.isDrawerOpen"
    @update:model-value="(v) => emit('update:isDrawerOpen', v)"
  >
    <VCard class="pa-sm-9 pa-5">
      <!-- Close button -->
      <DialogCloseBtn variant="text" size="small" @click="onFormCancel" />

      <VCardItem class="text-center">
        <VCardTitle class="text-h5">Информация о пользователе</VCardTitle>
      </VCardItem>

      <!-- Loader -->
      <div v-if="isFetchingStart" class="d-flex h-screen align-center justify-center">
        <VProgressCircular color="primary" indeterminate></VProgressCircular>
      </div>

      <VCardText v-if="!isFetchingStart">
        <!-- Form -->
        <VForm ref="refForm" @submit.prevent="onFormSubmit" :disabled="isFetching">
          <VRow>
            <!-- Candidate Image -->
            <VCol cols="3">
              <img
                :src="candidatePhoto"
                alt="аватар"
                :style="{ width: '100%', borderRadius: '5px' }"
              />
            </VCol>

            <VCol cols="9">
              <VListItem>
                <VListItemTitle>
                  <span style="font-weight: 700; margin-inline-end: 4px">Полное имя:</span>
                  <span style="font-weight: 400">{{ itemData.full_name }}</span>
                </VListItemTitle>
              </VListItem>

              <VListItem>
                <VListItemTitle>
                  <span style="font-weight: 700; margin-inline-end: 4px">Возраст:</span>
                  <span style="font-weight: 400">{{ itemData.age }}</span>
                </VListItemTitle>
              </VListItem>

              <VListItem>
                <VListItemTitle>
                  <span style="font-weight: 700; margin-inline-end: 4px">Ден рождения:</span>
                  <span style="font-weight: 400">{{ itemData.birthday }}</span>
                </VListItemTitle>
              </VListItem>

              <VListItem>
                <VListItemTitle>
                  <span style="font-weight: 700; margin-inline-end: 4px">Пол:</span>
                  <span style="font-weight: 400">{{ itemData.gender === 'man' ? 'Мужчина' : 'Женщина' }}</span>
                </VListItemTitle>
              </VListItem>
            </VCol>
          </VRow>

          <!-- Candidate Details -->
          <VRow>
            <VCol cols="6">
              <VRow>
                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Позитивные навыки:</span>
                    <span style="font-weight: 400">{{ itemData.positive_skills }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Платформы:</span>
                    <span style="font-weight: 400">{{ itemData.apps_text }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Программы:</span>
                    <span style="font-weight: 400">{{ itemData.apps }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Номер телефона:</span>
                    <span style="font-weight: 400">{{ itemData.phone_number }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Языки:</span>
                    <span style="font-weight: 400">{{ languages_label }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Add source:</span>
                    <span style="font-weight: 400">{{ itemData.add_source }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Last works:</span>
                    <span style="font-weight: 400">{{ itemData.last_work }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">Marital state:</span>
                    <span style="font-weight: 400">{{ itemData.marital_state }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span style="font-weight: 700; margin-inline-end: 4px">University:</span>
                    <span style="font-weight: 400">{{ itemData.university_place }}</span>
                  </VListItemTitle>
                </VListItem>
              </VRow>
            </VCol>

            <VCol cols="6"></VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

