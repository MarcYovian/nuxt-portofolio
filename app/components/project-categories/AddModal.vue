<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { kebabCase } from 'scule'

const toast = useToast()
const emit = defineEmits(['success'])

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().default(true)
})

type Schema = z.output<typeof schema>

const open = ref(false)
const loading = ref(false)

const state = reactive<Partial<Schema>>({
    name: undefined,
    slug: undefined,
    description: undefined,
    display_order: 0,
    is_active: true
})

// Auto-generate slug from name
watch(() => state.name, (newName) => {
    if (newName) {
        state.slug = newName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    } else {
        state.slug = undefined
    }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
        await $fetch('/api/project-categories', {
            method: 'POST',
            body: event.data
        })

        toast.add({
            title: 'Success',
            description: 'Project category created successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')

        // Reset form
        state.name = undefined
        state.slug = undefined
        state.description = undefined
        state.display_order = 0
        state.is_active = true
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to create category',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="New category" description="Add a new project category">
        <UButton label="New category" icon="i-lucide-plus" />

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
                    <UButton label="Create" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
