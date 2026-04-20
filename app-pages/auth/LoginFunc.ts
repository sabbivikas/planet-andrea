/**
 * Login Func that handles user login
 */
import { LoginProps } from '@/app/auth/login';

export interface LoginFunc {}

/**
 * All regular log-in business logic happens in `LoginCore`, no need to add it here.
 * In rare cases this customization hook can be used to extend it.
 */
export function useLogin(props: LoginProps): LoginFunc {
  return {};
}
