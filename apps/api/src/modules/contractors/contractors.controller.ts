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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ContractorsService } from './contractors.service';
import { CreateContractorDto, UpdateContractorDto } from './dto';

@ApiTags('Contractors - المقاولين')
@Controller('contractors')
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  /**
   * إنشاء مقاول جديد
   */
  @Post()
  @ApiOperation({ summary: 'إنشاء مقاول جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المقاول بنجاح' })
  async create(@Body() dto: CreateContractorDto) {
    const contractor = await this.contractorsService.create(dto);
    return {
      success: true,
      data: contractor,
      message: 'تم إنشاء المقاول بنجاح',
    };
  }

  /**
   * الحصول على قائمة المقاولين
   */
  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة المقاولين' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'contractorType', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('contractorType') contractorType?: string,
  ) {
    const result = await this.contractorsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      status,
      contractorType,
    });
    return {
      success: true,
      ...result,
    };
  }

  /**
   * توليد كود مقاول جديد
   */
  @Get('generate-code')
  @ApiOperation({ summary: 'توليد كود مقاول جديد' })
  async generateCode() {
    const code = await this.contractorsService.generateCode();
    return {
      success: true,
      data: { code },
    };
  }

  /**
   * الحصول على إحصائيات المقاولين
   */
  @Get('statistics')
  @ApiOperation({ summary: 'الحصول على إحصائيات المقاولين' })
  async getStatistics() {
    const statistics = await this.contractorsService.getStatistics();
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * الحصول على مقاول بالمعرف
   */
  @Get(':id')
  @ApiOperation({ summary: 'الحصول على مقاول بالمعرف' })
  @ApiParam({ name: 'id', description: 'معرف المقاول' })
  async findOne(@Param('id') id: string) {
    const contractor = await this.contractorsService.findOne(id);
    return {
      success: true,
      data: contractor,
    };
  }

  /**
   * تحديث مقاول
   */
  @Put(':id')
  @ApiOperation({ summary: 'تحديث مقاول' })
  @ApiParam({ name: 'id', description: 'معرف المقاول' })
  async update(@Param('id') id: string, @Body() dto: UpdateContractorDto) {
    const contractor = await this.contractorsService.update(id, dto);
    return {
      success: true,
      data: contractor,
      message: 'تم تحديث المقاول بنجاح',
    };
  }

  /**
   * حذف مقاول
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف مقاول' })
  @ApiParam({ name: 'id', description: 'معرف المقاول' })
  async remove(@Param('id') id: string) {
    await this.contractorsService.remove(id);
    return {
      success: true,
      message: 'تم حذف المقاول بنجاح',
    };
  }
}
