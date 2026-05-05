import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

/**
 * Bootstrap the NestJS application with global pipes, filters, interceptors,
 * and Swagger documentation.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  
  // Métodos HTTP permitidos
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  
  // Obrigatório caso o front-end envie cookies ou tokens específicos e exija withCredentials
  credentials: true,
  
  // Adicione explicitamente os headers customizados que você usa na sua API
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'x-user-id',   // Liberando seu header customizado
    'x-user-role'  // Liberando seu header customizado
  ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Gestao de Pessoas API')
    .setDescription(
      'API da plataforma de gestao de pessoas do Inteli Blockchain.',
    )
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'x-user-id', in: 'header' }, 'x-user-id')
    .addApiKey(
      { type: 'apiKey', name: 'x-user-role', in: 'header' },
      'x-user-role',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  // Bind explicitly to 0.0.0.0 so Fly's health checks can reach the service
  await app.listen(port, '0.0.0.0');
}
bootstrap();
