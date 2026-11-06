import { useSyncExternalStore } from 'react'
import { Outlet } from 'react-router'
import { Application } from '@/app/Application'
import { useRouteParams } from '@/app/hooks/useRouteParams'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export default function ApplicationLayout() {
  const params = useRouteParams()
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  return (
    <>
      {ready && <Application routeMode={params.mode} routeMain={params.main} />}
      <Outlet />
    </>
  )
}
