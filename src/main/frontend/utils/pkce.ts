/**
 * PKCE (Proof Key for Code Exchange) utility functions
 * Used for OAuth2 Authorization Code flow with PKCE
 */

/**
 * Generates a cryptographically secure random string for use as code_verifier
 * @param length Length of the verifier (between 43 and 128 characters)
 * @returns Base64URL encoded random string
 */
export function generateCodeVerifier(length: number = 128): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(randomValues)
        .map(x => possible[x % possible.length])
        .join('');
}

/**
 * Generates the code_challenge from a code_verifier using SHA-256
 * @param verifier The code_verifier string
 * @returns Base64URL encoded SHA-256 hash of the verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return base64URLEncode(hash);
}

/**
 * Encodes an ArrayBuffer to Base64URL format (without padding)
 * @param buffer The buffer to encode
 * @returns Base64URL encoded string
 */
function base64URLEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Generates both code_verifier and code_challenge for PKCE flow
 * @returns Object containing both verifier and challenge
 */
export async function generatePKCEPair(): Promise<{ verifier: string; challenge: string }> {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    return { verifier, challenge };
}

/**
 * Generates a random state parameter for OAuth2 flow
 * @returns Random state string
 */
export function generateState(): string {
    return generateCodeVerifier(32);
}
