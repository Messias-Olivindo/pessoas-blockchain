import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpsertStageResultDto {
  @ApiProperty({ enum: ['PENDING', 'PASSED', 'FAILED', 'SKIPPED'] })
  @IsString()
  @IsIn(['PENDING', 'PASSED', 'FAILED', 'SKIPPED'])
  status!: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  decidedAt?: string;
}
