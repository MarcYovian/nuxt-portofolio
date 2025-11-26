<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'

definePageMeta({
  layout: false
})

const toast = useToast()
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')

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
const { data, status, refresh, error } = await useAsyncData('skill_categories', () => $fetch('/api/skill-categories'))

if (error.value) {
  toast.add({ title: 'Error', description: error.value.message, color: 'error' })
}

// Actions
function onEdit(row: any) {
  selectedItem.value = row
  isEditOpen.value = true
}

function onDelete(row: any) {
  selectedItems.value = [row]
  isDeleteOpen.value = true
}

function onBulkDelete() {
  const selectedIndices = Object.keys(rowSelection.value).filter(k => rowSelection.value[k])
  // This is tricky because rowSelection keys are indices relative to the page or data?
  // TanStack table rowSelection keys are usually row IDs if getRowId is provided, or indices.
  // In customers.vue it uses `table.tableApi.getFilteredSelectedRowModel().rows`.
  // I will use the ref to the table to get selected rows.
}

const table = useTemplateRef('table')

function getSelectedRows() {
  return table.value?.tableApi?.getFilteredSelectedRowModel().rows.map((r: any) => r.original) || []
}

watch(rowSelection, () => {
  selectedItems.value = getSelectedRows()
})

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
    accessorKey: 'display_order',
    header: 'Order',
    cell: ({ row }) => row.original.display_order
  },
  {
    accessorKey: 'icon',
    header: 'Icon',
    cell: ({ row }) => row.original.icon ? h('div', { class: row.original.icon }) : '-'
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.name)
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
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
</script>

<template>
  <NuxtLayout name="admin">
    <UDashboardPanel id="skill-categories">
      <template #header>
        <UDashboardNavbar title="Skill Categories">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <SkillCategoriesAddModal @success="refresh" />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <UInput :model-value="(table?.tableApi?.getColumn('name')?.getFilterValue() as string)" class="max-w-sm"
            icon="i-lucide-search" placeholder="Filter categories..."
            @update:model-value="table?.tableApi?.getColumn('name')?.setFilterValue($event)" />

          <div class="flex flex-wrap items-center gap-1.5">
            <UButton v-if="selectedItems.length > 0" label="Delete" color="error" variant="subtle" icon="i-lucide-trash"
              @click="isDeleteOpen = true">
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
              <UButton label="Display" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
            </UDropdownMenu>
          </div>
        </div>

        <UTable ref="table" v-model:column-filters="columnFilters" v-model:column-visibility="columnVisibility"
          v-model:row-selection="rowSelection" v-model:pagination="pagination" :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }" class="shrink-0" :data="data || []" :columns="columns" :loading="status === 'pending'" :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
          }" />

        <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
          <div class="text-sm text-muted">
            {{ Object.keys(rowSelection).length }} of
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
