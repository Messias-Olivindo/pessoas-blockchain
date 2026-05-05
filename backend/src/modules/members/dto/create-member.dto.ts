import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  race?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLgbtqia?: boolean;

  @ApiPropertyOptional({ enum: ['CANDIDATE', 'ACTIVE', 'INACTIVE', 'ALUMNI'] })
  @IsOptional()
  @IsIn(['CANDIDATE', 'ACTIVE', 'INACTIVE', 'ALUMNI'])
  status?: string;

  @ApiPropertyOptional({ enum: ['MEMBER', 'DIRECTOR', 'PRESIDENT', 'HEAD'] })
  @IsOptional()
  @IsIn(['MEMBER', 'DIRECTOR', 'PRESIDENT', 'HEAD'])
  position?: string;

  @ApiPropertyOptional({
    enum: ['PEOPLE', 'MARKETING', 'PROJECTS', 'EDUCATIONAL'],
  })
  @IsOptional()
  @IsIn(['PEOPLE', 'MARKETING', 'PROJECTS', 'EDUCATIONAL'])
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  leftAt?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
