<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
    item: any
}>()

const toast = useToast()
const emit = defineEmits(['success'])
const open = defineModel<boolean>('open')

const MAX_FILE_SIZE = 1024 * 1024 // 1MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const schema = z.object({
    institution: z.string().min(1, 'Institution name is required'),
    degree: z.string().min(1, 'Degree is required'),
    field_of_study: z.string().optional(),
    location: z.string().optional(),
    institution_website: z.string().optional().nullable(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean().default(false),
    is_active: z.boolean().default(true),
    gpa: z.number().optional().nullable(),
    max_gpa: z.number().default(4.0).optional().nullable(),
    honors: z.array(z.string()).default([]),
    activities: z.array(z.string()).default([]),
    description: z.string().optional(),
    image: z.instanceof(File, {
        message: 'Please select an image file.'
    })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `The image is to large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}`
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: `Please upload a valid image file (${ACCEPTED_IMAGE_TYPES.join(', ')}).`
        })
        .optional()
        .nullable(),
}).refine((data) => {
    if (data.gpa && data.max_gpa && data.gpa > data.max_gpa) {
        return false;
    }
    return true;
}, {
    message: "GPA cannot be greater than Max GPA",
    path: ["gpa"]
});

type Schema = z.output<typeof schema>

const loading = ref(false)
const honorInput = ref('')
const activityInput = ref('')

const state = reactive<Partial<Schema>>({
    institution: undefined,
    degree: undefined,
    field_of_study: undefined,
    location: undefined,
    institution_website: undefined,
    start_date: undefined,
    end_date: undefined,
    is_current: false,
    is_active: true,
    gpa: undefined,
    max_gpa: 4.0,
    honors: [],
    activities: [],
    description: undefined,
    image: undefined
})

watch(() => props.item, (newVal) => {
    if (newVal) {
        state.institution = newVal.institution
        state.degree = newVal.degree
        state.field_of_study = newVal.field_of_study
        state.location = newVal.location
        state.institution_website = newVal.institution_website
        state.start_date = newVal.start_date
        state.end_date = newVal.end_date
        state.is_current = newVal.is_current
        state.is_active = newVal.is_active
        state.gpa = newVal.gpa
        state.max_gpa = newVal.max_gpa
        state.honors = newVal.honors || []
        state.activities = newVal.activities || []
        state.description = newVal.description
    }
}, { immediate: true })

// Logic: if checkbox "I am currently studying here" checked (is_current = true), in input "end_date" must be disable and set value with "null".
watch(() => state.is_current, (newVal) => {
    if (newVal) {
        state.end_date = null
    }
})

// Logic: but if "end_date" has a value, then "is_current" automatically become "false"
watch(() => state.end_date, (newVal) => {
    if (newVal) {
        state.is_current = false
    }
})

function addHonor() {
    if (honorInput.value.trim()) {
        if (!state.honors) state.honors = []
        state.honors.push(honorInput.value.trim())
        honorInput.value = ''
    }
}

function removeHonor(index: number) {
    if (state.honors) {
        state.honors.splice(index, 1)
    }
}

function addActivity() {
    if (activityInput.value.trim()) {
        if (!state.activities) state.activities = []
        state.activities.push(activityInput.value.trim())
        activityInput.value = ''
    }
}

function removeActivity(index: number) {
    if (state.activities) {
        state.activities.splice(index, 1)
    }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
        const formData = new FormData()

        if (event.data.image) {
            formData.append('image', event.data.image)
        }

        formData.append('institution', event.data.institution)
        formData.append('degree', event.data.degree)
        formData.append('start_date', event.data.start_date)
        formData.append('is_current', String(event.data.is_current))
        formData.append('is_active', String(event.data.is_active))

        if (event.data.field_of_study) formData.append('field_of_study', event.data.field_of_study)
        if (event.data.location) formData.append('location', event.data.location)
        if (event.data.institution_website) formData.append('institution_website', event.data.institution_website)
        if (event.data.end_date) formData.append('end_date', event.data.end_date)
        if (event.data.description) formData.append('description', event.data.description)
        if (event.data.gpa) formData.append('gpa', String(event.data.gpa))
        if (event.data.max_gpa) formData.append('max_gpa', String(event.data.max_gpa))

        if (event.data.honors && event.data.honors.length > 0) {
            formData.append('honors', JSON.stringify(event.data.honors))
        } else {
            formData.append('honors', JSON.stringify([]))
        }

        if (event.data.activities && event.data.activities.length > 0) {
            formData.append('activities', JSON.stringify(event.data.activities))
        } else {
            formData.append('activities', JSON.stringify([]))
        }

        await $fetch(`/api/educations/${props.item.id}`, {
            method: 'PUT',
            body: formData
        })

        toast.add({
            title: 'Success',
            description: 'Education updated successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to update education',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Edit Education" description="Update education details"
        :ui="{ content: 'sm:max-w-3xl' }">
        <slot />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Institution Name" name="institution" required>
                        <UInput v-model="state.institution" class="w-full" placeholder="e.g. Harvard University" />
                    </UFormField>

                    <UFormField label="Degree" name="degree" required>
                        <UInput v-model="state.degree" class="w-full" placeholder="e.g. Bachelor of Science" />
                    </UFormField>

                    <UFormField label="Field of Study" name="field_of_study">
                        <UInput v-model="state.field_of_study" class="w-full" placeholder="e.g. Computer Science" />
                    </UFormField>

                    <UFormField label="Location" name="location">
                        <UInput v-model="state.location" icon="i-lucide-map-pin" class="w-full"
                            placeholder="e.g. Cambridge, MA" />
                    </UFormField>

                    <UFormField label="Start Date" name="start_date" required>
                        <UInput v-model="state.start_date" type="date" class="w-full" />
                    </UFormField>

                    <UFormField label="End Date" name="end_date">
                        <UInput v-model="state.end_date" type="date" class="w-full" :disabled="state.is_current" />
                    </UFormField>

                    <div class="col-span-full">
                        <UCheckbox v-model="state.is_current" label="I am currently studying here" />
                    </div>

                    <UFormField label="GPA" name="gpa">
                        <UInput v-model="state.gpa" type="number" step="0.01" class="w-full" placeholder="e.g. 3.8" />
                    </UFormField>

                    <UFormField label="Max GPA" name="max_gpa">
                        <UInput v-model="state.max_gpa" type="number" step="0.01" class="w-full"
                            placeholder="e.g. 4.0" />
                    </UFormField>

                    <UFormField label="Honors" name="honors" class="col-span-full">
                        <div class="flex gap-2 mb-2">
                            <UInput v-model="honorInput" class="flex-1" placeholder="Type honor and press Enter"
                                @keydown.enter.prevent="addHonor" />
                            <UButton icon="i-lucide-plus" color="neutral" variant="soft" @click="addHonor" />
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="(honor, index) in state.honors" :key="index" color="primary"
                                variant="subtle">
                                {{ honor }}
                                <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="ml-1 -mr-1"
                                    @click="removeHonor(index)" />
                            </UBadge>
                        </div>
                    </UFormField>

                    <UFormField label="Activities" name="activities" class="col-span-full">
                        <div class="flex gap-2 mb-2">
                            <UInput v-model="activityInput" class="flex-1" placeholder="Type activity and press Enter"
                                @keydown.enter.prevent="addActivity" />
                            <UButton icon="i-lucide-plus" color="neutral" variant="soft" @click="addActivity" />
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="(activity, index) in state.activities" :key="index" color="primary"
                                variant="subtle">
                                {{ activity }}
                                <UButton icon="i-lucide-x" size="xs" color="primary" variant="ghost" class="ml-1 -mr-1"
                                    @click="removeActivity(index)" />
                            </UBadge>
                        </div>
                    </UFormField>

                    <UFormField label="Institution Website" name="institution_website">
                        <UInput v-model="state.institution_website" icon="i-lucide-link" class="w-full"
                            placeholder="https://example.com" />
                    </UFormField>

                    <UFormField label="Description" name="description" class="col-span-full">
                        <UTextarea v-model="state.description" class="w-full"
                            placeholder="Describe your activities and societies..." :rows="4" />
                    </UFormField>

                    <!-- Image Upload -->
                    <UFormField label="Institution Logo" name="image" class="col-span-full">
                        <div v-if="props.item.institution_logo && !state.image" class="mb-2">
                            <img :src="props.item.institution_logo" alt="Current Logo"
                                class="h-16 w-16 object-cover rounded" />
                        </div>
                        <UFileUpload icon="i-lucide-image" label="Drop institution logo here"
                            description="PNG, JPG or GIF. 1MB max." accept="image/*" class="w-full"
                            v-model="state.image" />
                    </UFormField>

                    <div class="col-span-full">
                        <UCheckbox v-model="state.is_active" label="Is Active (Visible on public site)" />
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Save Changes" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
