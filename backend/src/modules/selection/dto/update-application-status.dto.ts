import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: [
      'DRAFT',
      'SUBMITTED',
      'IN_REVIEW',
      'APPROVED',
      'REJECTED',
      'WITHDRAWN',
    ],
  })
  @IsString()
  @IsIn([
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN',
  ])
  status!: string;
}
