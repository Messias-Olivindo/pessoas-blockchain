import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['ADMIN', 'PEOPLE', 'INTERVIEWER'] })
  @IsString()
  @IsIn(['ADMIN', 'PEOPLE', 'INTERVIEWER'])
  role!: string;
}
