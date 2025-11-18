import { defineCollection, z } from '@nuxt/content'

const variantEnum = z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link'])
const colorEnum = z.enum(['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info'])
const sizeEnum = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])

// const createBaseSchema = () => z.object({
//   title: z.string().nonempty(),
//   description: z.string().nonempty()
// })

const createLinkSchema = () => z.object({
  label: z.string().nonempty(),
  to: z.string().nonempty(),
  icon: z.string().optional().editor({ input: 'icon' }),
  size: sizeEnum.optional(),
  trailing: z.boolean().optional(),
  target: z.string().optional(),
  color: colorEnum.optional(),
  variant: variantEnum.optional()
})

export const collections = {
  index: defineCollection({
    source: '0.index.md',
    type: 'page',
    schema: z.object({
      hero: z.object(({
        links: z.array(createLinkSchema())
      }))
    })
  })
}
