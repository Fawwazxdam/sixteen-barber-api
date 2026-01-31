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
      origin: "http://localhost:3000",
      credentials: true,
      // methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      // allowedHeaders: ["Content-Type", "Authorization"],
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
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
