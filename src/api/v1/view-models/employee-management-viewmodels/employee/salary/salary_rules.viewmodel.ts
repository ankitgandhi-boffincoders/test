import { Expose, Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Default } from "../../../../common/custom-decorators";
class EmployeeSalaryViewmodel {

    @IsOptional()
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    @Default(0)
    @Type(() => Number)
    house_rent_allowance!: number;
  
    @IsOptional()
    @Expose()
    @IsNumber({allowNaN: false})
    @IsDefined()
    @IsNotEmpty()
    @Default(0)
    @Type(() => Number)
    leave_travel_allowance?: number;
  
    @IsOptional()
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    @Default(0)
    @Type(() => Number)
    conveyance_allowance!: number;
  
    @IsOptional()
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    @Default(0)
    @Type(() => Number)
    medical_allowance!: number;
  
    @IsOptional()
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    @Default(0)
    @Type(() => Number)
    personal_allowance!: number;
  
    @IsOptional()
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    @Default(0)
    @Type(() => Number)
    bonus!: number;
  
    @IsOptional()
    @Expose()
    @IsDefined()
    @IsNotEmpty()
    @Default(0)
    @Type(() => Number)
    tiffin_allowance!: number;
  
  
  }