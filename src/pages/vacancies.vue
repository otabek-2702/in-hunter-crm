<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import axios from '@axios';
import AddNewVacancyDrawer from '@/views/vacancy/AddNewVacancyDrawer.vue';
import Skeleton from '@/views/skeleton/Skeleton.vue';
import DeleteItemDialog from '@/@core/components/DeleteItemDialog.vue';
import { VChip } from 'vuetify/components';

const searchQuery = ref();
const finalSearch = ref('');
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalElements = ref(0);
const vacancies = ref([]);

const lastFetchedPage = ref(null);
const isFetching = ref(false);

// filter
const filtersChanged = ref(false);
const selectedState = ref();
const selectedCompany = ref();
const selectedJobPosition = ref();

const fetchData = async (force = false) => {
  if (
    !force &&
    (isFetching.value || (currentPage.value === lastFetchedPage.value && !filtersChanged.value))
  ) {
    return; // Если запрос уже выполняется или страница не изменилась и фильтры не изменялись
  }
  isFetching.value = true;

  let url = `/vacancies?page=${currentPage.value}&search=${finalSearch.value}`;
  if (selectedState.value) {
    url += `&state_id=${selectedState.value}`;
  }
  if (selectedJobPosition.value) {
    url += `&job_position_id=${selectedJobPosition.value}`;
  }
  if (selectedCompany.value) {
    url += `&company_id=${selectedCompany.value}`;
  }

  try {
    const vacancies_r = await axios.get(url);

    vacancies.value = vacancies_r.data['vacancies'];
    lastFetchedPage.value = currentPage.value;
    currentPage.value = vacancies_r.data['meta']['current_page'];
    totalElements.value = vacancies_r.data['meta']['total'];
    totalPage.value = vacancies_r.data['meta']['last_page'];
    rowPerPage.value = vacancies_r.data['meta']['per_page'];
    filtersChanged.value = false;
  } catch (error) {
    console.error('Ошибка загрузки кандидатов:', error);
  } finally {
    isFetching.value = false;
  }
};

// 👉 watching selected filters
watch([selectedState, selectedJobPosition, selectedCompany], () => {
  // Сбрасываем на первую страницу при изменении фильтров
  filtersChanged.value = true; // Устанавливаем флаг, что фильтры изменились
  currentPage.value = 1;
  fetchData(true);
});

// search
const searchElements = async () => {
  finalSearch.value = searchQuery.value;
  currentPage.value = 1;
  fetchData(true);
};

watch(searchQuery, (newVal) => {
  if (!newVal) {
    finalSearch.value = '';
    currentPage.value = 1;
    fetchData(true);
  }
});

const isAddNewVacancyDrawerVisible = ref(false);

// Pages start

// 👉 Watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = vacancies?.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0;
  const lastIndex = vacancies?.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalElements.value}`;
});

// Pages end

// Delete
const isDialogVisible = ref(false);
const isDeleting = ref(false);
const deleteData = ref({
  id: 1,
  name: null,
});

const confirmDelete = function (id, name) {
  deleteData.value.id = id;
  deleteData.value.name = name;
  isDialogVisible.value = true;
};

const deleteItem = async function (id) {
  try {
    isDeleting.value = true;
    await axios.delete('/vacancies/' + id);
    toast('Успешно удалено', {
      theme: 'auto',
      type: 'success',
      dangerouslyHTMLString: true,
    });
    await fetchData(true);
    isDialogVisible.value = false;
  } catch (error) {
    console.error('Ошибка :', error);
  } finally {
    isDeleting.value = false;
  }
};
// Delete end

// Filter
const states_list = ref([]);

const fetchStates = async () => {
  try {
    const response = await axios.get('/states');
    states_list.value = await response.data.states.filter((el) => el.table === 'vacancies');
  } catch (error) {
    console.error('Ошибка :', error);
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

const job_positions_list = ref([]);

const fetchJobPositions = async () => {
  try {
    const response = await axios.get('/job_positions');
    job_positions_list.value = await response.data.job_positions;
  } catch (error) {
    console.error('Ошибка :', error);
  }
};

onMounted(() => {
  fetchData();
  fetchStates();
  fetchCompanies();
  fetchJobPositions();
});

// State
const resolveVacancyState = (state) => {
  const vacancyLowerCase = state?.toString().toLowerCase();
  const vacancyMap = {
    7: { color: 'primary', icon: 'bx-user' },
    9: { color: 'warning', icon: 'bx-cog' },
    8: { color: 'success', icon: 'bx-doughnut-chart' },
    // invite: { color: 'info', icon: 'bx-pencil' },
    // archive: { color: 'error', icon: 'bx-laptop' },
  };

  return vacancyMap[vacancyLowerCase] || { color: 'primary', icon: 'bx-user' };
};
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard title="Search Filters">
          <DeleteItemDialog
            @confirm="deleteItem"
            :isDialogVisible="isDialogVisible"
            @update:isDialogVisible="isDialogVisible = $event"
            :role="deleteData"
            :isDeleting="isDeleting"
          />

          <VCardText class="d-flex flex-wrap">
            <VCol cols="2">
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
                v-model="selectedCompany"
                label="Select Company"
                :items="companies_list"
                item-title="title"
                item-value="id"
                clearable
                clear-icon="bx-x"
              />
            </VCol>
            <VCol cols="3" sm="3">
              <VSelect
                v-model="selectedJobPosition"
                label="Select Job Position"
                :items="job_positions_list"
                item-title="name_ru"
                item-value="id"
                clearable
                clear-icon="bx-x"
              />
            </VCol>
            <VSpacer />

            <VCol cols="4" class="app-user-search-filter d-flex align-center">
              <VTextField
                v-model="searchQuery"
                @keyup.enter="searchElements"
                placeholder="Search Vacancy"
                density="compact"
                class="me-6"
              />
              <VBtn @click="isAddNewVacancyDrawerVisible = true"> Add new Vacancy </VBtn>
            </VCol>
          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th style="width: 48px">ID</th>
                <th>COMPANY</th>
                <th>JOB</th>
                <th>STATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody v-show="!isFetching">
              <tr v-for="(vacancy, i) in vacancies" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ vacancy?.company?.title }}</td>
                <td>{{ vacancy.job_position?.name_ru }}</td>
                <td>
                  <VChip
                    :color="resolveVacancyState(vacancy?.state?.id).color"
                    density="compact"
                    label
                    class="text-uppercase"
                  >
                    {{ vacancy.state.name_ru }}
                  </VChip>
                </td>
                <td class="text-center" style="width: 80px">
                  <VIcon
                    size="30"
                    icon="bx-trash"
                    style="color: red"
                    @click="confirmDelete(vacancy.id, vacancy.title)"
                  ></VIcon>
                </td>
              </tr>
            </tbody>

            <Skeleton :count="5" v-show="isFetching" />

            <tfoot v-if="!isFetching && !vacancies.length">
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
              v-if="vacancies.length"
              v-model="currentPage"
              size="small"
              :total-visible="1"
              :length="totalPage"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <AddNewVacancyDrawer
      v-model:isDrawerOpen="isAddNewVacancyDrawerVisible"
      @fetchDatas="() => fetchData(true)"
      :job_positions_list="job_positions_list"
      :companies_list="companies_list"
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
