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
    company: z.string().min(1, 'Company name is required'),
    role: z.string().min(1, 'Role/Job title is required'),
    description: z.string().optional(),
    location: z.string().optional(),
    company_website: z.string().optional().nullable(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean().default(false),
    is_active: z.boolean().default(true),
    employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'apprenticeship']).optional(),
    image: z.custom<File>((val) => {
        if (val instanceof File) return true
        if (typeof val === 'string') return true // Allow existing URL
        return false
    }, 'Please select an image file.')
        .refine((file) => {
            if (file instanceof File) return file.size <= MAX_FILE_SIZE
            return true
        }, {
            message: `The image is to large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}`
        })
        .refine((file) => {
            if (file instanceof File) return ACCEPTED_IMAGE_TYPES.includes(file.type)
            return true
        }, {
            message: `Please upload a valid image file (${ACCEPTED_IMAGE_TYPES.join(', ')}).`
        })
        .optional()
        .nullable(),
    skills: z.array(z.number()).default([])
})

type Schema = z.output<typeof schema>

const loading = ref(false)
const skills = ref<{ value: number; label: string; icon?: string }[]>([])
const loadingSkills = ref(false)
const skillModal = ref<{ open: boolean } | null>(null)

async function fetchSkills() {
    loadingSkills.value = true
    try {
        const data = await $fetch<{ id: number; name: string; icon: string }[]>('/api/skills')

        skills.value = data?.map(skill => ({
            value: skill.id,
            label: skill.name,
            icon: skill.icon
        })) || []
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: 'Failed to load skills',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
        skills.value = []
    } finally {
        loadingSkills.value = false
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        fetchSkills()
        if (props.item) {
            Object.assign(state, {
                company: props.item.company,
                role: props.item.role,
                description: props.item.description,
                location: props.item.location,
                company_website: props.item.company_website,
                start_date: props.item.start_date,
                end_date: props.item.end_date,
                is_current: props.item.is_current,
                is_active: props.item.is_active,
                employment_type: props.item.employment_type,
                image: undefined, // Don't prefill file input, but we can show preview if needed
                skills: props.item.experience_skills?.map((es: any) => es.skill_id) || []
            })
        }
    }
})

async function onSkillCreated(newSkill: any) {
    await fetchSkills()
    if (newSkill && newSkill.id) {
        state.skills = [...(state.skills || []), newSkill.id]
    }
}

const state = reactive<Partial<Schema>>({
    company: undefined,
    role: undefined,
    description: undefined,
    location: undefined,
    company_website: undefined,
    start_date: undefined,
    end_date: undefined,
    is_current: false,
    is_active: true,
    employment_type: 'full-time',
    image: undefined,
    skills: []
})

// Logic: if checkbox "I am currently work here" checked (is_current = true), in input "end_date" must be disable and set value with "null".
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

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
        const formData = new FormData()

        if (event.data.image instanceof File) {
            formData.append('image', event.data.image)
        }

        formData.append('company', event.data.company)
        formData.append('role', event.data.role)
        formData.append('start_date', event.data.start_date)
        formData.append('is_current', String(event.data.is_current))
        formData.append('is_active', String(event.data.is_active))

        if (event.data.description) formData.append('description', event.data.description)
        if (event.data.location) formData.append('location', event.data.location)
        if (event.data.company_website) formData.append('company_website', event.data.company_website)
        if (event.data.end_date) formData.append('end_date', event.data.end_date)
        if (event.data.employment_type) formData.append('employment_type', event.data.employment_type)

        // Append Skills
        if (event.data.skills && event.data.skills.length > 0) {
            formData.append('skills', JSON.stringify(event.data.skills))
        }

        await $fetch(`/api/experiences/${props.item.id}`, {
            method: 'PUT',
            body: formData
        })

        toast.add({
            title: 'Success',
            description: 'Experience updated successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to update experience',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Edit Experience" description="Edit existing work experience"
        :ui="{ content: 'sm:max-w-3xl' }">
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Company Name" name="company" required>
                        <UInput v-model="state.company" class="w-full" placeholder="e.g. Google" />
                    </UFormField>

                    <UFormField label="Job Title / Role" name="role" required>
                        <UInput v-model="state.role" class="w-full" placeholder="e.g. Senior Frontend Engineer" />
                    </UFormField>

                    <UFormField label="Location" name="location">
                        <UInput v-model="state.location" icon="i-lucide-map-pin" class="w-full"
                            placeholder="e.g. Mountain View, CA" />
                    </UFormField>

                    <UFormField label="Employment Type" name="employment_type">
                        <USelectMenu v-model="state.employment_type"
                            :items="['full-time', 'part-time', 'contract', 'freelance', 'internship', 'apprenticeship']"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Start Date" name="start_date" required>
                        <UInput v-model="state.start_date" type="date" class="w-full" />
                    </UFormField>

                    <UFormField label="End Date" name="end_date">
                        <UInput v-model="state.end_date" type="date" class="w-full" :disabled="state.is_current" />
                    </UFormField>

                    <div class="col-span-full">
                        <UCheckbox v-model="state.is_current" label="I am currently working here" />
                    </div>

                    <UFormField label="Company Website" name="company_website">
                        <UInput v-model="state.company_website" icon="i-lucide-link" class="w-full"
                            placeholder="https://example.com" />
                    </UFormField>

                    <UFormField label="Tech Stack / Skills" name="skills" class="col-span-full">
                        <USelectMenu v-model="state.skills" value-key="value" option-key="label" :items="skills"
                            :loading="loadingSkills" placeholder="Select skills" multiple searchable class="w-full">
                            <template #empty="{ searchTerm }">
                                <div class="text-center py-4 text-sm text-zinc-400 flex flex-col items-center gap-2">
                                    <span>No skills found</span>
                                    <UButton v-if="searchTerm" size="xs" color="primary" variant="soft"
                                        label="Create skill"
                                        @click="() => { if (skillModal) skillModal.open = true }" />
                                </div>
                            </template>
                        </USelectMenu>
                    </UFormField>

                    <UFormField label="Description" name="description" class="col-span-full">
                        <UTextarea v-model="state.description" class="w-full"
                            placeholder="Describe your responsibilities..." :rows="4" />
                    </UFormField>

                    <!-- Image Upload -->
                    <UFormField label="Company Logo" name="image" class="col-span-full">
                        <div class="flex items-center gap-4 mb-2" v-if="item?.company_logo">
                            <img :src="item.company_logo"
                                class="h-16 w-16 rounded object-cover border border-zinc-800" />
                            <span class="text-xs text-muted">Current Logo</span>
                        </div>
                        <UFileUpload icon="i-lucide-image" label="Change company logo"
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
                    <UButton label="Update Experience" color="primary" variant="solid" type="submit"
                        :loading="loading" />
                </div>
            </UForm>
        </template>

        <!-- Skills Modal -->
        <SkillsAddModal ref="skillModal" hide-trigger @success="onSkillCreated" />
    </UModal>
</template>
