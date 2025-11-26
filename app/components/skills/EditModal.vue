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
const emit = defineEmits(['success', 'update:open'])

const open = defineModel<boolean>('open')
const { data: categories, refresh: refreshCategories } = await useFetch('/api/skill-categories', {
    default: () => [],
    lazy: true
})

const schema = z.object({
    category_id: z.number({ error: 'Category is required' }),
    name: z.string().min(1, 'Name is required'),
    icon: z.string().optional(),
    proficiency_level: z.number().min(0).max(100).optional(),
    years_of_experience: z.number().min(0).optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().default(true)
})

type Schema = z.output<typeof schema>

const loading = ref(false)

const state = reactive<Partial<Schema>>({
    category_id: undefined,
    name: undefined,
    icon: undefined,
    proficiency_level: 0,
    years_of_experience: 0,
    display_order: 0,
    is_active: true
})

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

watch(open, (isOpen) => {
    if (isOpen) refreshCategories()
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

        toast.add({ title: 'Success', description: 'Skill updated successfully', color: 'success' })
        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({ title: 'Error', description: error.message || 'Failed to update skill', color: 'error' })
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
                    <USelectMenu v-model="state.category_id" :options="categories" value-attribute="id"
                        option-attribute="name" placeholder="Select a category" class="w-full" />
                </UFormField>

                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" class="w-full" placeholder="e.g. Vue.js, Python" />
                </UFormField>

                <UFormField label="Icon" name="icon" help="Lucide icon name (e.g. i-lucide-code)">
                    <UInput v-model="state.icon" class="w-full" placeholder="i-lucide-code" />
                </UFormField>

                <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Proficiency (%)" name="proficiency_level">
                        <UInput v-model="state.proficiency_level" type="number" min="0" max="100" class="w-full" />
                    </UFormField>

                    <UFormField label="Years of Experience" name="years_of_experience">
                        <UInput v-model="state.years_of_experience" type="number" step="0.1" class="w-full" />
                    </UFormField>
                </div>

                <UFormField label="Display Order" name="display_order">
                    <UInput v-model="state.display_order" type="number" class="w-full" />
                </UFormField>

                <UFormField label="Active Status" name="is_active">
                    <UCheckbox v-model="state.is_active" label="Is Active" />
                </UFormField>

                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Save" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
