<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import axios from '@axios';
import AddNewCandidateDrawer from '@/views/candidate/AddNewCandidateDrawer.vue';
import UpdateCandidateDrawer from '@/views/candidate/UpdateCandidateDrawer.vue';
import ChangeStateCandidate from '@core/demo/ChangeStateCandidate.vue';
import Skeleton from '@/views/skeleton/Skeleton.vue';

const searchQuery = ref('');
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalCandidates = ref(0);
const candidates = ref([]);
const updateID = ref(0);

const selectedState = ref('');
const selectedGender = ref('');

const states_list = ref([]);
const gender_list = ref([
  {
    name_ru: 'Мужчина',
    slug: 'man',
  },
  {
    name_ru: 'Женщина',
    slug: 'woman',
  },
]);

const lastFetchedPage = ref(null);
const isFetching = ref(false);
const filtersChanged = ref(false);

const fetchCandidates = async (force = false) => {
  isFetching.value =true
  if (
    !force &&
    (isFetching.value || (currentPage.value === lastFetchedPage.value && !filtersChanged.value))
  ) {
    return; // Если запрос уже выполняется или страница не изменилась и фильтры не изменялись
  }

  isFetching.value = true;
  let g = '';
  let state = '';

  if (selectedGender.value) {
    g = '&gender=' + selectedGender.value;
  }

  if (selectedState.value) {
    state = '&state=' + selectedState.value;
  }

  try {
    const candidates_r = await axios.get(`/candidates?page=${currentPage.value}${g}${state}`);

    candidates.value = candidates_r.data['candidates'];
    lastFetchedPage.value = currentPage.value; // Сохраняем последнюю загруженную страницу
    currentPage.value = candidates_r.data['meta']['current_page'];
    totalCandidates.value = candidates_r.data['meta']['total'];
    totalPage.value = candidates_r.data['meta']['last_page'];
    rowPerPage.value = candidates_r.data['meta']['per_page'];

    filtersChanged.value = false; // Сбрасываем флаг изменений фильтров после загрузки
  } catch (e) {
    console.error('Ошибка загрузки кандидатов:', e);
  } finally {
    isFetching.value = false;
  }
};

// 👉 watching current page
watch(currentPage, () => {
  if (!isFetching.value) {
    fetchCandidates();
  }
});

// 👉 watching selected filters
watch([selectedState, selectedGender], () => {
  // Сбрасываем на первую страницу при изменении фильтров
  filtersChanged.value = true; // Устанавливаем флаг, что фильтры изменились
  currentPage.value = 1;
  fetchCandidates();
});

const searchCandidates = async () => {
  const candidates_r = await axios.get('/candidates?search=' + searchQuery.value);
  candidates.value = candidates_r.data['candidates'];

  currentPage.value = candidates_r.data['meta']['current_page'];
  totalCandidates.value = candidates_r.data['meta']['total'];
  totalPage.value = candidates_r.data['meta']['last_page'];
  rowPerPage.value = candidates_r.data['meta']['per_page'];
};

const fetchStates = async () => {
  const states_r = await axios.get('/states');
  states_list.value = states_r.data.states.filter(el => el.table === "candidates");
};

watchEffect(fetchCandidates);
watchEffect(fetchStates);

const resolveUserRoleVariant = (state) => {
  const roleLowerCase = state.toLowerCase();
  const roleMap = {
    new: { color: 'primary', icon: 'bx-user' },
    cancel: { color: 'warning', icon: 'bx-cog' },
    success: { color: 'success', icon: 'bx-doughnut-chart' },
    invite: { color: 'info', icon: 'bx-pencil' },
    archive: { color: 'error', icon: 'bx-laptop' },
  };

  return roleMap[roleLowerCase] || { color: 'primary', icon: 'bx-user' };
};

const isAddNewCandidateDrawerVisible = ref(false);
const isUpdateCandidateDrawerVisible = ref(false);


// 👉 Watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = candidates.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0;
  const lastIndex = candidates.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalCandidates.value}`;
});

const addNewCandidate = async (candidateData) => {
  const {
    full_name,
    age,
    languages,
    positive_skills,
    apps_text,
    apps,
    gender,
    phone_number,
    address,
  } = candidateData;
  try {
    await axios.post('/candidates', {
      full_name,
      age,
      languages: Array.from(languages),
      positive_skills,
      apps_text,
      apps,
      gender,
      phone_number,
      address,
    });
    await fetchCandidates(true);
  } catch (e) {
    console.error(e);
  }
};
const updateCandidate = async ({
  full_name,
  age,
  languages,
  id,
  positive_skills,
  apps_text,
  apps,
  gender,
  phone_number,
  address,
}) => {
  try {
    await axios.put(`/candidates/${id}`, {
      full_name,
      age,
      apps_text,
      apps,
      gender,
      phone_number,
      address,
      positive_skills,
      languages: Array.from(languages),
    });

    // Убедитесь, что fetchCandidates вызывается только после успешного обновления
    await fetchCandidates(true);
  } catch (error) {
    console.error('Ошибка при обновлении кандидата:', error);
  }
};

const openEditDrawer = (id) => {
  updateID.value = id;
  isUpdateCandidateDrawerVisible.value = true;
};

const isDialogVisible = ref(false);

</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard title="Search Filters">
          <VDivider />

          <VCardText class="d-flex flex-wrap">
            <VCol cols="3" sm="3" >
              <VSelect
                v-model="selectedState"
                label="Select State"
                :items="states_list"
                item-title="name_ru"
                item-value="id"
                clearable
                clear-icon="bx-x"
              />
            </VCol>

            <VCol cols="3" sm="3">
              <VSelect
                v-model="selectedGender"
                label="Select Gender"
                :items="gender_list"
                clearable
                clear-icon="bx-x"
                item-title="name_ru"
                item-value="slug"
              />
            </VCol>

            <!-- <VSpacer /> -->

            <!-- <div class="app-user-search-filter d-flex align-center"> -->
            <VCol cols="6" class="app-user-search-filter d-flex align-center">
              <VTextField
                v-model="searchQuery"
                @keyup.enter="searchCandidates"
                placeholder="Search Candidate"
                density="compact"
                class="me-6"
              />
              <VBtn @click="isAddNewCandidateDrawerVisible = true" > Add new Candidate </VBtn>
            </VCol>

            <!-- </div> -->
          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th style="width: 48px">ID</th>
                <th>FULL NAME</th>
                <th>AGE</th>
                <th>ADDRESS</th>
                <th>PHONE NUMBER</th>
                <th>STATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody v-show="candidates.length">
              <tr
                v-for="candidate in candidates"
                :key="candidate.id"
                @click="handle2(candidate.id)"
              >
                <td>{{ candidate.id }}</td>
                <td>{{ candidate.full_name }}</td>
                <td>{{ candidate.age }}</td>
                <td>{{ candidate.address }}</td>
                <td>{{ candidate.phone_number }}</td>
                <td>
                  <VChip
                    :color="resolveUserRoleVariant(candidate.state.slug).color"
                    density="compact"
                    label
                    class="text-uppercase"
                  >
                    {{ candidate.state.name_ru }}
                  </VChip>
                </td>
                <td class="text-center" style="width: 80px">
                  <VIcon
                    @click="
                      (event) => {
                        event.stopPropagation();
                        openEditDrawer(candidate.id);
                      }
                    "
                    size="30"
                    icon="bx-edit-alt"
                    style="color: rgb(var(--v-global-theme-primary))"
                  ></VIcon>

                  <ChangeStateCandidate :isDialogVisible="true" :id="candidate.id"> </ChangeStateCandidate>
                </td>
              </tr>
            </tbody>
            <Skeleton :count="7" v-if="isFetching" />

            <tfoot v-show="!candidates.length">
              <tr>
                <td colspan="7" class="text-center text-body-1">No data available</td>
              </tr>
            </tfoot>
          </VTable>

          <VDivider />

          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
            <div class="d-flex align-center" style="width: 300px">
              <h6 class="text-sm font-weight-regular">{{ paginationData }}</h6>
            </div>

            <VPagination
              v-if="candidates.length"
              v-model="currentPage"
              size="small"
              :total-visible="1"
              :length="totalPage"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <AddNewCandidateDrawer
      v-model:isDrawerOpen="isAddNewCandidateDrawerVisible"
      @candidateData="addNewCandidate"
    />
    <UpdateCandidateDrawer
      :id="updateID"
      v-model:isDrawerOpen="isUpdateCandidateDrawerVisible"
      @candidateData="updateCandidate"
    />
  </section>
</template>

<style lang="scss">
.app-user-search-filter {
  inline-size: 385px;
}

.text-capitalize {
  text-transform: capitalize;
}
</style>
