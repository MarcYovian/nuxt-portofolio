<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())
console.log('page', page)
// const title = page.value?.seo?.title || page.value?.title
// const description = page.value?.seo?.description || page.value?.description
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page?.title"
      :description="page?.description"
      reverse
      orientation="horizontal"
    >
      <img
        src="/images/IMG_0114.jpg"
        alt="App screenshot"
        class="rounded-lg shadow-2xl ring ring-default"
      >
    </UPageHero>
  </div>
</template>
