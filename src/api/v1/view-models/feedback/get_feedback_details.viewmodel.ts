import { Expose } from "class-transformer";
import {
  IsDefined,
  IsNotEmpty, IsString
} from "class-validator";

export class GetFeedbackDetailsViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  feedback_token!: string;

}
