import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  memberId!: string;

  @ApiProperty()
  @IsString()
  processId!: string;

  @ApiPropertyOptional({
    enum: [
      'DRAFT',
      'SUBMITTED',
      'IN_REVIEW',
      'APPROVED',
      'REJECTED',
      'WITHDRAWN',
    ],
  })
  @IsOptional()
  @IsIn([
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN',
  ])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
