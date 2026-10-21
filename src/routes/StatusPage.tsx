import type { ReactNode } from 'react'
import { styled } from 'styled-system/jsx'
import { seigaiha } from '@/app/layout.styles'

const base = import.meta.env.BASE_URL

export function StatusPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <styled.main position="relative" isolation="isolate" minH="100dvh" display="grid" placeItems="center" p="6" bg="surface.0" _before={{ ...seigaiha }}>
      <styled.section
        w="min(100%, 520px)"
        p="clamp(24px, 6vw, 48px)"
        border="1px solid {colors.border}"
        borderRadius="lg"
        bg="panel"
        color="fg.default"
        fontFamily="sans"
        lineHeight="normal"
        boxShadow="md"
      >
        <styled.img src={`${base}favicon.svg`} htmlWidth="56" htmlHeight="56" w="56px" h="56px" alt="" display="block" mb="4" />
        <styled.h1 m="0 0 {spacing.3}" fontFamily="mincho" fontSize="xl">
          {title}
        </styled.h1>
        {children}
      </styled.section>
    </styled.main>
  )
}
