/**
 * Maps Firebase Auth error codes to user-friendly error messages.
 * @param errorCode The Firebase Auth error code (e.g., 'auth/user-not-found')
 * @returns A user-friendly error message string
 */
export function getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'The email address is badly formatted.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'There is no user record corresponding to this identifier. The user may have been deleted.';
        case 'auth/wrong-password':
            return 'The password is invalid or the user does not have a password.';
        case 'auth/email-already-in-use':
            return 'The email address is already in use by another account.';
        case 'auth/operation-not-allowed':
            return 'This operation is not allowed. Please contact support.';
        case 'auth/weak-password':
            return 'The password is too weak. Please use a stronger password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        case 'auth/user-mismatch':
            return 'The credentials provided do not match the currently logged-in user.';
        case 'auth/requires-recent-login':
            return 'This operation is sensitive and requires recent authentication. Log in again before retrying this request.';
        case 'auth/too-many-requests':
            return 'Too many unsuccessful login attempts. Please try again later.';
        case 'auth/expired-action-code':
            return 'The action code (e.g., for password reset) has expired.';
        case 'auth/invalid-action-code':
            return 'The action code is invalid. This can happen if the code is malformed or has already been used.';
        case 'auth/network-request-failed':
            return 'A network error occurred. Please check your internet connection.';
        case 'auth/internal-error':
            return 'An internal error occurred. Please try again later.';
        case 'custom/display-name-already-taken':
            return 'This display name is already taken. Please choose another one.';

        default:
            // Log unhandled codes to console for debugging
            console.warn(`[AuthErrorMapper] Unhandled error code: ${errorCode}`);
            return 'An unexpected authentication error occurred. Please try again.';
    }
}
