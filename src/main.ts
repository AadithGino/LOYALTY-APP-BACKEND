import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorInterceptor } from './error/error.interceptor';
import { ErrorFilter } from './error/error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalFilters(new ErrorFilter());
  app.enableCors({
    origin: ['http://localhost:3001', 'http://example2.com']
  })
  await app.listen(process.env.PORT);
}
bootstrap();
