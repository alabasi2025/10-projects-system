import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('النظام - System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'معلومات النظام' })
  @ApiResponse({
    status: 200,
    description: 'معلومات النظام',
    schema: {
      example: {
        name: 'نظام التخطيط والمشاريع',
        version: '1.0.0',
        status: 'running',
      },
    },
  })
  getData() {
    return this.appService.getData();
  }

  @Get('api/v1/health')
  @ApiOperation({ summary: 'فحص صحة النظام' })
  @ApiResponse({
    status: 200,
    description: 'النظام يعمل بشكل سليم',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-12-18T10:00:00.000Z',
        uptime: 3600,
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
