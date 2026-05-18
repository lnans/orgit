import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@client/lib/utils'

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'leading-7',
      muted: 'text-muted-foreground text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Text({ className, variant = 'default', ...props }: React.ComponentProps<'p'> & VariantProps<typeof textVariants>) {
  const textVariant = variant ?? 'default'

  return (
    <p className={cn(textVariants({ variant: textVariant, className }))} data-slot="text" data-variant={textVariant} {...props} />
  )
}

export { Text, textVariants }
