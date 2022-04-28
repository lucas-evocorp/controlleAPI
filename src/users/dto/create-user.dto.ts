import { IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';
import { IsNotBlank } from 'src/core/decorators/is-not-blank';
import { messagesValidation as Msgs } from 'src/core/messages/messages-validation-response';
export class CreateUserDto {
  @MaxLength(25)
  @IsNotBlank({ message: Msgs.isNotBlank('name') })
  name: string;

  @IsEmail()
  @IsNotBlank({ message: Msgs.isNotBlank('email') })
  email: string;

  @MaxLength(15)
  @MinLength(4)
  @IsNotBlank({ message: Msgs.isNotBlank('password') })
  password: string;

  @IsOptional()
  imageUrl?: string;
}
