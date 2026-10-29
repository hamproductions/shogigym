import { styled } from 'styled-system/jsx'

const SkeletonLine = styled('span', {
  base: { display: 'block', h: '3', borderRadius: 'sm', bg: 'surface.2' },
})

export function PanelSkeleton() {
  return (
    <styled.div display="grid" gap="2.5" p="4" aria-hidden="true">
      <SkeletonLine w="45%" h="4" />
      <SkeletonLine w="100%" />
      <SkeletonLine w="92%" />
      <SkeletonLine w="70%" />
    </styled.div>
  )
}
