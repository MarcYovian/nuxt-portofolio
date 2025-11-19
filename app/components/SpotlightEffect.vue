<script setup lang="ts">
import { useMouse } from '@vueuse/core'

const { x, y } = useMouse()
</script>

<template>
    <div class="pointer-events-none fixed inset-0 z-30 transition duration-300" :style="{
        background: `radial-gradient(600px at ${x}px ${y}px, rgba(251, 191, 36, 0.05), transparent 80%)`
    }" />
</template>