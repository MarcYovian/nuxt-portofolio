<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const emit = defineEmits(['success'])

const props = defineProps<{
    hideTrigger?: boolean
}>()

const open = ref(false)

defineExpose({
    open
})

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Description is required'),
    price_range: z.string().optional(),
    features: z.array(z.string()).default([]),
    icon: z.string().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().default(true)
})

type Schema = z.output<typeof schema>

const loading = ref(false)
const newFeature = ref('')

const state = reactive<Partial<Schema>>({
    title: undefined,
    slug: undefined,
    description: undefined,
    price_range: undefined,
    features: [],
    icon: undefined,
    display_order: 0,
    is_active: true
})

// Auto-generate slug from title
watch(() => state.title, (newTitle) => {
    if (newTitle) {
        state.slug = newTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    } else {
        state.slug = undefined
    }
})

function addFeature() {
    if (newFeature.value.trim()) {
        state.features = [...(state.features || []), newFeature.value.trim()]
        newFeature.value = ''
    }
}

function removeFeature(index: number) {
    if (state.features) {
        state.features = state.features.filter((_, i) => i !== index)
    }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
        const response = await $fetch('/api/services', {
            method: 'POST',
            body: event.data
        })

        toast.add({
            title: 'Success',
            description: 'Service created successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success', response)

        // Reset form
        state.title = undefined
        state.slug = undefined
        state.description = undefined
        state.price_range = undefined
        state.features = []
        state.icon = undefined
        state.display_order = 0
        state.is_active = true
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to create service',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="New service" description="Add a new service"
        :ui="{ content: 'z-9999 sm:max-w-lg' }">
        <UButton v-if="!hideTrigger" label="New service" icon="i-lucide-plus" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Title" name="title" required>
                    <UInput v-model="state.title" class="w-full" placeholder="e.g. Web Development" />
                </UFormField>

                <UFormField label="Slug" name="slug" required>
                    <UInput v-model="state.slug" class="w-full" placeholder="e.g. web-development" />
                </UFormField>

                <UFormField label="Description" name="description" required>
                    <UTextarea v-model="state.description" class="w-full" placeholder="Service description..." />
                </UFormField>

                <UFormField label="Price Range" name="price_range">
                    <UInput v-model="state.price_range" class="w-full" placeholder="e.g. Start from $500" />
                </UFormField>

                <UFormField label="Icon" name="icon" help="Lucide icon name (e.g. i-lucide-code)">
                    <UInput v-model="state.icon" class="w-full" placeholder="i-lucide-code" />
                </UFormField>

                <UFormField label="Features" name="features">
                    <div class="space-y-2">
                        <div class="flex gap-2">
                            <UInput v-model="newFeature" class="flex-1" placeholder="Add a feature..."
                                @keydown.enter.prevent="addFeature" />
                            <UButton icon="i-lucide-plus" color="neutral" variant="subtle" @click="addFeature" />
                        </div>
                        <div v-if="state.features?.length" class="flex flex-wrap gap-2">
                            <UBadge v-for="(feature, index) in state.features" :key="index" variant="subtle"
                                color="neutral">
                                {{ feature }}
                                <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost"
                                    class="-mr-1 ml-1 p-0.5" @click="removeFeature(index)" />
                            </UBadge>
                        </div>
                    </div>
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
