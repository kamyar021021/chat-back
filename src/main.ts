import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // فعال‌سازی CORS برای فرانت‌اند روی Vercel
  app.enableCors({
  origin: 'http://localhost:3001', // اینجا پورت فرانت‌اند را بگذارید
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

  const port = configService.get<number>('PORT', 10000);
  const host = '0.0.0.0'; // برای Render ضروری است

  await app.listen(port, host);
  console.log(`🚀 Backend is running on: http://${host}:${port}`);
}
bootstrap();