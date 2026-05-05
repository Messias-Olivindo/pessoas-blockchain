import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSelectionAnswerDto {
  @ApiProperty()
  @IsString()
  questionId!: string;

  @ApiProperty()
  @IsString()
  answerText!: string;
}
