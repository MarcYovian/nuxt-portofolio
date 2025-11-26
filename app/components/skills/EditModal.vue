<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  item?: {
    id: number
    category_id: number
    name: string
    icon: string | null
    proficiency_level: number | null
    years_of_experience: number | null
    display_order: number | null
    is_active: boolean | null
  } | null
}>()

const toast = useToast()
const emit = defineEmits(['success'])

const open = defineModel<boolean>('open', { default: false })
const loading = ref(false)
const loadingCategories = ref(false)
const categories = ref<Array<{ value: number; label: string; icon: string }>>([])

const schema = z.object({
  category_id: z.number({ message: 'Category is required' }),
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  proficiency_level: z.number().min(0).max(100).optional(),
  years_of_experience: z.number().min(0).optional(),
  display_order: z.number().optional(),
  is_active: z.boolean().default(true)
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  category_id: undefined,
  name: undefined,
  icon: undefined,
  proficiency_level: 0,
  years_of_experience: 0,
  display_order: 0,
  is_active: true
})

// Fetch categories ketika modal dibuka
async function fetchCategories() {
  loadingCategories.value = true
  try {
    const { data: skillCategories, status } = await useFetch('/api/skill-categories', {
      key: 'skill-categories',
      transform: (data: { id: number; name: string; icon: string }[]) => {
        return data?.map(category => ({
          value: category.id,
          label: category.name,
          icon: category.icon
        }))
      }
    })

    categories.value = skillCategories.value || []
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: 'Failed to load categories',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

// Watch item changes dan populate form
watch(() => props.item, (newItem) => {
  if (newItem) {
    state.category_id = newItem.category_id
    state.name = newItem.name
    state.icon = newItem.icon || undefined
    state.proficiency_level = newItem.proficiency_level || 0
    state.years_of_experience = newItem.years_of_experience || 0
    state.display_order = newItem.display_order || 0
    state.is_active = newItem.is_active ?? true
  }
}, { immediate: true })

// Watch modal open state
watch(open, (isOpen) => {
  if (isOpen) {
    fetchCategories()
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.item?.id) return

  loading.value = true
  try {
    await $fetch(`/api/skills/${props.item.id}`, {
      method: 'PUT',
      body: {
        category_id: event.data.category_id,
        name: event.data.name,
        icon: event.data.icon,
        proficiency_level: event.data.proficiency_level,
        years_of_experience: event.data.years_of_experience,
        display_order: event.data.display_order,
        is_active: event.data.is_active
      }
    })

    toast.add({
      title: 'Success',
      description: 'Skill updated successfully',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    open.value = false
    emit('success')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || error.message || 'Failed to update skill',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Edit skill" description="Update skill details">
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Category" name="category_id" required>
          <USelectMenu v-model="state.category_id" :items="categories" :loading="loadingCategories" value-key="value"
            option-key="label" placeholder="Select a category" searchable searchable-placeholder="Search categories..."
            class="w-full">
            <template #empty>
              <div class="text-center py-4 text-sm text-zinc-400">
                {{ loadingCategories ? 'Loading categories...' : 'No categories found' }}
              </div>
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" class="w-full" placeholder="e.g. Vue.js, Python" />
        </UFormField>

        <UFormField label="Icon" name="icon" help="Lucide icon name (e.g. i-lucide-code)">
          <UInput v-model="state.icon" class="w-full" placeholder="i-lucide-code" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Proficiency (%)" name="proficiency_level">
            <UInput v-model.number="state.proficiency_level" type="number" min="0" max="100" class="w-full" />
          </UFormField>

          <UFormField label="Years of Experience" name="years_of_experience">
            <UInput v-model.number="state.years_of_experience" type="number" step="0.1" min="0" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Display Order" name="display_order">
          <UInput v-model.number="state.display_order" type="number" class="w-full" />
        </UFormField>

        <UFormField label="Active Status" name="is_active">
          <UCheckbox v-model="state.is_active" label="Is Active" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading" @click="open = false" />
          <UButton label="Save" color="primary" variant="solid" type="submit" :loading="loading"
            :disabled="loadingCategories" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>