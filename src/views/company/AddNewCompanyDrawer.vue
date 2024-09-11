<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import { requiredValidator } from '@validators';
import { nextTick, ref, watchEffect } from 'vue';
import AppDrawerHeaderSection from '@core/components/AppDrawerHeaderSection.vue';
import axios from '@axios';
import { toast } from 'vue3-toastify';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['update:isDrawerOpen', 'fetchDatas']);

const isFetching = ref(false);
const isFormValid = ref(false);
const isValidLogin = ref(true);
const refForm = ref();
const roles_list = ref([]);
const name = ref('');
const login = ref('');
const password = ref('');
const role_id = ref('');

// 👉 drawer close
const closeNavigationDrawer = () => {
  nextTick(() => {
    emit('update:isDrawerOpen', false);
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

const onSubmit = () => {
  isFetching.value = true;
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        const response = await axios.post('/users', {
          name: name.value,
          login: login.value,
          password: password.value,
          role_id: role_id.value,
        });

        if (response.status == 201) {
          emit('fetchDatas');

          closeNavigationDrawer();
        }
      } catch (error) {
        if (error.response.data.message == 'The login has already been taken.') {
          toast('Ushbu login bant.', {
            theme: 'auto',
            type: 'error',
            dangerouslyHTMLString: true,
          });
        } else {
          toast(error.response.data.message, {
            theme: 'auto',
            type: 'error',
            dangerouslyHTMLString: true,
          });
        }
        isValidLogin.value = false;
      } 
    }
  });
  isFetching.value = false;
};

watchEffect(login, () => (isValidLogin.value = true));

const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val);
};

const fetchRoles = async function () {
  const r = await axios.get('/roles');
  r.data.roles.shift();
  roles_list.value = r.data.roles;
};

watchEffect(fetchRoles);
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
    <AppDrawerHeaderSection title="Add Employee" @cancel="closeNavigationDrawer" />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->

          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
            :disabled="isFetching"
          >
            <VRow>
              <VCol cols="12">
                <VTextField v-model="name" :rules="[requiredValidator]" label="Name" />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="login"
                  :rules="[requiredValidator, () => isValidLogin]"
                  label="Login"
                />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="password" :rules="[requiredValidator]" label="Password" />
              </VCol>
              <VCol cols="12">
                <VSelect
                  persistent-hint
                  v-model="role_id"
                  label="Select role"
                  :rules="[requiredValidator]"
                  :items="roles_list"
                  item-title="name_ru"
                  item-value="id"
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn :loading="isFetching" :disabled="isFetching" type="submit" class="me-3">
                  Submit
                </VBtn>
                <VBtn type="reset" variant="tonal" color="secondary" @click="closeNavigationDrawer">
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
