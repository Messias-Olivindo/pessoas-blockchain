import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateStageDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  order!: number;
}
