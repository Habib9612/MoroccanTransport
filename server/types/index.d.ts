import { SelectUser } from "@db/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

declare module "yamljs" {
  export function load(path: string): any;
}

declare module "swagger-ui-express" {
  export function serve(): any;
  export function setup(spec: any): any;
}
