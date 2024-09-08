<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import axios from '@axios';
import AddNewEmployeeDrawer from '@/views/employee/AddNewEmployeeDrawer.vue';
import UpdateEmployeeDrawer from '@/views/employee/UpdateEmployeeDrawer.vue';

const searchQuery = ref('');
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalEmployees = ref(0);
const candidates = ref([]);
const updateID = ref(0);

const selectedState = ref('');
const selectedGender = ref('');

const states_list = ref([]);


const lastFetchedPage = ref(null);
const isFetching = ref(false);
const filtersChanged = ref(false);

const fetchEmployees = async (force = false) => {
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
    totalEmployees.value = candidates_r.data['meta']['total'];
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
    fetchEmployees();
  }
});

// 👉 watching selected filters
watch([selectedState], () => {
  // Сбрасываем на первую страницу при изменении фильтров
  filtersChanged.value = true; // Устанавливаем флаг, что фильтры изменились
  currentPage.value = 1;
  fetchEmployees();
});

const searchEmployees = async () => {
  const candidates_r = await axios.get('/candidates?search=' + searchQuery.value);
  candidates.value = candidates_r.data['candidates'];

  currentPage.value = candidates_r.data['meta']['current_page'];
  totalEmployees.value = candidates_r.data['meta']['total'];
  totalPage.value = candidates_r.data['meta']['last_page'];
  rowPerPage.value = candidates_r.data['meta']['per_page'];
};

const fetchStates = async () => {
  const states_r = await axios.get('/states');
  states_list.value = states_r.data;
};

watchEffect(fetchEmployees);


const isAddNewEmployeeDrawerVisible = ref(false);
const isUpdateEmployeeDrawerVisible = ref(false);


// Pages start

// 👉 Watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = candidates.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0;
  const lastIndex = candidates.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalEmployees.value}`;
});

// Pages end

// New Employee

const addNewEmployee = async (employeeData) => {
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
  } = employeeData;
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
    await fetchEmployees(true);
  } catch (e) {
    console.error(e);
  }
};

// Update Employee
const updateEmployee = async ({
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

    // Убедитесь, что fetchEmployees вызывается только после успешного обновления
    await fetchEmployees(true);
  } catch (error) {
    console.error('Ошибка при обновлении кандидата:', error);
  }
};

const openEditDrawer = (id) => {
  updateID.value = id;
  isUpdateEmployeeDrawerVisible.value = true;
};

const isDialogVisible = ref(false);

</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard title="Search Filters">
            
            <VCardText class="d-flex flex-wrap">
              <VSpacer />
           
            <VCol cols="6" class="app-user-search-filter d-flex align-center">
              <VTextField
                v-model="searchQuery"
                @keyup.enter="searchEmployees"
                placeholder="Search Employee"
                density="compact"
                class="me-6"
              />
              <VBtn @click="isAddNewEmployeeDrawerVisible = true" > Add new Employee </VBtn>
            </VCol>

          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th style="width: 48px">ID</th>
                <th>FULL NAME</th>
                <th>AGE</th>
                <th>PHONE NUMBER</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="candidate in candidates"
                :key="candidate.id"
                @click="handle2(candidate.id)"
              >
                <td>{{ candidate.id }}</td>
                <td>{{ candidate.full_name }}</td>
                <td>{{ candidate.age }}</td>
                <td>{{ candidate.phone_number }}</td>
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

                </td>
              </tr>
            </tbody>

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

    <AddNewEmployeeDrawer
      v-model:isDrawerOpen="isAddNewEmployeeDrawerVisible"
      @candidateData="addNewEmployee"
    />
    <UpdateEmployeeDrawer
      :id="updateID"
      v-model:isDrawerOpen="isUpdateEmployeeDrawerVisible"
      @candidateData="updateEmployee"
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
