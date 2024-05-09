import { Request, Response } from 'express'
import { Injectable } from '@nestjs/common'
import { SmartKeyDTO } from './dto/key.dto'
import { decryptKey } from 'helpers/smartKey'
import { StatusCodes } from 'enums/statusCodes'
import { PrismaService } from 'prisma/prisma.service'
import { ResponseService } from 'lib/response.service'

@Injectable()
export class AppService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
  ) { }

  getHello(): string {
    return 'Memegoat!'
  }

  async leaderboard(res: Response) {
    try {
      const now = new Date()
      const sevenDays = new Date(now)
      sevenDays.setDate(now.getDate() + 7)

      const users = await this.prisma.user.findMany({
        select: {
          tweets: {
            where: {
              createdAt: {
                gte: sevenDays,
                lte: now,
              }
            }
          },
          username: true,
          displayName: true,
        },
      })

      const leaderboardData = [] as {
        tweets: number
        username: string
        impressions: number
        displayName: string
      }[]

      for (const user of users) {
        let impressions = 0

        for (const tweet of user.tweets) {
          if (tweet.referenced) {
            impressions += tweet.like + tweet.retweet + tweet.reply + tweet.impression + tweet.quote
          }
        }

        if (impressions > 0) {
          leaderboardData.push({
            impressions,
            username: user.username,
            tweets: user.tweets.length,
            displayName: user.displayName,
          })
        }
      }

      leaderboardData.sort((a, b) => b.impressions - a.impressions)

      this.response.sendSuccess(res, StatusCodes.OK, { data: leaderboardData })
    } catch (err) {
      console.error(err)
      this.response.sendError(res, StatusCodes.InternalServerError, 'Something went wrong')
    }
  }

  private async info(key: string, fieldName: 'smartKey' | 'profileId') {
    const now = new Date()
    const sevenDays = new Date(now)
    sevenDays.setDate(now.getDate() + 7)

    const user = await this.prisma.user.findUnique({
      where: fieldName === "profileId" ? {
        profileId: key
      } : {
        smartKey: key
      },
      include: {
        tweets: {
          where: {
            createdAt: {
              gte: sevenDays,
              lte: now,
            }
          }
        },
      }
    })

    if (!user) return

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        tweets: {
          where: {
            createdAt: {
              gte: sevenDays,
              lte: now,
            }
          }
        },
      },
    })

    const leaderboardData = [] as {
      id: string
      impressions: number
      tweets: number
    }[]

    for (const u of users) {
      let impressions = 0

      for (const tweet of u.tweets) {
        if (tweet.referenced) {
          impressions += tweet.like + tweet.retweet + tweet.reply + tweet.impression + tweet.quote
        }
      }

      if (impressions > 0) {
        leaderboardData.push({
          id: u.id,
          impressions,
          tweets: u.tweets.length,
        })
      }
    }

    leaderboardData.sort((a, b) => b.impressions - a.impressions)

    const metadata = {
      views: 0,
      likes: 0,
      quotes: 0,
      replies: 0,
      retweets: 0,
    } as {
      views: number
      likes: number
      quotes: number
      replies: number
      retweets: number
    }

    for (const tweet of user.tweets) {
      metadata.likes += tweet.like
      metadata.quotes += tweet.quote
      metadata.replies += tweet.reply
      metadata.views += tweet.impression
      metadata.retweets += tweet.retweet
    }

    const userIndex = leaderboardData.findIndex(u => u.id === user.id)
    const userRank = userIndex !== -1 ? userIndex + 1 : null

    return { user, metadata, userRank }
  }

  async dashboard(res: Response, req: Request) {
    // @ts-ignore
    const { metadata, user, userRank } = await this.info(req.user?.profileId, 'profileId')
    this.response.sendSuccess(res, StatusCodes.OK, { data: { user, metadata, userRank } })
  }

  async verifySmartKey(res: Response, { key, username }: SmartKeyDTO) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: { username }
      })

      if (!userExist) {
        return this.response.sendError(res, StatusCodes.NotFound, "Account not found")
      }

      const decryptedKey = decryptKey(key, `${process.env.X_CLIENT_SECRET}-${userExist.profileId}`)
      const decryptedAuthKey = decryptKey(userExist.smartKey, `${process.env.X_CLIENT_SECRET}-${userExist.profileId}`)

      const isMatch = decryptedKey === decryptedAuthKey
      if (!isMatch) {
        return this.response.sendError(res, StatusCodes.Unauthorized, "Invalid Smart Key")
      }

      const { user, metadata, userRank } = await this.info(key, 'smartKey')
      this.response.sendSuccess(res, StatusCodes.OK, { data: { user, metadata, userRank } })
    } catch (err) {
      console.error(err)
      return this.response.sendError(res, StatusCodes.InternalServerError, "Error decrypting key")
    }
  }
}