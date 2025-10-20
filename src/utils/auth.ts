import { store } from "@/redux/store"
import { selectUserId, selectUser, selectIsAuthenticated } from "@/redux/features/user/userSlice"

/**
 * Get current user ID from Redux store
 * @returns User ID or undefined if not authenticated
 */
export const getCurrentUserId = (): string | undefined => {
  const state = store.getState()
  return selectUserId(state) || undefined
}

/**
 * Get current user data from Redux store
 */
export const getCurrentUser = () => {
  const state = store.getState()
  return selectUser(state)
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const state = store.getState()
  return selectIsAuthenticated(state)
}

/**
 * Get access token from Redux store
 */
export const getAccessToken = (): string | null => {
  const state = store.getState()
  return state.user.accessToken
}
