import { PickType } from '@nestjs/swagger';
import { CreateReleaseDto } from './create-release.dto';

export class UpdateReleaseValueDto extends PickType(CreateReleaseDto, [
  'value',
]) {}
