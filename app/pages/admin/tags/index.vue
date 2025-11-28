<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'

definePageMeta({
    layout: false
})

const toast = useToast()
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')

// State
const columnFilters = ref([{ id: 'name', value: '' }])
const columnVisibility = ref()
const rowSelection = ref<Record<string, boolean>>({})
const pagination = ref({ pageIndex: 0, pageSize: 10 })

// Modals state
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedItem = ref<any>(null)
const selectedItems = ref<any[]>([])

// Data Fetching
const { data, status, refresh, error } = await useAsyncData(
    'tags',
    () => $fetch('/api/tags'),
    {
        lazy: false,
        default: () => []
    }
)

// Watch error
watch(error, (newError) => {
    if (newError) {
        toast.add({
            title: 'Error Loading Data',
            description: newError.message || 'Failed to fetch tags',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    }
})

// Actions
function onEdit(row: any) {
    selectedItem.value = row
    isEditOpen.value = true
}

function onDelete(row: any) {
    selectedItems.value = [row]
    isDeleteOpen.value = true
}

const table = useTemplateRef('table')

function getSelectedRows() {
    return table.value?.tableApi?.getFilteredSelectedRowModel().rows.map((r: any) => r.original) || []
}

watch(rowSelection, () => {
    selectedItems.value = getSelectedRows()
}, { flush: 'post' })

function getRowItems(row: any) {
    return [
        {
            label: 'Edit',
            icon: 'i-lucide-edit',
            onSelect: () => onEdit(row.original)
        },
        {
            label: 'Delete',
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect: () => onDelete(row.original)
        }
    ]
}

const columns: TableColumn<any>[] = [
    {
        id: 'select',
        header: ({ table }) =>
            h(UCheckbox, {
                'modelValue': table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : table.getIsAllPageRowsSelected(),
                'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
                    table.toggleAllPageRowsSelected(!!value),
                'ariaLabel': 'Select all'
            }),
        cell: ({ row }) =>
            h(UCheckbox, {
                'modelValue': row.getIsSelected(),
                'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
                'ariaLabel': 'Select row'
            })
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
            h('span', { class: 'font-medium text-highlighted' }, row.original.name),
            h('span', { class: 'text-xs text-muted' }, row.original.slug)
        ])
    },
    {
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => {
            const color = row.original.color || '#000000'
            return h('div', { class: 'flex items-center gap-2' }, [
                h('div', {
                    class: 'h-4 w-4 rounded-full border border-zinc-700',
                    style: { backgroundColor: color }
                }),
                h('span', { class: 'text-sm text-zinc-400' }, color)
            ])
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: { align: 'end' },
                        items: getRowItems(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost',
                            class: 'ml-auto'
                        })
                )
            )
        }
    }
]

const skeletonData = Array(5).fill({
    id: 0,
    name: '',
    slug: '',
    color: ''
})

const displayData = computed(() => {
    if (status.value === 'pending') {
        return skeletonData
    }
    return data.value || []
})

const isEmpty = computed(() => {
    return status.value === 'success' && (!data.value || data.value.length === 0)
})
</script>

<template>
    <NuxtLayout name="admin">
        <UDashboardPanel id="tags">
            <template #header>
                <UDashboardNavbar title="Tags">
                    <template #leading>
                        <UDashboardSidebarCollapse />
                    </template>

                    <template #right>
                        <TagsAddModal @success="refresh" />
                    </template>
                </UDashboardNavbar>
            </template>

            <template #body>
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                    <UInput :model-value="(table?.tableApi?.getColumn('name')?.getFilterValue() as string)"
                        class="max-w-sm" icon="i-lucide-search" placeholder="Filter tags..."
                        :disabled="status === 'pending'"
                        @update:model-value="table?.tableApi?.getColumn('name')?.setFilterValue($event)" />

                    <div class="flex flex-wrap items-center gap-1.5">
                        <UButton v-if="selectedItems.length > 0" label="Delete" color="error" variant="subtle"
                            icon="i-lucide-trash" :disabled="status === 'pending'" @click="isDeleteOpen = true">
                            <template #trailing>
                                <UKbd>{{ selectedItems.length }}</UKbd>
                            </template>
                        </UButton>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="isEmpty" class="flex flex-col items-center justify-center py-12 text-center">
                    <UIcon name="i-lucide-tag" class="size-16 text-zinc-700 mb-4" />
                    <h3 class="text-lg font-semibold text-white mb-2">No Tags Found</h3>
                    <p class="text-zinc-400 mb-6">Get started by creating your first tag.</p>
                    <TagsAddModal @success="refresh" />
                </div>

                <!-- Table -->
                <UTable v-else ref="table" v-model:column-filters="columnFilters"
                    v-model:column-visibility="columnVisibility" v-model:row-selection="rowSelection"
                    v-model:pagination="pagination" :pagination-options="{
                        getPaginationRowModel: getPaginationRowModel()
                    }" class="shrink-0" :data="displayData" :columns="columns" :loading="status === 'pending'" :ui="{
                        base: 'table-fixed border-separate border-spacing-0',
                        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
                        tbody: '[&>tr]:last:[&>td]:border-b-0',
                        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
                        td: 'border-b border-default',
                        separator: 'h-0',
                        loading: 'animate-pulse'
                    }">
                    <template v-if="status === 'pending'" #[`cell-name`]>
                        <div class="space-y-2">
                            <div class="h-4 bg-zinc-800 rounded w-32 animate-pulse" />
                            <div class="h-3 bg-zinc-800 rounded w-20 animate-pulse" />
                        </div>
                    </template>
                    <template v-if="status === 'pending'" #[`cell-color`]>
                        <div class="h-4 bg-zinc-800 rounded w-24 animate-pulse" />
                    </template>
                </UTable>

                <!-- Pagination -->
                <div v-if="!isEmpty"
                    class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
                    <div class="text-sm text-muted">
                        <template v-if="status === 'pending'">
                            <div class="h-4 bg-zinc-800 rounded w-32 animate-pulse" />
                        </template>
                        <template v-else>
                            {{ Object.keys(rowSelection).length }} of
                            {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
                        </template>
                    </div>

                    <div class="flex items-center gap-1.5">
                        <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                            :total="table?.tableApi?.getFilteredRowModel().rows.length" :disabled="status === 'pending'"
                            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
                    </div>
                </div>
            </template>
        </UDashboardPanel>

        <!-- Edit Modal -->
        <TagsEditModal v-model:open="isEditOpen" :item="selectedItem" @success="refresh" />

        <!-- Delete Modal -->
        <TagsDeleteModal v-model:open="isDeleteOpen" :items="selectedItems" @success="refresh" />
    </NuxtLayout>
</template>
