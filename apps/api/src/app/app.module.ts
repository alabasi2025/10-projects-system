import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../modules/projects/projects.module';
import { PhasesModule } from '../modules/phases/phases.module';
import { WorkPackagesModule } from '../modules/work-packages/work-packages.module';
import { BudgetsModule } from '../modules/budgets/budgets.module';
import { ExpensesModule } from '../modules/expenses/expenses.module';
import { GanttModule } from '../modules/gantt/gantt.module';
import { ContractorsModule } from '../modules/contractors/contractors.module';
import { ContractsModule } from '../modules/contracts/contracts.module';
import { InvoicesModule } from '../modules/invoices/invoices.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { ReportsModule } from '../modules/reports/reports.module';
import { IntegrationModule } from '../modules/integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ProjectsModule,
    PhasesModule,
    WorkPackagesModule,
    BudgetsModule,
    ExpensesModule,
    GanttModule,
    ContractorsModule,
    ContractsModule,
    InvoicesModule,
    DashboardModule,
    ReportsModule,
    IntegrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
