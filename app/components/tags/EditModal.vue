<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
    item: any
}>()

const open = defineModel<boolean>('open')
const emit = defineEmits(['success'])
const toast = useToast()

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    color: z.string().optional()
})

type Schema = z.output<typeof schema>

const loading = ref(false)
const state = reactive<Partial<Schema>>({
    name: undefined,
    slug: undefined,
    color: undefined
})

// Sync state when modal opens
watch(() => open.value, (isOpen) => {
    if (isOpen && props.item) {
        state.name = props.item.name
        state.slug = props.item.slug
        state.color = props.item.color || '#000000'
    }
})

watch(() => state.name, (newName) => {
    if (newName && newName !== props.item?.name) {
        state.slug = newName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (!props.item?.id) return

    loading.value = true
    try {
        await $fetch(`/api/tags/${props.item.id}`, {
            method: 'PUT',
            body: event.data
        })

        toast.add({
            title: 'Success',
            description: 'Tag updated successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to update tag',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Edit tag" description="Update tag details" :ui="{ content: 'z-9999 sm:max-w-md' }">
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Name" name="name" required>
                    <UInput v-model="state.name" class="w-full" placeholder="Tag Name" autofocus />
                </UFormField>

                <UFormField label="Slug" name="slug" required>
                    <UInput v-model="state.slug" class="w-full" placeholder="tag-slug" />
                </UFormField>

                <UFormField label="Color" name="color">
                    <div class="flex gap-2">
                        <UInput v-model="state.color" class="flex-1" placeholder="#000000" />
                        <input type="color" v-model="state.color"
                            class="h-8 w-8 rounded cursor-pointer border border-zinc-700 p-0 overflow-hidden" />
                    </div>
                </UFormField>

                <div class="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Save Changes" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
