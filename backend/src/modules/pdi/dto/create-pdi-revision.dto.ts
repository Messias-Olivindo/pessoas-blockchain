import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePdiRevisionDto {
  @ApiProperty()
  @IsString()
  editorId!: string;

  @ApiProperty()
  @IsString()
  content!: string;
}
