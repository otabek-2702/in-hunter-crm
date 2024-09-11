<!-- <script setup>
import {computed, nextTick, ref, watch, watchEffect} from "vue";
import axios from "@axios";
import AddNewPermissionDrawer from "@/views/permission/list/AddNewPermissionDrawer.vue";
import EditPermissionDrawer from "@/views/permission/edit/EditPermissionDrawer.vue";
import MoreBtnPermission from "@/@core/components/Permission/MoreBtnPermission.vue";

const searchQuery = ref('')
const permissions = ref('')
const all_permissions = ref()
const rowPerPage = ref(5)
const currentPage = ref(1)
const totalPage = ref()
const totalPermissions = ref(0)

const permission_id = ref(0)
const permission_name = ref('')
const disable = ref(false)



const isAddNewPermissionDrawerVisible = ref(false)
const isEditPermissionDrawerVisible = ref(false)


const permissionData = permissionData => {
  createPermission(permissionData.name);
}

const permissionUpdatedData = permissionData => {
  console.log(permissionData)
  const {id,name} = permissionData

  axios.patch('permissions/update/'+ id, {
    'name': name,
  }).then((r) => {
    getAllPermissions(currentPage.value)
  }).catch((error) => {
    console.log(error)
  })
}

const handleEdit = async menu => {
  if(menu.action === 'edit'){
    permission_id.value = menu.id
    permission_name.value = menu.value
    isEditPermissionDrawerVisible.value = true
  }
}




const computedMoreList = computed(() => {
  return (paramId,paramName) => [
    // {
    //   title: 'View',
    //   value: 'view',
    //   prependIcon: 'bx-show',
    //   to: {
    //     name: 'apps-user-view-id',
    //     params: { id: paramId },
    //   },
    // },
    {
      id: paramId,
      title: 'Edit',
      action: 'edit',
      value: paramName,
      prependIcon: 'bx-pencil',

    },
    {
      id: paramId,
      title: 'Delete',
      action: 'delete',
      value: paramName,
      prependIcon: 'bx-trash-alt',

    },
  ]
})

const getAllPermissions = (page=1) => {
  axios.get('/permissions/get',{
    params: {
      'page': page,
      'per_page': rowPerPage.value,
      'search': searchQuery.value
    }
  }).then((r) => {
    all_permissions.value = r.data
  })

}



const createPermission = (name) => {
  axios.post('/permissions/create', {
    'name': name,
  }).then((r) => {
    if(r.data.message === 'New permission inserted.') currentPage.value = 1
  }).catch((error) => {
    console.log(error)
  })

}


getAllPermissions()

// 👉 watching current page
watchEffect(() => {
  if (currentPage.value > totalPage.value)
    currentPage.value = totalPage.value
})

watch(searchQuery, () => {
  getAllPermissions()
})


watch(currentPage, () => {
  getAllPermissions(currentPage.value)
})

watch(rowPerPage, () => {
  if(currentPage.value === 1){
    getAllPermissions(currentPage.value)
  }else{
    currentPage.value = 1
  }
})

watch(all_permissions,() => {
  permissions.value = all_permissions.value.result
  totalPage.value = all_permissions.value['meta']['pagination']['total_pages']
  totalPermissions.value = all_permissions.value['meta']['pagination']['total']
})


const paginationData = computed(() => {
  const firstIndex = permissions.value.length ? (currentPage.value - 1) * rowPerPage.value + 1 : 0
  const lastIndex = permissions.value.length + (currentPage.value - 1) * rowPerPage.value

  return `${ firstIndex }-${ lastIndex } of ${ totalPermissions.value }`
})


</script>

<template>

  <section>
    <VRow>
      <VCol cols="12">
        <VCard title="Search Filters">


          <VDivider />

          <VCardText class="d-flex flex-wrap gap-4">


            <VSpacer />

            <div class="app-permission-search-filter d-flex align-center">
              <!-- 👉 Search  -->
              <VTextField
                  v-model="searchQuery"
                  placeholder="Search"
                  density="compact"
                  class="me-3"
              />

              <VBtn @click="isAddNewPermissionDrawerVisible = true">
                Add Permission +
              </VBtn>
            </div>
          </VCardText>

          <VDivider />

          <VTable class="text-no-wrap">
            <!-- 👉 table head -->
            <thead>
            <tr>
              <th scope="col" style="width: 300px">
                ID
              </th>

              <th scope="col">
                NAME
              </th>

              <th scope="col">
                ACTIONS
              </th>
            </tr>
            </thead>

            <!-- 👉 table body -->
            <tbody>
            <tr
                v-for="permission in permissions"
                :key="permission.id"
            >

              <!--              ID-->
              <td>
                <VChip
                    col-1
                    density="compact"
                    label
                    class="text-uppercase col-1"
                >
                  {{ permission.id }}
                </VChip>
              </td>
              <!-- 👉 Status -->
              <td >
                <VChip
                    color="success"
                    density="compact"
                    label
                    class="text-uppercase"
                >
                  {{ permission.name }}
                </VChip>
              </td>

              <!-- 👉 Actions -->
              <td
                  class="text-center"
                  style="width: 80px;"
              >
                <MoreBtnPermission
                    :menu-list="computedMoreList(permission.id,permission.name)"
                    @eclick="handleEdit"
                    item-props
                />
              </td>
            </tr>
            </tbody>

            <!-- 👉 table footer  -->
            <tfoot v-show="!permissions.length">
            <tr>
              <td
                  colspan="7"
                  class="text-center text-body-1"
              >
                No data available
              </td>
            </tr>
            </tfoot>
          </VTable>

          <VDivider />

          <!-- SECTION Pagination -->
          <VCardText class="d-flex flex-wrap justify-end gap-4 pa-2" >
            <!-- 👉 Rows per page -->
            <div
                class="d-flex align-center"
                style="width: 171px;"
            >
              <span class="text-no-wrap text-sm me-3">Rows per page:</span>
              <VSelect
                  v-model="rowPerPage"
                  @select="getAllPermissions(currentPage.value)"
                  density="compact"
                  class="per-page-select"
                  variant="plain"
                  :items="[1, 2, 3, 5, 10]"
              />
            </div>

            <!-- 👉 Pagination and pagination meta -->
            <div class="d-flex align-center">
              <h6 class="text-sm font-weight-regular">
                {{ paginationData }}
              </h6>
            </div>
            <VPagination
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

    <AddNewPermissionDrawer
        v-model:isDrawerOpen="isAddNewPermissionDrawerVisible"
        @permission-data="permissionData"
    />

    <EditPermissionDrawer
        v-model:isDrawerOpen="isEditPermissionDrawerVisible"
        v-model:id="permission_id"
        v-model:permission="permission_name"
        @permission-updated-data="permissionUpdatedData"
    />

  </section>
</template>

<style lang="scss">
.app-permission-search-filter {
  inline-size: 385px;
}

.text-capitalize {
  text-transform: capitalize;
}

.permission-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}

.per-page-select {
  margin-block: auto;

  .v-field__input {
    align-items: center;
    padding: 2px;
    font-size: 14px;
  }

  .v-field__append-inner {
    align-items: center;
    padding: 0;
    margin-inline-start: -2.5rem;

    .v-icon {
      margin-inline-start: 0 !important;
    }
  }
}
</style>

<route lang="yaml">
meta:
action: read
subject: Permissions
</route> -->
