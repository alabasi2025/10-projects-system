/**
 * نظام التخطيط والمشاريع (10)
 * Projects Management System API
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // إضافة البادئة العامة لجميع المسارات
  app.setGlobalPrefix('api/v1');

  // تفعيل CORS
  app.enableCors({
    origin: true, // قبول جميع المصادر
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // تفعيل التحقق من المدخلات
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // إعداد Swagger
  const config = new DocumentBuilder()
    .setTitle('نظام التخطيط والمشاريع')
    .setDescription(`
      ## نظام التخطيط والمشاريع (10)
      
      هذا النظام يدير:
      - إدارة المشاريع (الإنشاء، المتابعة، الإغلاق)
      - تجزئة العمل (WBS) - الخطط وحزم العمل
      - مخطط جانت والمسار الحرج
      - إدارة الميزانية والمصروفات
      - إدارة المقاولين والمستخلصات
      - رسملة الأصول عند إغلاق المشروع
      
      ### القواعد الصارمة:
      - جميع المفاتيح الأساسية من نوع UUID
      - جميع الجداول تبدأ بالبادئة proj_
      - CRUD كامل لكل كيان
    `)
    .setVersion('1.0')
    .addTag('المشاريع - Projects', 'إدارة المشاريع')
    .addTag('الخطط - Phases', 'إدارة الخطط المرحلية')
    .addTag('حزم العمل - Work Packages', 'إدارة حزم العمل')
    .addTag('الميزانية - Budget', 'إدارة الميزانية')
    .addTag('المقاولين - Contractors', 'إدارة المقاولين')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'نظام التخطيط والمشاريع - API',
  });

  const port = process.env.PORT || process.env.API_PORT || 3000;
  await app.listen(port);

  Logger.log(`🚀 API Server is running on: http://localhost:${port}`);
  Logger.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
