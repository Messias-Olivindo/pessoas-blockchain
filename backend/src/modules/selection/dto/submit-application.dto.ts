import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class SubmitApplicationDto {
  @ApiProperty()
  @IsDateString()
  appliedAt!: string;
}
