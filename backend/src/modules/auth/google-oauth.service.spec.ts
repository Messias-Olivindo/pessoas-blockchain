import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleOAuthService } from './google-oauth.service';
import { AuthRepository } from './auth.repository';

// Mock google-auth-library
const mockGenerateAuthUrl = jest.fn();
const mockGetToken = jest.fn();
const mockSetCredentials = jest.fn();
const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    generateAuthUrl: mockGenerateAuthUrl,
    getToken: mockGetToken,
    setCredentials: mockSetCredentials,
    verifyIdToken: mockVerifyIdToken,
  })),
}));

describe('GoogleOAuthService', () => {
  let service: GoogleOAuthService;

  const mockAuthRepository = {
    upsertGoogleUser: jest.fn(),
  };

  beforeEach(async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_OAUTH_REDIRECT_URI = 'http://localhost:3001/auth/google/callback';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleOAuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    service = module.get<GoogleOAuthService>(GoogleOAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthUrl', () => {
    it('returns the Google authorization URL', () => {
      mockGenerateAuthUrl.mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?...');

      const url = service.getAuthUrl();

      expect(url).toBe('https://accounts.google.com/o/oauth2/v2/auth?...');
      expect(mockGenerateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/calendar.events',
        ],
        include_granted_scopes: true,
        hd: 'sou.inteli.edu.br',
      });
    });
  });

  describe('handleCallback', () => {
    const mockTokens = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expiry_date: 1717200000000,
      id_token: 'test-id-token',
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
      token_type: 'Bearer',
    };

    const mockPayload = {
      sub: 'google-sub-123',
      email: 'aluno@sou.inteli.edu.br',
      name: 'Aluno Inteli',
      picture: 'https://example.com/photo.jpg',
    };

    const mockUser = {
      id: 'user-1',
      email: 'aluno@sou.inteli.edu.br',
      name: 'Aluno Inteli',
      image: 'https://example.com/photo.jpg',
      role: 'PEOPLE',
      status: 'PENDING',
    };

    beforeEach(() => {
      mockGetToken.mockResolvedValue({ tokens: mockTokens });
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => mockPayload,
      });
      mockAuthRepository.upsertGoogleUser.mockResolvedValue(mockUser);
    });

    it('exchanges code and returns user data', async () => {
      const result = await service.handleCallback('valid-code');

      expect(mockGetToken).toHaveBeenCalledWith('valid-code');
      expect(mockSetCredentials).toHaveBeenCalledWith(mockTokens);
      expect(mockVerifyIdToken).toHaveBeenCalledWith({
        idToken: 'test-id-token',
        audience: 'test-client-id',
      });
      expect(mockAuthRepository.upsertGoogleUser).toHaveBeenCalledWith(
        {
          email: 'aluno@sou.inteli.edu.br',
          name: 'Aluno Inteli',
          picture: 'https://example.com/photo.jpg',
          sub: 'google-sub-123',
        },
        {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expiry_date: 1717200000000,
          id_token: 'test-id-token',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          token_type: 'Bearer',
        },
      );
      expect(result).toEqual({
        id: 'user-1',
        email: 'aluno@sou.inteli.edu.br',
        name: 'Aluno Inteli',
        image: 'https://example.com/photo.jpg',
        role: 'PEOPLE',
        status: 'PENDING',
        googleConnected: true,
      });
    });

    it('throws UnauthorizedException when code exchange fails', async () => {
      mockGetToken.mockRejectedValue(new Error('Invalid code'));

      await expect(service.handleCallback('bad-code')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException for non-institutional email', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          ...mockPayload,
          email: 'external@gmail.com',
        }),
      });

      await expect(service.handleCallback('valid-code')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws UnauthorizedException when payload has no email', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: 'test' }),
      });

      await expect(service.handleCallback('valid-code')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
