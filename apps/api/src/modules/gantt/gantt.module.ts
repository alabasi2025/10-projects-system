import { Module } from '@nestjs/common';
import { GanttController } from './gantt.controller';
import { GanttService } from './gantt.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GanttController],
  providers: [GanttService],
  exports: [GanttService],
})
export class GanttModule {}
