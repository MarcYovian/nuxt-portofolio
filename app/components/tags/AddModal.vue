<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const emit = defineEmits(['success'])

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    color: z.string().optional()
})

type Schema = z.output<typeof schema>

const open = ref(false)
const loading = ref(false)

const state = reactive<Partial<Schema>>({
    name: undefined,
    slug: undefined,
    color: '#000000'
})

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
        await $fetch('/api/tags', {
            method: 'POST',
            body: event.data
        })

        toast.add({
            title: 'Success',
            description: 'Tag created successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')

        // Reset form
        Object.assign(state, {
            name: undefined,
            slug: undefined,
            color: '#000000'
        })
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to create tag',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
const props = defineProps<{
    hideTrigger?: boolean
}>()

defineExpose({
    open
})
</script>

<template>
    <UModal v-model:open="open" title="New tag" description="Add a new tag" :ui="{ content: 'z-9999 sm:max-w-md' }">
        <UButton v-if="!hideTrigger" label="New tag" icon="i-lucide-plus" />

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
                    <UButton label="Create Tag" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
