<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { kebabCase } from 'scule'

const props = defineProps<{
    item: any
}>()

const toast = useToast()
const emit = defineEmits(['success'])
const open = defineModel<boolean>('open')

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional().nullable(),
    display_order: z.number().optional(),
    is_active: z.boolean().default(true)
})

type Schema = z.output<typeof schema>

const loading = ref(false)
const state = reactive<Partial<Schema>>({})

watch(() => props.item, (newItem) => {
    if (newItem) {
        state.name = newItem.name
        state.slug = newItem.slug
        state.description = newItem.description
        state.display_order = newItem.display_order
        state.is_active = newItem.is_active
    }
}, { immediate: true })

// Auto-generate slug from name if slug is empty (though usually editing implies it exists)
// Auto-generate slug from name
watch(() => state.name, (newName) => {
    if (newName) {
        state.slug = newName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    } else {
        state.slug = undefined
    }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (!props.item?.id) return

    loading.value = true
    try {
        await $fetch(`/api/project-categories/${props.item.id}`, {
            method: 'PUT',
            body: event.data
        })

        toast.add({
            title: 'Success',
            description: 'Project category updated successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to update category',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Edit category" description="Update project category details">
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" class="w-full" placeholder="e.g. Web Development" />
                </UFormField>

                <UFormField label="Slug" name="slug" required>
                    <UInput v-model="state.slug" class="w-full" placeholder="e.g. web-development" />
                </UFormField>

                <UFormField label="Description" name="description">
                    <UTextarea v-model="state.description" class="w-full" placeholder="Category description..." />
                </UFormField>

                <UFormField label="Display Order" name="display_order">
                    <UInput v-model.number="state.display_order" type="number" class="w-full" />
                </UFormField>

                <UFormField label="Active Status" name="is_active">
                    <UCheckbox v-model="state.is_active" label="Is Active" />
                </UFormField>

                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Save changes" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
