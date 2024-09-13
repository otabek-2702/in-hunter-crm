<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import axios from '@axios';
import AddNewEmployeeDrawer from '@/views/employee/AddNewEmployeeDrawer.vue';
import UpdateEmployeeDrawer from '@/views/employee/UpdateEmployeeDrawer.vue';
import Skeleton from '@/views/skeleton/Skeleton.vue';
import DeleteItemDialog from '@/@core/components/DeleteItemDialog.vue';
import { toast } from 'vue3-toastify';

const searchQuery = ref('');
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalEmployees = ref(0);
const employees = ref([]);
const updateID = ref(0);

const lastFetchedPage = ref(null);
const isFetching = ref(false);

const fetchEmployees = async (force = false) => {
  if (!force && (isFetching.value || currentPage.value === lastFetchedPage.value)) {
    return; // Если запрос уже выполняется или страница не изменилась и фильтры не изменялись
  }

  isFetching.value = true;

  try {
    const employees_r = await axios.get(`/users?page=${currentPage.value}`);

    employees.value = employees_r.data['users'];
    lastFetchedPage.value = currentPage.value; // Сохраняем последнюю загруженную страницу
    currentPage.value = employees_r.data['meta']['current_page'];
    totalEmployees.value = employees_r.data['meta']['total'];
    totalPage.value = employees_r.data['meta']['last_page'];
    rowPerPage.value = employees_r.data['meta']['per_page'];
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

const searchEmployees = async () => {
  const employees_r = await axios.get('/users?search=' + searchQuery.value);
  employees.value = employees_r.data['users'];

  currentPage.value = employees_r.data['meta']['current_page'];
  totalEmployees.value = employees_r.data['meta']['total'];
  totalPage.value = employees_r.data['meta']['last_page'];
  rowPerPage.value = employees_r.data['meta']['per_page'];
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
  const firstIndex = employees.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0;
  const lastIndex = employees.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalEmployees.value}`;
});

// Pages end

const openEditDrawer = (id) => {
  updateID.value = id;
  isUpdateEmployeeDrawerVisible.value = true;
};

// Delete
const isDialogVisible = ref(false);
const isDeleting = ref(false);
const roleData = ref({
  id: 1,
  name: null,
});

const confirmDelete = function (id, name) {
  roleData.value.id = id;
  roleData.value.name = name;
  isDialogVisible.value = true;
};

const deleteItem = async function (id) {
  try {
    isDeleting.value = true;
    await axios.delete('/users/' + id);
    await fetchEmployees(true);
    isDialogVisible.value = false;
  } catch (error) {
    toast(error?.message, {
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
            :role="roleData"
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
                <th>FULL NAME</th>
                <th>LOGIN</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(employee, i) in employees" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ employee.name }}</td>
                <td>{{ employee.login }}</td>
                <td class="text-center" style="width: 80px">
                  <VIcon
                    @click="
                      (event) => {
                        event.stopPropagation();
                        openEditDrawer(employee.id);
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
                    @click="confirmDelete(employee.id, employee.name)"
                  ></VIcon>
                </td>
              </tr>
            </tbody>

            <Skeleton :count="4" v-if="isFetching && !employees.length" />

            <tfoot v-show="!isFetching && !employees.length">
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
              v-if="employees.length"
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
      @fetchEmployees="() => fetchEmployees(true)"
    />
    <UpdateEmployeeDrawer
      :id="updateID"
      v-model:isDrawerOpen="isUpdateEmployeeDrawerVisible"
      @fetchEmployees="() => fetchEmployees(true)"
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
