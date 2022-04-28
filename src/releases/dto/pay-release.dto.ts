import { PartialType, PickType } from '@nestjs/swagger';
import { CreateReleaseDto } from './create-release.dto';

export class payReleaseDto extends PickType(CreateReleaseDto, [
  'paidOut',
  'payDay',
]) {}
