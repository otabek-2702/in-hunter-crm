<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import axios from '@axios';
import AddNewJobPositionDrawer from '@/views/job_position/AddNewJobPositionDrawer.vue';
import Skeleton from '@/views/skeleton/Skeleton.vue';
import DeleteItemDialog from '@/@core/components/DeleteItemDialog.vue';
import { VChip } from 'vuetify/components';
import UpdateJobPositionDrawer from '@/views/job_position/UpdateJobPositionDrawer.vue';

const searchQuery = ref('');
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalElements = ref(0);
const job_positions = ref([]);
const updateID = ref(0);

const lastFetchedPage = ref(null);
const isFetching = ref(false);
// // filter
// const selectedState = ref();
// const selectedCompany = ref();
// const selectedJobPosition = ref();

const fetchData = async (force = false) => {
  isFetching.value = true;
  if (!force && (isFetching.value || currentPage.value === lastFetchedPage.value)) {
    return; // Если запрос уже выполняется или страница не изменилась и фильтры не изменялись
  }

  try {
    const job_positions_r = await axios.get(`/job_positions?page=${currentPage.value}`);

    job_positions.value = job_positions_r.data['job_positions'];
    lastFetchedPage.value = currentPage.value; // Сохраняем последнюю загруженную страницу
    currentPage.value = job_positions_r.data['meta']['current_page'];
    totalElements.value = job_positions_r.data['meta']['total'];
    totalPage.value = job_positions_r.data['meta']['last_page'];
    rowPerPage.value = job_positions_r.data['meta']['per_page'];
  } catch (error) {
    console.error('Ошибка загрузки кандидатов:', error);
  } finally {
    isFetching.value = false;
  }
};

// 👉 watching current page
watch(currentPage, () => {
  if (!isFetching.value) {
    fetchData();
  }
});

const searchElements = async () => {
  try {
    isFetching.value = true;
    const job_positions_r = await axios.get('/job_positions?search=' + searchQuery.value);

    job_positions.value = job_positions_r.data['job_positions'];
    currentPage.value = job_positions_r.data['meta']['current_page'];
    totalElements.value = job_positions_r.data['meta']['total'];
    totalPage.value = job_positions_r.data['meta']['last_page'];
    rowPerPage.value = job_positions_r.data['meta']['per_page'];
  } catch (error) {
    console.error('Ошибка :', error);
  } finally {
    isFetching.value = false;
  }
};

watchEffect(fetchData);

const isAddNewJobPositionDrawerVisible = ref(false);
const isUpdateJobPositionDrawerVisible = ref(false);

// Pages start

// 👉 Watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = job_positions?.value.length
    ? (currentPage.value - 1) * rowPerPage.value + 1
    : 0;
  const lastIndex = job_positions?.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalElements.value}`;
});

// Pages end

const openEditDrawer = (id) => {
  updateID.value = id;
  isUpdateJobPositionDrawerVisible.value = true;
};

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
    await axios.delete('/job_positions/' + id);
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
// const states_list = ref([]);

// const fetchStates = async () => {
//   try {
//     const response = await axios.get('/states');
//     states_list.value = await response.data.states.filter((el) => el.table === 'job_positions');
//   } catch (error) {
//     console.error('Ошибка :', error);
//   }
// };
// watchEffect(fetchStates);

// const companies_list = ref([]);

// const fetchCompanies = async () => {
//   try {
//     const response = await axios.get('/companies');
//     companies_list.value = await response.data.companies;
//   } catch (error) {
//     console.error('Ошибка :', error);
//   }
// };
// watchEffect(fetchCompanies);

// const job_positions_list = ref([]);

// const fetchJobPositions = async () => {
//   try {
//     const response = await axios.get('/job_positions');
//     job_positions_list.value = await response.data.job_positions;
//   } catch (error) {
//     console.error('Ошибка :', error);
//   }
// };
// watchEffect(fetchJobPositions);

// // State
// const resolveJobPositionState = (state) => {
//   const job_positionLowerCase = state?.toString().toLowerCase();
//   const job_positionMap = {
//     7: { color: 'primary', icon: 'bx-user' },
//     9: { color: 'warning', icon: 'bx-cog' },
//     8: { color: 'success', icon: 'bx-doughnut-chart' },
//     // invite: { color: 'info', icon: 'bx-pencil' },
//     // archive: { color: 'error', icon: 'bx-laptop' },
//   };

//   return job_positionMap[job_positionLowerCase] || { color: 'primary', icon: 'bx-user' };
// };
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
            <!-- <VCol cols="2">
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
            </VCol> -->
            <VSpacer />

            <VCol cols="4" class="app-user-search-filter d-flex align-center">
              <VTextField
                v-model="searchQuery"
                @keyup.enter="searchElements"
                placeholder="Search Job"
                density="compact"
                class="me-6"
              />
              <VBtn @click="isAddNewJobPositionDrawerVisible = true"> Add new Job </VBtn>
            </VCol>
          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th style="width: 48px">ID</th>
                <th>TITLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody v-if="job_positions.length">
              <tr v-for="(job_position, i) in job_positions" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ job_position?.name_ru }}</td>

                <td class="text-center" style="width: 80px">
                  <VIcon
                    @click="
                      (event) => {
                        event.stopPropagation();
                        openEditDrawer(job_position.id);
                      }
                    "
                    size="30"
                    icon="bx-edit-alt"
                    style="color: rgb(var(--v-global-theme-primary))"
                  ></VIcon>
                  <VIcon
                    size="30"
                    icon="bx-trash"
                    style="color: red"
                    @click="confirmDelete(job_position.id, job_position.title)"
                  ></VIcon>
                </td>
              </tr>
            </tbody>

            <Skeleton :count="4" v-else-if="isFetching && !job_positions.length" />

            <tfoot v-else-if="!isFetching && !job_positions.length">
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
              v-if="job_positions.length"
              v-model="currentPage"
              size="small"
              :total-visible="1"
              :length="totalPage"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <AddNewJobPositionDrawer
      v-model:isDrawerOpen="isAddNewJobPositionDrawerVisible"
      @fetchDatas="() => fetchData(true)"
    />
    <UpdateJobPositionDrawer
      v-model:isDrawerOpen="isUpdateJobPositionDrawerVisible"
      @fetchDatas="() => fetchData(true)"
      :id="updateID"
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
