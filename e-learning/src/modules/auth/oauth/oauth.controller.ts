import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth.service';

@ApiTags('Auth')
@Controller('auth')
export class OAuthController {
  constructor(private authService: AuthService) {}

  // ─── Google ────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Connexion via Google OAuth' })
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback Google OAuth' })
  async googleCallback(@Req() req: any) {
    return this.authService.loginOrRegisterOAuth(req.user);
  }

  // ─── LinkedIn ──────────────────────────────────────────────

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'Connexion via LinkedIn OAuth' })
  linkedinLogin() {}

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'Callback LinkedIn OAuth' })
  async linkedinCallback(@Req() req: any) {
    return this.authService.loginOrRegisterOAuth(req.user);
  }
}
