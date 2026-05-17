import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@client/lib/utils'

const titleVariants = cva('scroll-m-20 tracking-tight', {
  variants: {
    variant: {
      h1: 'text-center text-4xl font-extrabold text-balance',
      h2: 'border-b pb-2 text-3xl font-semibold first:mt-0',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
    },
  },
  defaultVariants: {
    variant: 'h1',
  },
})

function Title({ className, variant = 'h1', ...props }: React.ComponentProps<'h1'> & VariantProps<typeof titleVariants>) {
  const titleVariant = variant ?? 'h1'
  const Comp: React.ElementType = titleVariant

  return (
    <Comp
      className={cn(titleVariants({ variant: titleVariant, className }))}
      data-slot="title"
      data-variant={titleVariant}
      {...props}
    />
  )
}

export { Title, titleVariants }
