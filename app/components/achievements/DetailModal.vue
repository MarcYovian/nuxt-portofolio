<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean
    achievement: {
        id: number
        title: string
        organization: string
        date: string
        description: string | null
        image?: string
        type: string | null
        credentialId?: string | null
        credentialUrl?: string | null
    } | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>

<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-3xl' }">
        <template #content>
            <div v-if="achievement"
                class="relative overflow-hidden bg-zinc-900 rounded-lg border border-zinc-800 max-h-[85vh] overflow-y-auto flex flex-col">
                <!-- Header Image -->
                <div v-if="achievement.image"
                    class="relative h-48 sm:h-64 md:h-80 w-full shrink-0 overflow-hidden bg-zinc-950 border-b border-zinc-800/50">
                    <img :src="achievement.image" :alt="achievement.title" class="w-full h-full object-cover" />
                    <div
                        class="absolute inset-0 bg-linear-to-t from-zinc-900 via-transparent to-transparent pointer-events-none" />
                </div>

                <!-- Content -->
                <div class="p-6 sm:p-8 space-y-6">
                    <!-- Header Info -->
                    <div class="space-y-4">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="text-primary-400 font-mono text-sm mb-2">{{ achievement.organization }}
                                </div>
                                <h2 class="text-2xl sm:text-3xl font-bold text-white">{{ achievement.title }}</h2>
                            </div>
                            <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-mr-2"
                                @click="isOpen = false" />
                        </div>

                        <div class="flex flex-wrap gap-3">
                            <UBadge color="neutral" variant="subtle" icon="i-lucide-calendar">
                                {{ achievement.date }}
                            </UBadge>
                            <UBadge v-if="achievement.type" color="primary" variant="subtle" class="capitalize">
                                {{ achievement.type }}
                            </UBadge>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="prose prose-invert prose-zinc max-w-none">
                        <p class="text-zinc-300 leading-relaxed">
                            {{ achievement.description }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div v-if="achievement.credentialUrl" class="pt-6 border-t border-zinc-800 flex justify-end">
                        <UButton :to="achievement.credentialUrl" target="_blank" color="primary" variant="solid"
                            icon="i-lucide-external-link">
                            View Credential
                        </UButton>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>
