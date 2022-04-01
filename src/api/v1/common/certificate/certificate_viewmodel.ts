import { Expose, Type } from "class-transformer";
import {
  IsDate,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from "class-validator";

export class CertificateViewModel {
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsMongoId()
  _id!: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(115)
  @Type(() => String)
  award_description!: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  tagline?: string;

  @IsOptional()
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  // @IsOptional()
  
  // file?: UploadedFile;
  
}
