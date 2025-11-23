<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth'
})

useSeoMeta({
    title: 'Forgot Password - MarcYovian',
    description: 'Reset your password'
})

const toast = useToast()
const isLoading = ref(false)
const supabase = useSupabaseClient()

// Schema Validasi
const schema = z.object({
    email: z.string({ error: 'Email must be provided' })
        .min(1, 'Email must be provided')
        .email('Email must be a valid email')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    email: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isLoading.value = true

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(event.data.email)

        if (error) throw error

        toast.add({
            title: 'Email Terkirim',
            description: 'Silakan cek inbox email Anda untuk instruksi selanjutnya.',
            color: 'success',
            icon: 'i-lucide-mail-check'
        })

        state.email = ''

    } catch (error: any) {
        toast.add({
            title: 'Gagal Reset Password',
            description: error.message || 'Terjadi kesalahan, silakan coba lagi.',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header Card -->
        <div class="text-center">
            <div
                class="inline-flex items-center justify-center p-3 bg-zinc-800/50 rounded-xl mb-4 ring-1 ring-zinc-700/50 shadow-inner">
                <UIcon name="i-lucide-key-round" class="size-6 text-primary-400" />
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
            <p class="text-sm text-zinc-400">
                No worries, we'll send you reset instructions.
            </p>
        </div>

        <!-- Form -->
        <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
            <UFormField label="Email" name="email">
                <UInput v-model="state.email" type="email" placeholder="Enter your email" icon="i-lucide-mail" size="lg"
                    class="w-full" autocomplete="email" />
            </UFormField>

            <UButton type="submit" size="lg" block :loading="isLoading" color="primary" variant="solid"
                class="font-bold">
                Reset Password
            </UButton>
        </UForm>

        <!-- Back to Login -->
        <div class="text-center">
            <UButton to="/auth/login" variant="ghost" color="neutral" size="sm" icon="i-lucide-arrow-left"
                label="Back to Login" class="text-zinc-400 hover:text-white" />
        </div>
    </div>
</template>