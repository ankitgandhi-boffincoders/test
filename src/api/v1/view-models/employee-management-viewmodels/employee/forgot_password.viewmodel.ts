import { Expose, Type } from "class-transformer";
import {
    IsDefined,
    IsEmail,
    IsNotEmpty,
    IsString
} from "class-validator";
export class ForgotPasswordViewmodel {
    @Expose()
    @IsDefined()
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @Type(() => String)
    email!: string;

}