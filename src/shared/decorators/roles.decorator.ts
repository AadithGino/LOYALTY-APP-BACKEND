import { SetMetadata } from "@nestjs/common/decorators"
export const Roles = (...roles:string[]) => SetMetadata('roles',roles)