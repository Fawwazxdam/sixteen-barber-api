import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors(
    {
      origin: [
        "https://sixteen-barber.vercel.app",
        "http://localhost:3000",
        "https://barber-api.magentaa.space"
      ],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }),
  )

  const config = new DocumentBuilder()
    .setTitle("Sixteen Barber API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth() // 🔐 untuk JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  const port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 4001;
  await app.listen(port);
}
bootstrap();
