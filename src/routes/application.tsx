import { Outlet } from 'react-router'
import { Application } from '@/app/Application'
import { useRouteParams } from '@/app/hooks/useRouteParams'

export default function ApplicationLayout() {
  const params = useRouteParams()
  return (
    <>
      <Application routeMode={params.mode} routeMain={params.main} />
      <Outlet />
    </>
  )
}
