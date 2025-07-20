import {
  IsString,
  IsUrl,
  IsArray,
  Length,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsArray()
  itemsId: number[];
}
