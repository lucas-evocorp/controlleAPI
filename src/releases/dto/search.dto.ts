import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class SearchDto {
  @Transform(({ value }) => value.trim())
  @IsOptional()
  search?: string;
}
