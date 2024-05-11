import {
  DocumentBuilder, SwaggerModule
} from '@nestjs/swagger'
import * as express from 'express'
import * as passport from 'passport'
import { AppModule } from './app.module'
import * as session from 'express-session'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const PORT: number = parseInt(process.env.PORT, 10) || 2005
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      `http://localhost:${PORT}`,
      'https://memegoat.io',
      'https://testing.memegoat.io/',
      'https://memegoat.onrender.com',
      'https://memegoat-client.vercel.app'
    ],
    methods: 'GET,OPTIONS',
    credentials: true
  })

  app.use(express.json({ limit: 2 << 20 }))
  app.use(cookieParser())
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
  }))
  app.use(passport.session())
  app.use(passport.initialize())

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Memegoat API')
    .setVersion('1.2.7')
    .addServer(`https://memegoat.onrender.com`, 'Staging')
    .addServer(`http://localhost:${PORT}`, 'Local')
    .addBearerAuth()
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions)
  SwaggerModule.setup('docs', app, swaggerDocument)

  try {
    await app.listen(PORT)
    console.log(`http://localhost:${PORT}`)
  } catch (err) {
    console.error(err.message)
  }
}
bootstrap()
