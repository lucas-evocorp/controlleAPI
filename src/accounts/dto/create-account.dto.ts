import { IsNumber } from 'class-validator';
import { IsNotBlank } from 'src/core/decorators/is-not-blank';
import { messagesValidation as Msgs } from 'src/core/messages/messages-validation-response';

export class CreateAccountDto {
  @IsNotBlank({ message: Msgs.isNotBlank('nome') })
  name: string;

  @IsNumber()
  bankId: number;

  @IsNumber({}, { message: Msgs.isNumber('saldo Inicial') })
  openingBalance: number;
}
