import * as dotenv from "dotenv";
dotenv.config();
var { parsed } = dotenv.config();

interface IEnvironmentConfig {
  JWT_TOKEN_SECRET:string;
  JWT_TOKEN_ISSUER:string;
  PORT:string;
}
var EnvironmentConfig: IEnvironmentConfig = <IEnvironmentConfig>(parsed as any);

export default EnvironmentConfig;