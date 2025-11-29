<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import { format } from 'date-fns'
import type { Tables } from '~/types/database'

definePageMeta({
    layout: false
})

const toast = useToast()
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')

// State
const columnFilters = ref([{ id: 'institution', value: '' }])
const columnVisibility = ref()
const rowSelection = ref<Record<string, boolean>>({})
const pagination = ref({ pageIndex: 0, pageSize: 10 })

// Modals state
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedItem = ref<any>(null)
const selectedItems = ref<any[]>([])

// Data Fetching
const { data, status, refresh, error } = await useAsyncData<Tables<'education'>[]>(
    'educations',
    () => $fetch<Tables<'education'>[]>('/api/educations'),
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
            description: newError.message || 'Failed to fetch educations',
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
            icon: 'i-lucide-pencil',
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
        accessorKey: 'institution_logo',
        header: 'Logo',
        cell: ({ row }) => row.original.institution_logo
            ? h('img', { src: row.original.institution_logo, class: 'h-10 w-10 rounded object-cover border border-zinc-800' })
            : h('div', { class: 'h-10 w-10 rounded bg-zinc-800 flex items-center justify-center' }, h('span', { class: 'text-xs text-zinc-500' }, 'No Logo'))
    },
    {
        accessorKey: 'institution',
        header: 'Institution',
        cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
            h('span', { class: 'font-medium text-highlighted' }, row.original.institution),
            h('span', { class: 'text-xs text-muted' }, row.original.location || '-')
        ])
    },
    {
        accessorKey: 'degree',
        header: 'Degree',
        cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
            h('span', { class: 'font-medium' }, row.original.degree),
            h('span', { class: 'text-xs text-muted' }, row.original.field_of_study || '-')
        ])
    },
    {
        accessorKey: 'start_date',
        header: 'Duration',
        cell: ({ row }) => {
            const start = row.original.start_date ? format(new Date(row.original.start_date), 'MMM yyyy') : '-'
            const end = row.original.is_current ? 'Present' : (row.original.end_date ? format(new Date(row.original.end_date), 'MMM yyyy') : '-')
            return `${start} - ${end}`
        }
    },
    {
        accessorKey: 'is_active',
        header: 'Active',
        cell: ({ row }) => {
            return h(UBadge, {
                variant: 'subtle',
                color: row.original.is_active ? 'success' : 'neutral'
            }, () => row.original.is_active ? 'Active' : 'Inactive')
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

// Skeleton data
const skeletonData = Array(5).fill({
    id: 0,
    institution: '',
    degree: '',
    institution_logo: '',
    start_date: '',
    is_active: false
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
        <UDashboardPanel id="educations">
            <template #header>
                <UDashboardNavbar title="Education">
                    <template #leading>
                        <UDashboardSidebarCollapse />
                    </template>

                    <template #right>
                        <EducationsAddModal @success="refresh" />
                    </template>
                </UDashboardNavbar>
            </template>

            <template #body>
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                    <UInput :model-value="(table?.tableApi?.getColumn('institution')?.getFilterValue() as string)"
                        class="max-w-sm" icon="i-lucide-search" placeholder="Filter institutions..."
                        :disabled="status === 'pending'"
                        @update:model-value="table?.tableApi?.getColumn('institution')?.setFilterValue($event)" />

                    <div class="flex flex-wrap items-center gap-1.5">
                        <UButton v-if="selectedItems.length > 0" label="Delete" color="error" variant="subtle"
                            icon="i-lucide-trash" :disabled="status === 'pending'" @click="isDeleteOpen = true">
                            <template #trailing>
                                <UKbd>{{ selectedItems.length }}</UKbd>
                            </template>
                        </UButton>

                        <UDropdownMenu :items="table?.tableApi
                            ?.getAllColumns()
                            .filter((column: any) => column.getCanHide())
                            .map((column: any) => ({
                                label: upperFirst(column.id),
                                type: 'checkbox' as const,
                                checked: column.getIsVisible(),
                                onUpdateChecked(checked: boolean) {
                                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                                },
                                onSelect(e?: Event) {
                                    e?.preventDefault()
                                }
                            }))
                            " :content="{ align: 'end' }">
                            <UButton label="Display" color="neutral" variant="outline"
                                trailing-icon="i-lucide-settings-2" :disabled="status === 'pending'" />
                        </UDropdownMenu>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="isEmpty" class="flex flex-col items-center justify-center py-12 text-center">
                    <UIcon name="i-lucide-graduation-cap" class="size-16 text-zinc-700 mb-4" />
                    <h3 class="text-lg font-semibold text-white mb-2">No Education Found</h3>
                    <p class="text-zinc-400 mb-6">Get started by adding your first education record.</p>
                    <EducationsAddModal @success="refresh" />
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
                    <template v-if="status === 'pending'" #[`cell-institution_logo`]>
                        <div class="h-10 w-10 bg-zinc-800 rounded animate-pulse" />
                    </template>
                    <template v-if="status === 'pending'" #[`cell-institution`]>
                        <div class="space-y-2">
                            <div class="h-4 bg-zinc-800 rounded w-32 animate-pulse" />
                            <div class="h-3 bg-zinc-800 rounded w-20 animate-pulse" />
                        </div>
                    </template>
                    <template v-if="status === 'pending'" #[`cell-degree`]>
                        <div class="space-y-2">
                            <div class="h-4 bg-zinc-800 rounded w-24 animate-pulse" />
                            <div class="h-3 bg-zinc-800 rounded w-16 animate-pulse" />
                        </div>
                    </template>
                    <template v-if="status === 'pending'" #[`cell-start_date`]>
                        <div class="h-4 bg-zinc-800 rounded w-24 animate-pulse" />
                    </template>
                    <template v-if="status === 'pending'" #[`cell-is_active`]>
                        <div class="h-6 bg-zinc-800 rounded-full w-16 animate-pulse" />
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
        <EducationsEditModal v-model:open="isEditOpen" :item="selectedItem" @success="refresh" />

        <!-- Delete Modal -->
        <EducationsDeleteModal v-model:open="isDeleteOpen" :items="selectedItems" @success="refresh" />
    </NuxtLayout>
</template>
