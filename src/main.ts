import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Security headers
  app.use(helmet());

  // ✅ Cookie parser
  app.use(cookieParser());

  // ✅ CORS configuration
  app.enableCors({
    origin: [
      "https://barber.magentaa.space",
      "https://sixteen-barber.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"], // ✅ Expose Set-Cookie header
  });

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Sixteen Barber API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 4001;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();