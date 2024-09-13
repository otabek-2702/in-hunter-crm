<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import { requiredValidator } from '@validators';
import { nextTick, ref, watch, watchEffect } from 'vue';
import AppDrawerHeaderSection from '@core/components/AppDrawerHeaderSection.vue';
import axios from '@axios';
import { toast } from 'vue3-toastify';

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },

  id: {
    required: true,
  },
});

const emit = defineEmits(['update:isDrawerOpen', 'fetchEmployees']);
const isFetching = ref(false);
const isFormValid = ref(false);
const refForm = ref();
const roles_list = ref([]);
const name = ref('');
const login = ref('');
const password = ref('');
const role_id = ref('');

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false);
  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};
const onSubmit = () => {
  refForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      isFetching.value = true;
      try {
        let body = {
          name: name.value,
          login: login.value,
          role_id: role_id.value,
        };
        if (password.value) {
          body.password = password.value;
        }

        const response = await axios.patch(`/users/${props.id}`, body);

        if (response.status == 200) {
          emit('fetchEmployees');

          toast('Успешно', {
            theme: 'auto',
            type: 'success',
            dangerouslyHTMLString: true,
          });
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
          toast(error?.message, {
            theme: 'auto',
            type: 'error',
            dangerouslyHTMLString: true,
          });
        }
      } finally {
        isFetching.value = false;
      }
    }
  });
};

const handleDrawerModelValueUpdate = (val) => {
  emit('update:isDrawerOpen', val);
};

const fetchUser = async () => {
  try {
    const user = await axios.get(`/users/${props.id}`);
    name.value = user.data.name;
    login.value = user.data.login;
    role_id.value = user.data.role.id;
  } catch (error) {
    toast(error?.message, {
      theme: 'auto',
      type: 'error',
      dangerouslyHTMLString: true,
    });
  }
};

watch(
  () => props.isDrawerOpen,
  (newVal) => newVal && fetchUser(),
);

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
    <AppDrawerHeaderSection title="Update Employee" @cancel="closeNavigationDrawer" />

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
                <VTextField v-model="name" label="Name" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="login" label="Login" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="password" label="Password" />
              </VCol>
              <VCol cols="12">
                <VSelect
                  persistent-hint
                  v-model="role_id"
                  label="Select role"
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
