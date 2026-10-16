import { ark } from '@ark-ui/react/factory'
import type { ComponentProps } from 'react'
import { createSlotRecipeContext } from 'styled-system/jsx'
import { card } from 'styled-system/recipes'

const { withProvider, withContext } = createSlotRecipeContext(card)

export type RootProps = ComponentProps<typeof Root>
export const Root = withProvider(ark.div, 'root')
export const Title = withContext(ark.strong, 'title')
export const Body = withContext(ark.div, 'body')
