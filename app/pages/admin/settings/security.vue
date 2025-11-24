<script setup lang="ts">
import * as z from 'zod'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const isLoading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}

async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
  if (!user.value?.email) return

  isLoading.value = true
  try {
    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: event.data.current
    })

    if (signInError) {
      throw new Error('Current password is incorrect')
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: event.data.new
    })

    if (updateError) throw updateError

    toast.add({
      title: 'Success',
      description: 'Password updated successfully',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    // Reset form
    password.current = undefined
    password.new = undefined
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update password',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UPageCard title="Password" description="Confirm your current password before setting a new one." variant="subtle">
    <UForm :schema="passwordSchema" :state="password" :validate="validate" class="flex flex-col gap-4 max-w-xs"
      @submit="onSubmit">
      <UFormField name="current">
        <UInput v-model="password.current" :type="showCurrentPassword ? 'text' : 'password'"
          placeholder="Current password" class="w-full">
          <template #trailing>
            <UButton color="neutral" variant="link" size="sm"
              :icon="showCurrentPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" aria-label="Toggle password visibility"
              @click="showCurrentPassword = !showCurrentPassword" />
          </template>
        </UInput>
      </UFormField>

      <UFormField name="new">
        <UInput v-model="password.new" :type="showNewPassword ? 'text' : 'password'" placeholder="New password"
          class="w-full">
          <template #trailing>
            <UButton color="neutral" variant="link" size="sm"
              :icon="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" aria-label="Toggle password visibility"
              @click="showNewPassword = !showNewPassword" />
          </template>
        </UInput>
      </UFormField>

      <UButton label="Update" class="w-fit" type="submit" :loading="isLoading" />
    </UForm>
  </UPageCard>

  <UPageCard title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-linear-to-tl from-error/10 from-5% to-default">
    <template #footer>
      <UButton label="Delete account" color="error" />
    </template>
  </UPageCard>
</template>
