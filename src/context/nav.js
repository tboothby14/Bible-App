import { createContext, useContext } from 'react'

export const NavContext = createContext({ view: 'today', params: {}, go: () => {} })
export const useNav = () => useContext(NavContext)
