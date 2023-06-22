import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorFilter, ErrorInterceptor } from './error';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalFilters(new ErrorFilter());
  app.enableCors({
    // origin: ['http://localhost:3001', 'http://example2.com']
     origin: '*',
  })
  await app.listen(process.env.PORT);
}
bootstrap();
