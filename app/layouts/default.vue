<script setup lang="ts">
const colorMode = useColorMode()

// Force dark mode when using the default (guest) layout
// This ensures Nuxt UI components match your hardcoded bg-zinc-950 background
onMounted(() => {
  colorMode.preference = 'dark'
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans relative overflow-hidden">
    <!-- Spotlight Effect -->
    <SpotlightEffect />

    <!-- Dynamic Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="relative z-10">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: rgb(24 24 27);
}

::-webkit-scrollbar-thumb {
  background: rgb(63 63 70);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(82 82 91);
}
</style>