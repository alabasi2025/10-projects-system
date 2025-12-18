import { Module } from '@nestjs/common';
import { WorkPackagesController } from './work-packages.controller';
import { WorkPackagesService } from './work-packages.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkPackagesController],
  providers: [WorkPackagesService],
  exports: [WorkPackagesService],
})
export class WorkPackagesModule {}
