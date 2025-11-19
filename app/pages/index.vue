<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description
})
</script>

<template>
  <div v-if="page" class="space-y-24">

    <section class="flex flex-col justify-center min-h-[60vh]" v-motion-fade>
      <div class="space-y-6 max-w-3xl">
        <div v-motion-slide-visible-once-bottom
          class="inline-flex items-center px-3 py-1 rounded-full border border-primary-500/20 bg-primary-500/10 text-primary-400 text-xs font-mono">
          <span class="relative flex h-2 w-2 mr-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          Available for projects
        </div>

        <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-white">
          <span class="block text-zinc-400 text-2xl md:text-3xl mb-2 font-normal">Hi, I'm Marcellinus Yovian.</span>
          I build <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">digital
            products</span>
          <br /> that matter.
        </h1>

        <p class="text-xl text-zinc-400 leading-relaxed max-w-2xl">
          {{ page.description }}
        </p>

        <div class="flex gap-4 pt-4">
          <UButton to="/projects" size="xl" color="primary" variant="solid" class="rounded-full px-8">
            View Work
          </UButton>
          <UButton to="/contacts" size="xl" color="neutral" variant="ghost" class="rounded-full px-8 hover:bg-zinc-800">
            Contact Me
          </UButton>
        </div>
      </div>
    </section>

    <section v-if="page.features" class="space-y-8" v-motion-slide-visible-once-bottom>
      <div class="flex items-center gap-4 mb-8">
        <h2 class="text-2xl font-bold text-white">What I do</h2>
        <div class="h-px bg-zinc-800 flex-1"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="(item, index) in page.features.items" :key="index"
          class="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-primary-500/50 transition-colors duration-300">
          <div
            class="mb-4 p-3 bg-zinc-950 rounded-lg w-fit text-primary-400 group-hover:text-primary-300 group-hover:scale-110 transition-transform">
            <UIcon :name="item.icon" class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">{{ item.title }}</h3>
          <p class="text-zinc-400 text-sm">{{ item.description }}</p>
        </div>
      </div>
    </section>

    <section v-if="page.skills" class="space-y-8" v-motion-slide-visible-once-bottom>
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-bold text-white mb-4">{{ page.skills.title }}</h2>
        <p class="text-zinc-400">{{ page.skills.description }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="(group, index) in page.skills.groups" :key="index"
          class="relative group p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/30 transition-all duration-300">
          <div
            class="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-primary-500/20 rounded-tl-2xl group-hover:border-primary-500/50 transition-colors">
          </div>

          <h3 class="text-xl font-semibold text-zinc-200 mb-6 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary-500"></span>
            {{ group.title }}
          </h3>

          <div class="flex flex-wrap gap-2">
            <span v-for="tech in group.items" :key="tech"
              class="px-3 py-1.5 text-sm rounded-md bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white hover:border-primary-500/40 hover:bg-primary-500/10 transition-all duration-200 cursor-default">
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 text-center" v-motion-slide-visible-once-bottom>
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
        Ready to start a project?
      </h2>
      <p class="text-zinc-400 mb-8">Let's turn your ideas into reality.</p>
      <UButton to="/contacts" size="xl" color="neutral" variant="solid" class="rounded-full px-10">
        Let's Talk
      </UButton>
    </section>

  </div>
</template>