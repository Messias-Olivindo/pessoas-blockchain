import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpsertSelectionAnswerDto {
  @ApiProperty()
  @IsString()
  answerText!: string;
}
