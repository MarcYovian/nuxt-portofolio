import { defineCollection, z } from "@nuxt/content";

const variantEnum = z.enum([
  "solid",
  "outline",
  "subtle",
  "soft",
  "ghost",
  "link",
]);
const colorEnum = z.enum([
  "primary",
  "secondary",
  "neutral",
  "error",
  "warning",
  "success",
  "info",
]);
const sizeEnum = z.enum(["xs", "sm", "md", "lg", "xl"]);
const orientationEnum = z.enum(["vertical", "horizontal"]);

// Helper untuk schema dasar (Title & Description)
const createBaseSchema = () =>
  z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty(),
  });

// Helper untuk item fitur (Title, Desc, Icon)
const createFeatureItemSchema = () =>
  createBaseSchema().extend({
    icon: z.string().nonempty().editor({ input: "icon" }),
  });

// Helper untuk link/tombol
const createLinkSchema = () =>
  z.object({
    label: z.string().nonempty(),
    to: z.string().nonempty(),
    icon: z.string().optional().editor({ input: "icon" }),
    size: sizeEnum.optional(),
    trailing: z.boolean().optional(),
    target: z.string().optional(),
    color: colorEnum.optional(),
    variant: variantEnum.optional(),
  });

// Helper untuk gambar (avatar user, dll)
const createImageSchema = () =>
  z.object({
    src: z.string().nonempty().editor({ input: "media" }),
    alt: z.string().optional(),
    loading: z.enum(["lazy", "eager"]).optional(),
    srcset: z.string().optional(),
  });

export const collections = {
  index: defineCollection({
    source: "0.index.yml",
    type: "page",
    schema: z.object({
      // 1. Schema untuk Typing Effect
      roles: z.array(z.string()).optional(),

      // 2. Schema untuk Hero
      hero: z.object({
        links: z.array(createLinkSchema()),
      }),

      // 3. Schema untuk Features (Services/Skills) - WAJIB ADA untuk index.yml baru
      features: createBaseSchema().extend({
        items: z.array(createFeatureItemSchema()),
      }),

      skills: z
        .object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          groups: z.array(
            z.object({
              title: z.string().nonempty(),
              items: z.array(z.string()), // Array of strings (nama teknologi)
            }),
          ),
        })
        .optional(),

      // 4. Schema untuk Sections (Optional, untuk layout tambahan)
      sections: z
        .array(
          createBaseSchema().extend({
            id: z.string().optional(),
            orientation: orientationEnum.optional(),
            reverse: z.boolean().optional(),
            features: z.array(createFeatureItemSchema()),
          }),
        )
        .optional(),

      // 5. Schema untuk Testimonials (Optional)
      testimonials: createBaseSchema()
        .extend({
          headline: z.string().optional(),
          items: z.array(
            z.object({
              quote: z.string().nonempty(),
              user: z.object({
                name: z.string().nonempty(),
                description: z.string().nonempty(),
                to: z.string().optional(),
                target: z.string().optional(),
                avatar: createImageSchema().optional(),
              }),
            }),
          ),
        })
        .optional(),

      // 6. Schema untuk Call to Action (Bawah halaman)
      cta: createBaseSchema()
        .extend({
          links: z.array(createLinkSchema()),
        })
        .optional(),
    }),
  }),
};
