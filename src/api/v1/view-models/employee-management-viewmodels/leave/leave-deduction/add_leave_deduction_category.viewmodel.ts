import { Expose } from "class-transformer";
import { IsBoolean, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class AddLeaveDeductionCategoryViewmodel {
  @Expose()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @IsBoolean()
  @IsDefined()
  @IsNotEmpty()
  money_deduct!: boolean;


}
