import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return {
      name: 'نظام التخطيط والمشاريع',
      version: '1.0.0',
      status: 'running',
      description: 'نظام إدارة المشاريع والتخطيط الاستراتيجي',
    };
  }
}
