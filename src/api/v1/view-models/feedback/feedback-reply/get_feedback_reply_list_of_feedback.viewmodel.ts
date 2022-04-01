import { Expose, Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GetFeedbackReplyListViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @Type(()=>String)
  feedback_token!: string;

}
