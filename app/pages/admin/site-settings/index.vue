<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'

definePageMeta({
    layout: false
})

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')
const SiteSettingsEditModal = resolveComponent('SiteSettingsEditModal')
const SiteSettingsDeleteModal = resolveComponent('SiteSettingsDeleteModal')

const toast = useToast()
const table = useTemplateRef('table')

const { data: settings, refresh, status } = await useFetch('/api/site-settings')

const columnFilters = ref([{
    id: 'key',
    value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

const pagination = ref({
    pageIndex: 0,
    pageSize: 10
})

const formatValue = (val: any) => {
    try {
        const str = JSON.stringify(val)
        return str.length > 50 ? str.substring(0, 50) + '...' : str
    } catch (e) {
        return String(val)
    }
}

function getRowItems(row: Row<any>) {
    return [
        {
            type: 'label',
            label: 'Actions'
        },
        {
            label: 'Copy Key',
            icon: 'i-lucide-copy',
            onSelect() {
                navigator.clipboard.writeText(row.original.key)
                toast.add({
                    title: 'Copied to clipboard',
                    description: 'Setting key copied to clipboard'
                })
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Edit',
            icon: 'i-lucide-edit',
            onSelect() {
                // The modal is handled via a component in the cell render, 
                // but for dropdown actions we might need a different approach 
                // or just rely on the row action buttons.
                // However, the standard pattern often uses a dropdown for actions.
                // For now, let's keep the Edit/Delete modals as components in the cell
                // but we can also trigger them if we refactor the modals to be global or exposed.
                // Since the current modals are components, let's stick to the cell renderer for the main actions
                // and use this dropdown for extra stuff or just duplicate the triggers if possible.
                // Actually, the previous implementation had buttons. The customer example uses a dropdown.
                // Let's try to use the dropdown to trigger the modals if we can, 
                // OR just put the buttons in the action column like before but styled better.
                // BUT, the customer example uses `getRowItems` for the dropdown.
                // Let's stick to the previous "Actions" column with buttons for now to ensure Modals work easily,
                // or we can wrap the Modals in the render function.
                // Wrapping modals in render function is tricky.
                // Let's use the cell renderer to render the Modals directly as buttons/icons.
            }
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
        accessorKey: 'key',
        header: 'Key',
        cell: ({ row }) => h('span', { class: 'font-medium text-white' }, row.original.key)
    },
    {
        accessorKey: 'description',
        header: 'Description'
    },
    {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => h('code', { class: 'text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300 font-mono' }, formatValue(row.original.value))
    },
    {
        accessorKey: 'is_public',
        header: 'Public',
        cell: ({ row }) => {
            return h(UBadge, {
                color: row.original.is_public ? 'green' : 'gray',
                variant: 'subtle',
                size: 'xs'
            }, () => row.original.is_public ? 'Public' : 'Private')
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2 justify-end' }, [
                h(SiteSettingsEditModal, { item: row.original, onSuccess: refresh }),
                h(SiteSettingsDeleteModal, { item: row.original, onSuccess: refresh })
            ])
        }
    }
]
</script>

<template>
    <NuxtLayout name="admin">
        <UDashboardPanel id="site-settings">
            <template #header>
                <UDashboardNavbar title="Site Settings">
                    <template #leading>
                        <UDashboardSidebarCollapse />
                    </template>

                    <template #right>
                        <SiteSettingsAddModal @success="refresh" />
                    </template>
                </UDashboardNavbar>
            </template>

            <template #body>
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                    <UInput :model-value="(table?.tableApi?.getColumn('key')?.getFilterValue() as string)"
                        class="max-w-sm" icon="i-lucide-search" placeholder="Filter by key..."
                        @update:model-value="table?.tableApi?.getColumn('key')?.setFilterValue($event)" />

                    <div class="flex flex-wrap items-center gap-1.5">
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
                                trailing-icon="i-lucide-settings-2" />
                        </UDropdownMenu>
                    </div>
                </div>

                <UTable ref="table" v-model:column-filters="columnFilters" v-model:column-visibility="columnVisibility"
                    v-model:row-selection="rowSelection" v-model:pagination="pagination" :pagination-options="{
                        getPaginationRowModel: getPaginationRowModel()
                    }" class="shrink-0" :data="settings || []" :columns="columns" :loading="status === 'pending'" :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
        }" />

                <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
                    <div class="text-sm text-muted">
                        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
                        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
                    </div>

                    <div class="flex items-center gap-1.5">
                        <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                            :total="table?.tableApi?.getFilteredRowModel().rows.length"
                            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
                    </div>
                </div>
            </template>
        </UDashboardPanel>
    </NuxtLayout>
</template>
