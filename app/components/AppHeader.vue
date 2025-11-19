<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
  label: 'Home',
  to: '/',
  active: route.path === '/'
}, {
  label: 'About',
  to: '/about'
}, {
  label: 'Achievements',
  to: '/achievements'
}, {
  label: 'Projects',
  to: '/projects'
}, {
  label: 'Contacts',
  to: '/contacts'
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="text-lg font-bold flex items-center gap-2">
        <UIcon name="i-lucide-code" class="size-8 text-[#FBBF24]" /> <span>MarcYovian</span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="items" variant="link" color="warning" />

    <template #right>
      <UButton icon="i-lucide-github" color="neutral" variant="ghost" href="https://github.com/MarcYovian"
        target="_blank" />

      <UButton icon="i-lucide-linkedin" color="neutral" variant="ghost"
        href="https://www.linkedin.com/in/marcellinus-yovian-indrastata/" target="_blank" />

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
