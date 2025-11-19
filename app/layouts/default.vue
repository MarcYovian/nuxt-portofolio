<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-200 font-sans relative overflow-hidden">
    <div class="absolute inset-0 bg-grid-pattern pointer-events-none h-[600px]" />

    <SpotlightEffect />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-10">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>