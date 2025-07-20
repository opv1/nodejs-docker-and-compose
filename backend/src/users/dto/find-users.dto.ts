import { IsNotEmpty, IsString, Length } from 'class-validator';

export class FindUsersDto {
  @IsNotEmpty()
  @IsString()
  @Length(0, 50)
  query: string;
}
