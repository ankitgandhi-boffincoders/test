import { Expose } from "class-transformer";
import {
  IsDefined,
  IsNotEmpty, IsString
} from "class-validator";

export class AddFeedbackReplyViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  reply_text!: string;

  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  feedback_token!: string;
}
