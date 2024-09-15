<script setup>
import { avatarText } from '@core/utils/formatters';
import { computed, ref, watch, watchEffect } from 'vue';
import axios from '@axios';
import AddNewRoleDrawer from '@/views/role/AddNewRoleDrawer.vue';
import UpdateRoleDrawer from '@/views/role/UpdateRoleDrawer.vue';
import DeleteItemDialog from '@core/components/DeleteItemDialog.vue';
import Skeleton from '@/views/skeleton/Skeleton.vue';

const searchQuery = ref('');
const finalSearch = ref('');
const isFetching = ref(false);
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(1);
const totalRoles = ref(0);
const roles = ref([]);
const updateID = ref(0);

const fetchData = async () => {
  try {
    isFetching.value = true;
    const roles_r = await axios.get(`/roles?page=${currentPage.value}&search=${finalSearch.value}`);
    roles.value = await roles_r.data['roles'];

    currentPage.value = await roles_r.data['meta']['current_page'];
    totalRoles.value = await roles_r.data['meta']['total'];
    totalPage.value = await roles_r.data['meta']['last_page'];
    rowPerPage.value = await roles_r.data['meta']['per_page'];
  } catch (error) {
    console.error('Ошибка :', error);
  } finally {
    isFetching.value = false;
  }
};
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

onMounted(() => {
  fetchData();
});

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

const resolveUserRoleVariant = (role) => {
  const roleLowerCase = role.toLowerCase();
  if (roleLowerCase === 'subscriber')
    return {
      color: 'primary',
      icon: 'bx-user',
    };
  if (roleLowerCase === 'author')
    return {
      color: 'warning',
      icon: 'bx-cog',
    };
  if (roleLowerCase === 'maintainer')
    return {
      color: 'success',
      icon: 'bx-doughnut-chart',
    };
  if (roleLowerCase === 'editor')
    return {
      color: 'info',
      icon: 'bx-pencil',
    };
  if (roleLowerCase === 'admin')
    return {
      color: 'error',
      icon: 'bx-laptop',
    };

  return {
    color: 'primary',
    icon: 'bx-user',
  };
};

const roleData = ref({
  id: 1,
  name: null,
});
// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value) currentPage.value = totalPage.value;
});

// 👉 Computing pagination data
const paginationData = computed(() => {
  const firstIndex = roles.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0;
  const lastIndex = roles.value.length + (currentPage.value - 1) * rowPerPage.value;

  return `${firstIndex}-${lastIndex} of ${totalRoles.value}`;
});

// Add
const isAddNewRoleDrawerVisible = ref(false);
const addNewRole = async (roleData) => {
  let { name, name_uz, name_ru, permission } = roleData;
  try {
    await axios.post('/roles', {
      name: name,
      name_uz: name_uz,
      name_ru: name_ru,
      permissions: Array.from(permission),
    });
    await fetchData();
  } catch (error) {
    console.error(error);
  }
};

// Update
const isUpdateRoleDrawerVisible = ref(false);
const updateRole = async (roleData) => {
  let { name, name_uz, name_ru, permission, id } = roleData;
  try {
    await axios.put('/roles/' + id, {
      name: name,
      name_uz: name_uz,
      name_ru: name_ru,
      permissions: Array.from(permission),
    });
    await fetchData();
  } catch (error) {
    console.error(error);
  }
};

const openEditDrawer = function (id) {
  updateID.value = id;
  isUpdateRoleDrawerVisible.value = true;
};

const confirmDelete = function (id, name) {
  roleData.value.id = id;
  roleData.value.name = name;
  isDialogVisible.value = true;
};

const isDialogVisible = ref(false);

const deleteItem = async function (id) {
  try {
    await axios.delete('/roles/' + id);
    toast('Успешно удалено', {
      theme: 'auto',
      type: 'success',
      dangerouslyHTMLString: true,
    });
    await fetchData();
    isDialogVisible.value = false;
  } catch (error) {
    console.error(error);
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
          />
          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">
            <VSpacer />

            <div class="app-user-search-filter d-flex align-center">
              <!-- 👉 Search  -->
              <VTextField
                v-model="searchQuery"
                @keyup.enter="searchElements"
                placeholder="Search Role"
                density="compact"
                class="me-3"
              />

              <VBtn @click="isAddNewRoleDrawerVisible = true"> Add new Role </VBtn>
            </div>
          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <!-- 👉 table head -->
            <thead>
              <tr>
                <th scope="col" style="width: 48px">ID</th>
                <th scope="col">NAME</th>
                <th scope="col">PERMISSIONS</th>

                <th scope="col">ACTIONS</th>
              </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody v-show="!isFetching">
              <tr v-for="role in roles" :key="role.id">
                <td class="text-capitalize text-high-emphasis">
                  <span class="text-base">{{ role.id }}</span>
                </td>

                <!-- 👉 User -->
                <td>
                  <div class="d-flex align-center">
                    <span class="text-base">{{ role.name_ru }}</span>
                  </div>
                </td>

                <td class="text-capitalize text-high-emphasis">
                  <VRow>
                    <VChip
                      v-for="permission in role.permissions"
                      color="success"
                      variant="outlined"
                    >
                      {{ permission['name_ru'] }}
                    </VChip>
                  </VRow>
                </td>

                <!-- 👉 Actions -->
                <td class="text-center" style="width: 80px">
                  <div style="cursor: pointer">
                    <VIcon
                      @click="openEditDrawer(role.id)"
                      size="30"
                      icon="bx-edit-alt"
                      style="color: rgb(var(--v-global-theme-primary)"
                    ></VIcon>
                    <VIcon
                      size="30"
                      icon="bx-trash"
                      style="color: red"
                      @click="confirmDelete(role.id, role.name_uz)"
                    ></VIcon>
                  </div>
                </td>
              </tr>
            </tbody>

            <Skeleton :count="4" v-show="isFetching" />

            <!-- 👉 table footer  -->
            <tfoot v-if="!roles.length">
              <tr>
                <td colspan="7" class="text-center text-body-1">No data available</td>
              </tr>
            </tfoot>
          </VTable>

          <VDivider />

          <!-- SECTION Pagination -->
          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2">
            <!-- 👉 Rows per page -->
            <div class="d-flex align-center" style="width: 171px">
              <!--              <span class="text-no-wrap text-sm me-3">Rows per page:</span>-->
              <!--              <VSelect-->
              <!--                  v-model="rowPerPage"-->
              <!--                  density="compact"-->
              <!--                  class="per-page-select"-->
              <!--                  variant="plain"-->
              <!--                  :items="[10, 20, 30, 50]"-->
              <!--              />-->
            </div>

            <!-- 👉 Pagination and pagination meta -->
            <div class="d-flex align-center" v-if="roles.length">
              <h6 class="text-sm font-weight-regular">
                {{ paginationData }}
              </h6>
            </div>
            <VPagination
              v-if="roles.length"
              v-model="currentPage"
              size="small"
              :total-visible="1"
              :length="totalPage"
            />
          </VCardText>
          <!-- !SECTION -->
        </VCard>
      </VCol>
    </VRow>
    <!--     👉 Add New Role -->
    <AddNewRoleDrawer v-model:isDrawerOpen="isAddNewRoleDrawerVisible" @role-data="addNewRole" />
    <UpdateRoleDrawer
      :id="updateID"
      v-model:isDrawerOpen="isUpdateRoleDrawerVisible"
      @role-data="updateRole"
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
