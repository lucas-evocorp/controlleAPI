import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { IsNotBlank } from 'src/core/decorators/is-not-blank';
import { messagesValidation as Msgs } from 'src/core/messages/messages-validation-response';

enum typeEnum {
  receita = 'receita',
  despesa = 'despesa',
}
export class CreateReleaseDto {
  @MaxLength(25, { message: Msgs.maxLength('descrição', 25) })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: Msgs.isNumber('valor') })
  value: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNotBlank({ message: Msgs.isNotBlank('emissão') })
  emission: Date;

  @IsNotBlank({ message: Msgs.isNotBlank('dueDate') })
  dueDate: Date;

  @IsOptional()
  payDay?: Date;

  @IsNotEmpty()
  accountId: number;

  @IsBoolean()
  paidOut: boolean;

  @IsBoolean()
  fixed: boolean;

  @IsBoolean()
  installments: boolean;

  @IsEnum(typeEnum)
  type: string;
}
