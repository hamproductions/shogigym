import { useLocation } from 'react-router'
import { routeParams } from '@/routes/paths'

export const useRouteParams = () => routeParams(useLocation().pathname)
