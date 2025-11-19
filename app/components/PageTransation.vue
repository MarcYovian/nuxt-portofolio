<script setup lang="ts">
const route = useRoute()
</script>

<template>
    <div>
        <Transition :name="'page'" mode="out-in" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
            <div :key="route.path">
                <slot />
            </div>
        </Transition>
    </div>
</template>

<script lang="ts">
export default {
    methods: {
        onBeforeEnter(el: Element) {
            const element = el as HTMLElement
            element.style.opacity = '0'
            element.style.transform = 'translateY(20px)'
        },
        onEnter(el: Element, done: () => void) {
            const element = el as HTMLElement
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease'
                element.style.opacity = '1'
                element.style.transform = 'translateY(0)'
                setTimeout(done, 500)
            }, 50)
        },
        onLeave(el: Element, done: () => void) {
            const element = el as HTMLElement
            element.style.transition = 'all 0.3s ease'
            element.style.opacity = '0'
            element.style.transform = 'translateY(-20px)'
            setTimeout(done, 300)
        }
    }
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>