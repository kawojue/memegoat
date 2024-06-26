import {
  Body, Res, Controller, Req,
  Get, Post, Param, UseGuards,
} from '@nestjs/common'
import { RefDTO } from './dto/ref.dto'
import { AppService } from './app.service'
import { SmartKeyDTO } from './dto/key.dto'
import { Request, Response } from 'express'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CookieAuthGuard } from './jwt/cookie-auth.guard'
import { CampaignRequestDTO } from './dto/compaign-req.dto'

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('/leaderboard')
  async leaderboard(@Res() res: Response) {
    await this.appService.leaderboard(res)
  }

  @Get('/dashboard')
  @ApiBearerAuth()
  @UseGuards(CookieAuthGuard)
  async dashboard(@Req() req: Request, @Res() res: Response) {
    await this.appService.dashboard(res, req)
  }

  @Post('/verify/smartKey')
  async verifySmartKey(
    @Res() res: Response,
    @Body() body: SmartKeyDTO,
  ) {
    await this.appService.verifySmartKey(res, body)
  }

  @Post('/verify/referral')
  @ApiBearerAuth()
  @UseGuards(CookieAuthGuard)
  async verifyRef(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: RefDTO,
  ) {
    await this.appService.verifyRef(req, res, body)
  }

  @Get('/tasks')
  async fetchTasks(@Res() res: Response) {
    await this.appService.fetchTasks(res)
  }

  @Post('/campaign-request')
  async addCampaignRequest(@Res() res: Response, @Body() body: CampaignRequestDTO) {
    await this.appService.addCampaignRequest(res, body)
  }


  @Get('/campaign-requests')
  async fetchCampaignRequests(@Res() res: Response) {
    await this.appService.fetchCampaignRequests(res)
  }

  @Get('/campaign-requests/:token_addr')
  async fetchCampaignRequest(@Res() res: Response, @Param('token_addr') token_addr: string) {
    await this.appService.fetchCampaignRequest(res, token_addr)
  }
}
