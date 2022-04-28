import { MaxLength } from 'class-validator';
import { messagesValidation as Msgs } from 'src/core/messages/messages-validation-response';

export class CreateBankDto {
  @MaxLength(50, { message: Msgs.maxLength('nome', 50) })
  name: string;
}
