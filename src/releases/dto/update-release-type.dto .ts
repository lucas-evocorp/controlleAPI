import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { CreateReleaseDto } from './create-release.dto';

export class UpdateTypeDto extends PartialType(
  PickType(CreateReleaseDto, ['type']),
) {}
