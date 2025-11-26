<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Database } from '~/types/database'

const props = defineProps<{
    item?: {
        id: number
        name: string
        icon: string | null
        display_order: number | null
        is_active: boolean | null
    } | null
}>()

const supabase = useSupabaseClient<Database>()
const toast = useToast()
const emit = defineEmits(['success', 'update:open'])

const open = defineModel<boolean>('open')

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    icon: z.string().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().default(true)
})

type Schema = z.output<typeof schema>

const loading = ref(false)

const state = reactive<Partial<Schema>>({
    name: undefined,
    icon: undefined,
    display_order: 0,
    is_active: true
})

watch(() => props.item, (newItem) => {
    if (newItem) {
        state.name = newItem.name
        state.icon = newItem.icon || undefined
        state.display_order = newItem.display_order || 0
        state.is_active = newItem.is_active ?? true
    }
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (!props.item?.id) return

    loading.value = true
    try {
        await $fetch(`/api/skill-categories/${props.item.id}`, {
            method: 'PUT',
            body: {
                name: event.data.name,
                icon: event.data.icon,
                display_order: event.data.display_order,
                is_active: event.data.is_active
            }
        })

        toast.add({ title: 'Success', description: 'Skill category updated successfully', color: 'success' })
        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({ title: 'Error', description: error.message || 'Failed to update category', color: 'error' })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Edit category" description="Update skill category details">
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" class="w-full" placeholder="e.g. Frontend, Backend" />
                </UFormField>

                <UFormField label="Icon" name="icon" help="Lucide icon name (e.g. i-lucide-code)">
                    <UInput v-model="state.icon" class="w-full" placeholder="i-lucide-code" />
                </UFormField>

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
