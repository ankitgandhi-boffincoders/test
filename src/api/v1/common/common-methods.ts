import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import jwt from "jsonwebtoken";
import "reflect-metadata";
import { MessageFormatter } from "./message-formatter";

export class ValidationResult {
  data: any;
  error: any;
}
export interface IAPIResponse {
  status_code: number;
  success: boolean;
  errors?: string[];
  data?: object;
}
export interface IServiceResult {
  status_code: number;
  data: any;
}

export class Utility {
  errors = [];
  ValidateAndConvert = async (classToConvert: any, body: string) => {
    const result = new ValidationResult();

    result.data = plainToClass(classToConvert, body);
    await validate(result.data, {
      skipMissingProperties: true,
      excludeExtraneousValues: true,
    }).then((errors) => {
      let errors_temp = MessageFormatter.format(errors);
      result.error = errors_temp;
      return result;
    });
    return result;
  };
  signJWT = (payload: any, expires_in?: string): string => {
    let jwtToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET || "", {
      issuer: process.env.JWT_TOKEN_ISSUER || "",
      expiresIn: expires_in ?? "300s",
      audience: process.env.JWT_AUDIENCE || "",
    });
    return jwtToken;
  };

  daysInMonth = (month: number, year: number) => {
    // Use 1 for January, 2 for February, etc.
    return new Date(year, month, 0).getDate();
  };
  //countSpecificDayInMonth----checkday=0 for sunday, 1 for monday so on...
  countSpecificDayInMonth(year: number, month: number, checkday: number) {
    var day = 1;
    var counter = 0;
    var date = new Date(year, month, day);
    while (date.getMonth() === month) {
      if (date.getDay() === checkday) {
        counter++;
      }
      day++;
      date = new Date(year, month, day);
    }
    return counter;
  }

  isValidDate(year: number, month: number, day: number) {
    month = month - 1;
    var d = new Date(year, month, day);
    if (
      d.getFullYear() == year &&
      d.getMonth() == month &&
      d.getDate() == day
    ) {
      return true;
    }
    return false;
  }
}

export default new Utility();
