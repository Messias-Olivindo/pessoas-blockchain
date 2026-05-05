import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AuthRepository } from './auth.repository';

/**
 * Google OAuth 2.0 service.
 *
 * Implements the Authorization Code Flow:
 *  1. `getAuthUrl()` → generates the Google consent screen URL.
 *  2. `handleCallback(code)` → exchanges the code for tokens, validates
 *     the email domain, and upserts User + Account in the database.
 *
 * Uses `google-auth-library` directly (not Passport) for full control
 * over scopes, access_type, and token lifecycle.
 *
 * Required env vars:
 *  - GOOGLE_CLIENT_ID
 *  - GOOGLE_CLIENT_SECRET
 *  - GOOGLE_OAUTH_REDIRECT_URI
 */
@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private readonly oauth2Client: OAuth2Client;

  /** Institutional email domain restriction. */
  private readonly ALLOWED_DOMAIN = 'sou.inteli.edu.br';

  /**
   * Scopes requested during OAuth consent:
   * - openid / email / profile → basic identity
   * - calendar.events → future Calendar integration
   */
  private readonly SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  constructor(private readonly authRepository: AuthRepository) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.warn(
        'Google OAuth env vars are not fully configured. OAuth flow will not work.',
      );
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  /**
   * Generates the Google authorization URL.
   *
   * - `access_type: 'offline'` ensures a refresh_token is returned.
   * - `prompt: 'consent'` forces re-consent so we always get a refresh_token
   *   (Google only returns it on first auth or when consent is explicitly requested).
   * - `hd` parameter hints Google to show only the institutional domain.
   *
   * @returns The full Google consent URL to redirect the user to.
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: this.SCOPES,
      include_granted_scopes: true,
      // Hint to Google login page to restrict to the institutional domain
      hd: this.ALLOWED_DOMAIN,
    });
  }

  /**
   * Handles the OAuth callback by:
   *  1. Exchanging the authorization code for tokens.
   *  2. Fetching user info from the ID token.
   *  3. Validating the email domain.
   *  4. Upserting User + Account in the database.
   *
   * @param code - Authorization code from Google's redirect.
   * @returns The upserted user record.
   */
  async handleCallback(code: string) {
    // 1. Exchange code for tokens
    let tokenResponse;
    try {
      tokenResponse = await this.oauth2Client.getToken(code);
    } catch (error) {
      this.logger.error('Failed to exchange Google OAuth code for tokens', error);
      throw new UnauthorizedException(
        'Falha ao trocar o codigo de autorizacao com o Google.',
      );
    }

    const { tokens } = tokenResponse;
    this.oauth2Client.setCredentials(tokens);

    // 2. Verify the ID token to extract user profile
    if (!tokens.id_token) {
      throw new InternalServerErrorException(
        'Google nao retornou um id_token.',
      );
    }

    let payload;
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.error('Failed to verify Google ID token', error);
      throw new UnauthorizedException('Token do Google invalido.');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException(
        'Nao foi possivel obter o email do Google.',
      );
    }

    // 3. Validate institutional domain
    const emailDomain = payload.email.split('@')[1];
    if (emailDomain !== this.ALLOWED_DOMAIN) {
      throw new ForbiddenException(
        `Apenas emails @${this.ALLOWED_DOMAIN} sao permitidos. Email fornecido: ${payload.email}`,
      );
    }

    // 4. Upsert user and account with tokens
    const user = await this.authRepository.upsertGoogleUser(
      {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      },
      {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        id_token: tokens.id_token,
        scope: tokens.scope ?? this.SCOPES.join(' '),
        token_type: tokens.token_type ?? 'Bearer',
      },
    );

    this.logger.log(
      `Google OAuth successful for ${payload.email} (userId: ${user.id})`,
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      status: user.status,
      googleConnected: true,
    };
  }
}
