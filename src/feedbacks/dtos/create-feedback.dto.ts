import {
  IsEnum,
  isEnum,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { IsNotBlank } from 'src/core/decorators/is-not-blank';

export enum TypeFeedbackEnum {
  PROBLEM = 'problem',
  IDEA = 'idea',
  OTHER = 'other',
}

export class SendFeedBackDto {
  @MinLength(2)
  @IsString()
  @IsNotBlank()
  @IsOptional()
  description?: string;

  @IsEnum(TypeFeedbackEnum)
  @IsNotBlank()
  type: TypeFeedbackEnum;

  @IsOptional()
  fileName?: string;
}
