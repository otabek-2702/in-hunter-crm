<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import {
  requiredValidator,
} from '@validators'
import {nextTick, ref, watch, watchEffect} from "vue"
import AppDrawerHeaderSection from "@core/components/AppDrawerHeaderSection.vue"
import axios from "@axios"

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  id:{
    required:true,
  }
})

const permissions = ref([])

const emit = defineEmits([
  'update:isDrawerOpen',
  'roleData',
])

const isFormValid = ref(false)
const refForm = ref()
const name_uz =ref()
const name_ru =ref()
const permission = ref()

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  props.id = 0
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('roleData', {
        id: props.id,
        name_uz: name_uz.value,
        name_ru: name_ru.value,
        permission: permission.value,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
  if (!val) {
    nextTick(() => {
      refForm.value?.reset();
      refForm.value?.resetValidation();
    });
  }
}

const fetchPermissions = async function(){
  const r = await axios.get('/permissions/all')
  permissions.value = r.data['permissions']
  console.log(permissions.value)
}

watchEffect(fetchPermissions)

watch( () => props.isDrawerOpen, async (newVal) => {
  if (newVal) {
   let role =  await axios.get('/roles/' + props.id)

    name_ru.value =  role.data.name_ru
    name_uz.value =  role.data.name_ru

    permission.value = role.data.permissions.map(permission => permission.id);
  }
})

</script>

<template>
  <VNavigationDrawer
      temporary
      :width="400"
      location="end"
      class="scrollable-content"
      :model-value="props.isDrawerOpen"
      @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
        title="Edit Role"
        @cancel="closeNavigationDrawer"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
              ref="refForm"
              v-model="isFormValid"
              @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Full name -->
              <VCol cols="12">
                <VTextField
                    v-model="name_uz"
                    :rules="[requiredValidator]"
                    label="Name uz"
                />
              </VCol>

              <!-- 👉 Full name -->
              <VCol cols="12">
                <VTextField
                    v-model="name_ru"
                    :rules="[requiredValidator]"
                    label="Name ru"
                />
              </VCol>


              <!-- 👉 Role -->
              <VCol cols="12">
                <VSelect
                    multiple
                    persistent-hint
                    v-model="permission"
                    label="Select permission"
                    :rules="[requiredValidator]"
                    :items="permissions"
                    item-title="name_ru"
                    item-value="id"
                />
              </VCol>


              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                    type="submit"
                    class="me-3"
                >
                  Submit
                </VBtn>
                <VBtn
                    type="reset"
                    variant="tonal"
                    color="secondary"
                    @click="closeNavigationDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
