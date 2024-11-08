<script setup>
import axios from "@axios";
import { computed, nextTick } from "vue";
import { toast } from "vue3-toastify";
import AccountImg from "@/assets/images/candidates/account.png";
import html2pdf from "html-to-pdf-js";
import { transformPhoneNumber } from "@/helpers";

const props = defineProps({
  candidateId: {
    required: true,
  },
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:isDrawerOpen"]);

const refForm = ref();
const isFetching = ref(false);
const isFetchingStart = ref(true);
const languages_list = ref([]);
const states_list = ref([]);
const users_list = ref([]);
const itemData = ref();

const photo = ref();
const languages = ref([]);

const onFormCancel = () => {
  emit("update:isDrawerOpen", false);
  nextTick(() => {
    setTimeout(() => {
      refForm.value?.reset();
    }, 500);
  });
};

const fetchData = async () => {
  try {
    isFetchingStart.value = true;

    let candidate = await axios.get("/candidates/" + props.candidateId);

    itemData.value = await candidate.data;

    languages.value = candidate.data.languages
      .split(",") // Разбиваем строку по запятой
      .filter(Boolean)
      .map(Number);
  } catch (error) {
    console.log("Ошибка", error);
  } finally {
    isFetchingStart.value = false;
  }
};

const candidatePhoto = computed(() => {
  if (itemData.value.photo) {
    return `${import.meta.env.VITE_BASE_URL}${itemData.value.photo}`;
  }
  return AccountImg;
});

const candidateAudio = computed(() => {
  return `${import.meta.env.VITE_BASE_URL}${itemData.value.voice}`;
});

const fetchLanguages = async function () {
  try {
    const response = await axios.get("/languages");
    languages_list.value = response.data;
  } catch (error) {
    console.error("Ошибка :", error);
  }
};

watch(
  () => props.candidateId,
  (newVal) => {
    if (newVal) {
      fetchData();
      fetchLanguages();
    }
  }
);

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
    languages.value?.map((n) =>
      newArr.push(languages_list.value[n - 1]?.name_ru)
    );

    return newArr?.join(", ");
  }
  return "";
});

const timelineDotcolor = (id) => {
  switch (id) {
    case 1:
      return "primary";
    case 2:
      return "info";
    case 3:
      return "";
    case 4:
      return "danger";
    case 5:
      return "danger";
    case 6:
      return "success";
    default:
      return "";
  }
};

const timelineDate = (data) => {
  const dateTime = new Date(data);

  // Helper function to format with leading zeros
  const padZero = (num) => String(num).padStart(2, "0");

  // Format date and time components
  const date = padZero(dateTime.getDate());
  const month = padZero(dateTime.getMonth() + 1); // Months are 0-indexed
  const year = dateTime.getFullYear();
  const hour = padZero(dateTime.getHours());
  const minute = padZero(dateTime.getMinutes());

  return `${date}-${month}-${year} ${hour}:${minute}`;
};

const createCandidatePdf = async () => {
  try {
    const candidateDataElement = document.getElementById("candidate-data");
    if (candidateDataElement) {
      isFetchingStart.value = true;
      // all text to black (because of theme bug in black theme, black theme text color does not supported by pdf)
      candidateDataElement.querySelectorAll("span, p, h4, h6").forEach((el) => {
        el.style.color = "#000";
      });
      // Creating a pdf
      await html2pdf(candidateDataElement, {
        margin: 1,
        filename: `${itemData.value.full_name}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      });
      // reset all text
      candidateDataElement.querySelectorAll("span, p, h4, h6").forEach((el) => {
        el.style.color =
          "rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity)) !important";
      });
    } else {
      console.error("Element '#candidate-data' not found.");
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Ошибка при создании PDF. Пожалуйста, попробуйте позже.");
  } finally {
    setTimeout(() => {
      isFetchingStart.value = false;
    }, 200);
  }
};

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
      <div
        v-if="isFetchingStart"
        class="d-flex h-screen align-center justify-center"
      >
        <VProgressCircular color="primary" indeterminate></VProgressCircular>
      </div>

      <VCardText v-if="!isFetchingStart">
        <VRow>
          <VRow id="candidate-data">
            <!-- Candidate Image 
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
            -->
            <VCol cols="3">
              <!-- 
                :src="candidatePhoto"
                -->
                <img
                :src="'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMK0UriHrpBR3-llABzzrdbWucp0T8hMim64DmvQlV2Yf7BaiT'"
                alt="аватар"
                :style="{ width: '100%', borderRadius: '5px' }"
              />
            </VCol>

            <VCol cols="9">
              <VListItem>
                <VListItemTitle>
                  <span>Полное имя: </span>
                  <span>{{ itemData.full_name }}</span>
                </VListItemTitle>
              </VListItem>

              <VListItem>
                <VListItemTitle>
                  <span>Возраст: </span>
                  <span>{{ itemData.age }}</span>
                </VListItemTitle>
              </VListItem>

              <VListItem>
                <VListItemTitle>
                  <span>День рождения: </span>
                  <span>{{ itemData.birthday }}</span>
                </VListItemTitle>
              </VListItem>

              <VListItem>
                <VListItemTitle>
                  <span>Пол: </span>
                  <span>{{ itemData.gender }}</span>
                </VListItemTitle>
              </VListItem>
            </VCol>

            <!-- Candidate Details -->
            <VCol cols="6">
              <VRow>
                <VListItem>
                  <VListItemTitle>
                    <span>Позитивные навыки: </span>
                    <span>{{ itemData.positive_skills }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span>Приложения: </span>
                    <span>{{ itemData.apps_text }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span>Платформы: </span>
                    <span>{{ itemData.apps }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span>Номер телефона: </span>
                    <span>{{
                      transformPhoneNumber(itemData.phone_number)
                    }}</span>
                  </VListItemTitle>
                </VListItem>

                <!-- <VListItem>
                  <VListItemTitle>
                    <span>Языки: </span>
                    <span
                      
                      >{{ languages_label }}</span
                    >
                  </VListItemTitle>
                </VListItem>

                 <VListItem>
                  <VListItemTitle>
                    <span>Add source: </span>
                    <span
                      
                      >{{ itemData.add_source }}</span
                    >
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span>Last works: </span>
                    <span
                      
                      >{{ itemData.last_work }}</span
                    >
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span>Marital state: </span>
                    <span
                      
                      >{{ itemData.marital_state }}</span
                    >
                  </VListItemTitle>
                </VListItem>

                <VListItem>
                  <VListItemTitle>
                    <span>University: </span>
                    <span
                      
                      >{{ itemData.university_place }}</span
                    >
                  </VListItemTitle>
                </VListItem> -->
              </VRow>
            </VCol>
            <VCol cols="6">
              <VRow>
                <VListItem>
                  <VListItemTitle>
                    <span>Языки: </span>
                    <span>{{ languages_label }}</span>
                  </VListItemTitle>
                </VListItem>
                <VListItem v-if="itemData.add_source">
                  <VListItemTitle>
                    <span>Источник добавления: </span>
                    <span>{{ itemData.add_source }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem v-if="itemData.last_work">
                  <VListItemTitle>
                    <span>Последние работы: </span>
                    <span>{{ itemData.last_work }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem v-if="itemData.marital_state">
                  <VListItemTitle>
                    <span>Семейное положение: </span>
                    <span>{{ itemData.marital_state }}</span>
                  </VListItemTitle>
                </VListItem>

                <VListItem v-if="itemData.university_place">
                  <VListItemTitle>
                    <span>Университет: </span>
                    <span>{{ itemData.university_place }}</span>
                  </VListItemTitle>
                </VListItem>
              </VRow>
            </VCol>
          </VRow>

          <VCol cols="12">
            <VRow>
              <VCol cols="6" class="ps-0 pt-4">
                <audio controls :src="candidateAudio"></audio>
              </VCol>
              <VCol cols="6" class="d-flex justify-end align-center">
                <VBtn @click="createCandidatePdf" density="default">
                  <span class="text-bold pe-1"> Скачать </span>
                  <VIcon icon="mdi-file-download" size="24" />
                </VBtn>
              </VCol>
            </VRow>

            <!-- 👉 Activity timeline -->
            <VCard
              title="История обновлений статусов"
              v-if="itemData?.actions?.length"
            >
              <VCardText>
                <VTimeline
                  density="compact"
                  align="start"
                  truncate-line="start"
                  class="v-timeline-density-compact"
                  line-inset="12"
                >
                  <VTimelineItem
                    v-for="action in itemData.actions"
                    :dot-color="timelineDotcolor(action.state.id)"
                    size="x-small"
                  >
                    <div
                      class="d-flex justify-space-between align-center flex-wrap"
                    >
                      <h4 class="text-base font-weight-semibold me-1 mb-3">
                        #{{ action.id }}
                        <VChip
                          :color="timelineDotcolor(action.state.id)"
                          density="compact"
                          label
                          class="text-uppercase ms-2"
                        >
                          {{ action.state.name_ru }}
                        </VChip>
                      </h4>
                      <span class="text-sm text-disabled text-no-wrap">{{
                        timelineDate(action.created_at)
                      }}</span>
                    </div>
                    <p class="mb-2">
                      {{ action.user.name }} {{ action.name_ru }}
                    </p>
                    <div class="mt-2">
                      <h6 class="font-weight-semibold text-sm">
                        Коментария: {{ action.comment.message }}
                      </h6>
                    </div>
                  </VTimelineItem>
                </VTimeline>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
span:first-child {
  font-weight: 700;
  margin-inline-end: 4px;
}
span:last-child {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  letter-spacing: 0.01rem;
  text-transform: none;
  white-space: wrap;
}
</style>
