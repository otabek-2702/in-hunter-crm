<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import axios from '@axios';
import AddNewCompanyDrawer from '@/views/company/AddNewCompanyDrawer.vue';
import UpdateCompanyDrawer from '@/views/company/UpdateCompanyDrawer.vue';
import Skeleton from '@/views/skeleton/Skeleton.vue';
import DeleteItemDialog from '@/@core/components/DeleteItemDialog.vue';

const searchQuery = ref('');
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalEmployees = ref(0);
const companies = ref([]);
const updateID = ref(0);

const lastFetchedPage = ref(null);
const isFetching = ref(false);

const fetchData = async (force = false) => {
  if (!force && (isFetching.value || currentPage.value === lastFetchedPage.value)) {
    return; // Если запрос уже выполняется или страница не изменилась и фильтры не изменялись
  }

  isFetching.value = true;

  try {
    const companies_r = await axios.get(`/companies?page=${currentPage.value}`);

    companies.value = companies_r.data['companies'];
    lastFetchedPage.value = currentPage.value; // Сохраняем последнюю загруженную страницу
    currentPage.value = companies_r.data['meta']['current_page'];
    totalEmployees.value = companies_r.data['meta']['total'];
    totalPage.value = companies_r.data['meta']['last_page'];
    rowPerPage.value = companies_r.data['meta']['per_page'];
  } catch (e) {
    console.error('Ошибка загрузки кандидатов:', e);
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

const searchEmployees = async () => {
  const companies_r = await axios.get('/companies?search=' + searchQuery.value);
  companies.value = companies_r.data['companies'];

  currentPage.value = companies_r.data['meta']['current_page'];
  totalEmployees.value = companies_r.data['meta']['total'];
  totalPage.value = companies_r.data['meta']['last_page'];
  rowPerPage.value = companies_r.data['meta']['per_page'];
};

watchEffect(fetchData);

const isAddNewCompanyDrawerVisible = ref(false);
const isUpdateCompanyDrawerVisible = ref(false);

// Pages start

// 👉 Watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = companies.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0;
  const lastIndex = companies.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalEmployees.value}`;
});

// Pages end

const openEditDrawer = (id) => {
  updateID.value = id;
  isUpdateCompanyDrawerVisible.value = true;
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
    await axios.delete('/companies/' + id);
    await fetchData(true);
    isDialogVisible.value = false;
  } catch (error) {
    toast(error.response.data.message, {
      theme: 'auto',
      type: 'error',
      dangerouslyHTMLString: true,
    });
  } finally {
    isDeleting.value = false;
  }
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
            <VSpacer />

            <VCol cols="6" class="app-user-search-filter d-flex align-center">
              <VTextField
                v-model="searchQuery"
                @keyup.enter="searchEmployees"
                placeholder="Search Employee"
                density="compact"
                class="me-6"
              />
              <VBtn @click="isAddNewEmployeeDrawerVisible = true"> Add new Employee </VBtn>
            </VCol>
          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th style="width: 48px">ID</th>
                <th>NAME</th>
                <th>PHONE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(company, i) in companies" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ company.title }}</td>
                <td>{{ company.phone_number }}</td>
                <td class="text-center" style="width: 80px">
                  <VIcon
                    @click="
                      (event) => {
                        event.stopPropagation();
                        openEditDrawer(company.id);
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
                    @click="confirmDelete(company.id, company.title)"
                  ></VIcon>
                </td>
              </tr>
            </tbody>

            <Skeleton :count="4" v-if="isFetching && !companies.length" />

            <tfoot v-show="!isFetching && !companies.length">
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
              v-if="companies.length"
              v-model="currentPage"
              size="small"
              :total-visible="1"
              :length="totalPage"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <AddNewCompanyDrawer
      v-model:isDrawerOpen="isAddNewCompanyDrawerVisible"
      @fetchDatas="() =>fetchData(true)"
    />
    <UpdateCompanyDrawer
      :id="updateID"
      v-model:isDrawerOpen="isUpdateCompanyDrawerVisible"
      @fetchDatas="() =>fetchData(true)"
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
