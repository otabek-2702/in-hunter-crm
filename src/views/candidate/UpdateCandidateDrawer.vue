<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import {
  requiredValidator,
} from '@validators'
import {nextTick, ref, watch, watchEffect} from "vue";
import AppDrawerHeaderSection from "@core/components/AppDrawerHeaderSection.vue";
import axios from "@axios";

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },

  id:{
    required: true
  }
})

const languages_list = ref([])

const emit = defineEmits([
  'update:isDrawerOpen',
  'candidateData',
])

const isFormValid = ref(false)
const refForm = ref()
const full_name = ref('')
const phone_number = ref('')
const age = ref('')
const address = ref('')
const gender = ref('man')
const positive_skills = ref('')
const apps_text = ref('')
const apps = ref('')
const languages = ref([])


// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('candidateData', {
        id: props.id,
        full_name: full_name.value,
        age: age.value,
        languages: languages.value,
        positive_skills: positive_skills.value,
        apps_text: apps_text.value,
        apps: apps.value,
        gender: gender.value,
        phone_number: phone_number.value,
        address: address.value,
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
}

const fetchLanguages = async function(){
  const r = await axios.get('/languages')
  languages_list.value = r.data
}

watchEffect(fetchLanguages)

watch( () => props.isDrawerOpen, async (newVal) => {
  if (newVal) {
    let candidate =  await axios.get('/candidates/' + props.id)

    full_name.value =  candidate.data.full_name
    address.value =  candidate.data.address
    gender.value =  candidate.data.gender_slug
    age.value =  candidate.data.age
    phone_number.value =  candidate.data.phone_number
    positive_skills.value =  candidate.data.positive_skills
    apps.value =  candidate.data.apps
    apps_text.value =  candidate.data.apps_text



    languages.value = candidate.data.languages.split(',')              // Разбиваем строку по запятой
        .filter(Boolean)
        .map(Number);
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
        title="Add Candidate"
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
                    v-model="full_name"
                    :rules="[requiredValidator]"
                    label="Full name"
                />
              </VCol>

              <!-- 👉 Full name -->
              <VCol cols="12">
                <VTextField
                    v-model="phone_number"
                    :rules="[requiredValidator]"
                    label="Phone number"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                    type="number"
                    v-model="age"
                    :rules="[requiredValidator]"
                    label="Age"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                    v-model="address"
                    :rules="[requiredValidator]"
                    label="Address"
                />
              </VCol>

              <VCol cols="12">
                <VRadioGroup
                    v-model="gender"
                    inline
                    :rules="[requiredValidator]"
                >
                  <VRadio
                      label="Man"
                      value="man"
                      density="compact"
                  />
                  <VRadio
                      label="Woman"
                      value="woman"
                      density="compact"
                  />
                </VRadioGroup>
              </VCol>

              <VCol cols="12">
                <VTextField
                    v-model="positive_skills"
                    :rules="[requiredValidator]"
                    label="Positive skills"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                    v-model="apps_text"
                    :rules="[requiredValidator]"
                    label="Apps text"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                    v-model="apps"
                    :rules="[requiredValidator]"
                    label="Apps"
                />
              </VCol>


              <VCol cols="12">
                <VSelect
                    multiple
                    persistent-hint
                    v-model="languages"
                    label="Select language"
                    :rules="[requiredValidator]"
                    :items="languages_list"
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
