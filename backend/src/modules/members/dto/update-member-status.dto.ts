import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateMemberStatusDto {
  @ApiProperty({ enum: ['CANDIDATE', 'ACTIVE', 'INACTIVE', 'ALUMNI'] })
  @IsString()
  @IsIn(['CANDIDATE', 'ACTIVE', 'INACTIVE', 'ALUMNI'])
  status!: string;
}
