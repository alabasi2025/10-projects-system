import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto';

@ApiTags('المشاريع - Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'إنشاء مشروع جديد',
    description: 'إنشاء مشروع جديد في النظام مع جميع البيانات الأساسية',
  })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء المشروع بنجاح',
    schema: {
      example: {
        success: true,
        message: 'تم إنشاء المشروع بنجاح',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          projectNumber: 'PROJ-2025-001',
          name: 'محطة الطاقة الشمسية',
          status: 'draft',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة',
  })
  @ApiResponse({
    status: 409,
    description: 'رقم المشروع موجود مسبقاً',
  })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({
    summary: 'قائمة المشاريع',
    description: 'الحصول على قائمة المشاريع مع إمكانية البحث والفلترة والترقيم',
  })
  @ApiResponse({
    status: 200,
    description: 'قائمة المشاريع',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            projectNumber: 'PROJ-2025-001',
            name: 'محطة الطاقة الشمسية',
            status: 'in_progress',
            progressPercent: 45,
          },
        ],
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      },
    },
  })
  async findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'إحصائيات المشاريع',
    description: 'الحصول على إحصائيات عامة عن المشاريع',
  })
  @ApiResponse({
    status: 200,
    description: 'إحصائيات المشاريع',
    schema: {
      example: {
        success: true,
        data: {
          totalProjects: 25,
          byStatus: {
            draft: 5,
            inProgress: 15,
            completed: 5,
          },
          financial: {
            totalBudget: 50000000,
            totalSpent: 25000000,
          },
        },
      },
    },
  })
  async getStatistics() {
    return this.projectsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل مشروع',
    description: 'الحصول على تفاصيل مشروع محدد بما في ذلك الخطط وحزم العمل',
  })
  @ApiParam({
    name: 'id',
    description: 'معرف المشروع (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل المشروع',
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'تحديث مشروع',
    description: 'تحديث بيانات مشروع موجود',
  })
  @ApiParam({
    name: 'id',
    description: 'معرف المشروع (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث المشروع بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
  })
  @ApiResponse({
    status: 409,
    description: 'رقم المشروع موجود مسبقاً',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'حذف مشروع',
    description: 'حذف مشروع من النظام (سيتم حذف جميع البيانات المرتبطة)',
  })
  @ApiParam({
    name: 'id',
    description: 'معرف المشروع (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف المشروع بنجاح',
    schema: {
      example: {
        success: true,
        message: 'تم حذف المشروع بنجاح',
        data: { id: '550e8400-e29b-41d4-a716-446655440000' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }
}
