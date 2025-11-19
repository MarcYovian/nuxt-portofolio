<script setup lang="ts">
const props = defineProps<{
  words: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseTime?: number
}>()

const displayText = ref('')
const showCursor = ref(true)
const currentWordIndex = ref(0)
const currentCharIndex = ref(0)
const isDeleting = ref(false)
let timeoutId: number | null = null

const type = () => {
  const currentWord = props.words[currentWordIndex.value]

  if (isDeleting.value) {
    displayText.value = currentWord?.substring(0, currentCharIndex.value - 1) || ''
    currentCharIndex.value--

    if (currentCharIndex.value === 0) {
      isDeleting.value = false
      currentWordIndex.value = (currentWordIndex.value + 1) % props.words.length
      timeoutId = window.setTimeout(type, 200)
    } else {
      timeoutId = window.setTimeout(type, props.deleteSpeed || 50)
    }
  } else {
    displayText.value = currentWord?.substring(0, currentCharIndex.value + 1) || ''
    currentCharIndex.value++

    if (currentCharIndex.value === currentWord?.length) {
      isDeleting.value = true
      timeoutId = window.setTimeout(type, props.pauseTime || 2000)
    } else {
      timeoutId = window.setTimeout(type, props.typeSpeed || 150)
    }
  }
}

onMounted(() => {
  type()
  setInterval(() => {
    showCursor.value = !showCursor.value
  }, 500)
})

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <span class="inline-flex items-center">
    <span class="text-primary font-bold">{{ displayText }}</span>
    <span
      class="ml-1 w-0.5 h-[1em] bg-primary transition-opacity duration-100"
      :class="{ 'opacity-0': !showCursor, 'opacity-100': showCursor }"
    />
  </span>
</template>
