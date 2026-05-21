import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../../common/guards/jwt.strategy';
import { GoogleStrategy } from './oauth/google.strategy';
import { LinkedInStrategy } from './oauth/linkedin.strategy';
import { OAuthController } from './oauth/oauth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: config.get<string>('JWT_PRIVATE_KEY'),
        publicKey: config.get<string>('JWT_PUBLIC_KEY'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
          algorithm: 'RS256',
        },
      }),
    }),
  ],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, LinkedInStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
