import {
  Controller, Get, Req, Res, UseGuards
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('/x')
  @UseGuards(AuthGuard('twitter'))
  async xLogin() { }

  @ApiOperation({
    summary: "Ignore this"
  })
  @Get('/x/callback')
  @UseGuards(AuthGuard('twitter'))
  async xCallback(@Req() req: Request, @Res() res: Response) {
    const isProd = process.env.NODE_ENV === 'production'

    try {
      const token = await this.authService.auth(req)

      res.cookie('token', token, {
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.redirect(isProd ? `${process.env.CLIENT_URL}/dashboard` : 'http://localhost:3000/dashboard')
    } catch {
      res.redirect(isProd ? `${process.env.CLIENT_URL}` : 'http://localhost:3000')
    }
  }
}
