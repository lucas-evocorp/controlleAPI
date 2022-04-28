import { PartialType } from '@nestjs/swagger';
import { CreateReleaseDto } from 'src/releases/dto/create-release.dto';

export class CreateReleaseSwagger extends PartialType(CreateReleaseDto) {
  id: number;
}
