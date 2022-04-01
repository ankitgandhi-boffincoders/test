import { Expose, Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class AddFeedbackViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Type(() => String)
  feedback_text!: string;

  @Expose()
  feedback_token!: string;

  @Expose()
  organization_id!: string;
}
