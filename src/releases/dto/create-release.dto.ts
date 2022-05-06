import { Transform } from 'class-transformer';
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
import { typeEnum } from 'src/core/interfaces/type-enum';
import { messagesValidation as Msgs } from 'src/core/messages/messages-validation-response';

export class CreateReleaseDto {
  @MaxLength(25, { message: Msgs.maxLength('descrição', 25) })
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: Msgs.isNumber('valor') })
  value: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNotBlank({ message: Msgs.isNotBlank('emissão') })
  emission: Date;

  @IsNotBlank({ message: Msgs.isNotBlank('dueDate') })
  dueDate: Date;

  @Transform(({ value }) => new Date(value))
  @IsOptional()
  payDay?: Date;

  @IsNotEmpty({ message: 'o campo de contas, não pode estar vazio!' })
  accountId: number;

  @IsBoolean({
    message: 'Algo deu errado, verifique os campos e tente novamente!',
  })
  @IsOptional()
  paidOut?: boolean;

  @IsBoolean()
  fixed: boolean;

  @IsBoolean()
  installments: boolean;

  @IsEnum(typeEnum, {
    message:
      'Algo deu errado!  por favor, verifique os campos e tente novamente!',
  })
  type: typeEnum;
}
