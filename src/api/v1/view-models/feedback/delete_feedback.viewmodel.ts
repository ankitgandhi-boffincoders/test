import { Expose } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class DeleteFeedbackViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  feedback_token!: string;

}
