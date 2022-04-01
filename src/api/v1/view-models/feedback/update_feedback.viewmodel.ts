import { Expose } from "class-transformer";
import {
  IsDefined, IsNotEmpty,
  IsOptional,
  IsString
} from "class-validator";

export class UpdateFeedbackViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  feedback_token!: string;

  @IsOptional()
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  feedback_text!: string;
}
