import { Expose, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty } from 'class-validator';
import { UploadedFile } from "express-fileupload";

export class UploadMediaViewModel {
  image!: UploadedFile;
}

export class UploadAttachmentViewModel {
  document!: UploadedFile;
}

export class DeleteResourcesViewModel {
  @Expose()
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @Type(()=>String)
  files!: string[];
}




