import { PartialType } from '@nestjs/swagger';
import { CreateContractRateDto } from './create-contract-rate.dto';

export class UpdateContractRateDto extends PartialType(CreateContractRateDto) {}
