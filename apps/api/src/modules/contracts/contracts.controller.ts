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
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto, CreateContractRateDto, UpdateContractRateDto } from './dto';

@ApiTags('Contracts - العقود')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * إنشاء عقد جديد
   */
  @Post()
  @ApiOperation({ summary: 'إنشاء عقد جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء العقد بنجاح' })
  async create(@Body() dto: CreateContractDto) {
    const contract = await this.contractsService.create({
      ...dto,
      contractor: {
        connect: { id: dto.contractorId },
      },
    });
    return {
      success: true,
      data: contract,
      message: 'تم إنشاء العقد بنجاح',
    };
  }

  /**
   * الحصول على قائمة العقود
   */
  @Get()
  @ApiOperation({ summary: 'الحصول على قائمة العقود' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'contractorId', required: false, type: String })
  @ApiQuery({ name: 'contractType', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('contractorId') contractorId?: string,
    @Query('contractType') contractType?: string,
  ) {
    const result = await this.contractsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      status,
      contractorId,
      contractType,
    });
    return {
      success: true,
      ...result,
    };
  }

  /**
   * توليد رقم عقد جديد
   */
  @Get('generate-number')
  @ApiOperation({ summary: 'توليد رقم عقد جديد' })
  async generateNumber() {
    const number = await this.contractsService.generateNumber();
    return {
      success: true,
      data: { number },
    };
  }

  /**
   * الحصول على إحصائيات العقود
   */
  @Get('statistics')
  @ApiOperation({ summary: 'الحصول على إحصائيات العقود' })
  async getStatistics() {
    const statistics = await this.contractsService.getStatistics();
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * الحصول على عقد بالمعرف
   */
  @Get(':id')
  @ApiOperation({ summary: 'الحصول على عقد بالمعرف' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  async findOne(@Param('id') id: string) {
    const contract = await this.contractsService.findOne(id);
    return {
      success: true,
      data: contract,
    };
  }

  /**
   * تحديث عقد
   */
  @Put(':id')
  @ApiOperation({ summary: 'تحديث عقد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  async update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    const contract = await this.contractsService.update(id, dto);
    return {
      success: true,
      data: contract,
      message: 'تم تحديث العقد بنجاح',
    };
  }

  /**
   * حذف عقد
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف عقد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  async remove(@Param('id') id: string) {
    await this.contractsService.remove(id);
    return {
      success: true,
      message: 'تم حذف العقد بنجاح',
    };
  }

  /**
   * إضافة سعر للعقد
   */
  @Post(':id/rates')
  @ApiOperation({ summary: 'إضافة سعر للعقد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  async addRate(@Param('id') id: string, @Body() dto: CreateContractRateDto) {
    const rate = await this.contractsService.addRate(id, dto);
    return {
      success: true,
      data: rate,
      message: 'تم إضافة السعر بنجاح',
    };
  }

  /**
   * تحديث سعر في العقد
   */
  @Put(':id/rates/:rateId')
  @ApiOperation({ summary: 'تحديث سعر في العقد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  @ApiParam({ name: 'rateId', description: 'معرف السعر' })
  async updateRate(
    @Param('id') id: string,
    @Param('rateId') rateId: string,
    @Body() dto: UpdateContractRateDto,
  ) {
    const rate = await this.contractsService.updateRate(rateId, dto);
    return {
      success: true,
      data: rate,
      message: 'تم تحديث السعر بنجاح',
    };
  }

  /**
   * حذف سعر من العقد
   */
  @Delete(':id/rates/:rateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف سعر من العقد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  @ApiParam({ name: 'rateId', description: 'معرف السعر' })
  async removeRate(@Param('id') id: string, @Param('rateId') rateId: string) {
    await this.contractsService.removeRate(rateId);
    return {
      success: true,
      message: 'تم حذف السعر بنجاح',
    };
  }
}
