<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt Dashboard Template'
const description = 'A professional dashboard template built with Nuxt UI, featuring multiple pages, data visualization, and comprehensive management capabilities for creating powerful admin interfaces.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  twitterCard: 'summary_large_image'
})

// --- Logic Splash Screen ---
const isLoading = ref(true)

onMounted(() => {
  // Kita cek apakah semua gambar sudah ter-load (opsional, tapi bagus untuk memastikan aset berat sudah siap)
  // atau kita bisa gunakan simple timeout untuk memastikan transisi mulus

  // Opsi 1: Simple Timeout (agar animasi loading sempat terlihat)
  setTimeout(() => {
    isLoading.value = false
  }, 800)

  // Opsi 2: (Advanced) Tunggu window load event sepenuhnya
  /* window.onload = () => {
     isLoading.value = false
  }
  */
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <!-- Splash Screen Overlay -->
    <Transition name="splash">
      <div v-if="isLoading" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950">
        <!-- Animated Logo/Icon -->
        <div class="relative mb-4">
          <div class="absolute inset-0 bg-primary-500/30 blur-2xl rounded-full animate-pulse" />
          <UIcon name="i-lucide-code" class="size-20 text-primary-500 relative z-10 animate-bounce" />
        </div>

        <!-- Loading Text / Spinner -->
        <div class="flex items-center gap-2 text-zinc-400 font-mono text-sm">
          <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
          <span>Initializing...</span>
        </div>
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
/* Transisi Fade Out untuk Splash Screen */
.splash-enter-active,
.splash-leave-active {
  transition: opacity 0.6s ease-in-out, filter 0.6s ease-in-out;
}

.splash-enter-from,
.splash-leave-to {
  opacity: 0;
  filter: blur(10px);
  /* Efek blur saat menghilang */
}
</style>