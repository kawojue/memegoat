import {
  Controller, Get, Req, Res, UseGuards
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('/x')
  @UseGuards(AuthGuard('twitter'))
  async xLogin() { }

  @Get('/x/callback')
  @UseGuards(AuthGuard('twitter'))
  async xCallback(@Req() req: Request, @Res() res: Response) {
    const { user, token } = await this.authService.auth(req)

    const isProd = process.env.NODE_ENV === 'production'

    if (!user) {
      res.redirect('http://localhost:3000/login')
    } else {
      res.cookie('token', token, {
        domain: isProd ? '' : undefined,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.redirect('http://localhost:3000/dashboard')
    }
  }
}