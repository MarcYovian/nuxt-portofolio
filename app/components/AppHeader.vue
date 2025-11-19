<script setup lang="ts">

const route = useRoute()
const { y } = useScroll(import.meta.client ? window : null)

const isScrolled = computed(() => y.value > 20)

const items = computed(() => [{
  label: 'Home',
  to: '/',
  active: route.path === '/'
}, {
  label: 'About',
  to: '/about',
  active: route.path === '/about'
}, {
  label: 'Achievements',
  to: '/achievements',
  active: route.path === '/achievements'
}, {
  label: 'Projects',
  to: '/projects',
  active: route.path === '/projects'
}, {
  label: 'Contacts',
  to: '/contacts',
  active: route.path === '/contacts'
}])
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
    <!-- Top Header - Full Width -->
    <div v-show="!isScrolled" class="absolute inset-x-0 top-0 transition-all duration-500"
      :class="isScrolled ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="relative">
              <div
                class="absolute inset-0 bg-primary-500/20 blur-xl rounded-full group-hover:bg-primary-500/30 transition-all" />
              <UIcon name="i-lucide-code"
                class="size-10 text-primary-500 relative z-10 group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              MarcYovian
            </span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <UButton v-for="item in items" :key="item.to" :to="item.to" color="neutral" variant="ghost"
              :label="item.label" class="text-zinc-400 hover:text-white transition-colors"
              :class="{ 'text-primary-400': item.active }" />
          </nav>

          <!-- Action Buttons -->
          <div class="hidden md:flex items-center gap-2">
            <UButton icon="i-lucide-github" color="neutral" variant="ghost" href="https://github.com/MarcYovian"
              target="_blank" square />
            <UButton icon="i-lucide-linkedin" color="neutral" variant="ghost"
              href="https://www.linkedin.com/in/marcellinus-yovian-indrastata/" target="_blank" square />
            <UColorModeButton />
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden">
            <UColorModeButton />
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Header - Compact -->
    <div class="absolute inset-x-0 top-2 sm:top-4 transition-all duration-500 px-4"
      :class="isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'">
      <div class="max-w-fit mx-auto">
        <div
          class="bg-zinc-900/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-full border border-zinc-800/50 shadow-2xl shadow-black/50 px-4 py-2">
          <div class="flex items-center gap-2">
            <!-- Compact Logo -->
            <NuxtLink to="/" class="flex items-center gap-2 pr-3 border-r border-zinc-800">
              <UIcon name="i-lucide-code" class="size-6 text-primary-500" />
              <span class="text-sm font-bold hidden sm:block">MY</span>
            </NuxtLink>

            <!-- Compact Navigation -->
            <nav class="flex items-center gap-1">
              <UButton v-for="item in items" :key="item.to" :to="item.to" color="neutral" variant="ghost" size="xs"
                :label="item.label" class="text-zinc-400 hover:text-white transition-colors text-xs"
                :class="{ 'text-primary-400 bg-primary-500/10': item.active }" />
            </nav>

            <!-- Compact Actions -->
            <div class="flex items-center gap-1 pl-3 border-l border-zinc-800">
              <UButton icon="i-lucide-github" color="neutral" variant="ghost" size="xs"
                href="https://github.com/MarcYovian" target="_blank" square />
              <UButton icon="i-lucide-linkedin" color="neutral" variant="ghost" size="xs"
                href="https://www.linkedin.com/in/marcellinus-yovian-indrastata/" target="_blank" square />
              <UColorModeButton size="xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
