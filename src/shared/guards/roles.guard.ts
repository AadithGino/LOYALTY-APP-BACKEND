import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "src/users/users.service";

export class RoleGuard implements CanActivate{
    constructor(private reflactor:Reflector,private readonly userService:UsersService){}
    async canActivate(context: ExecutionContext): Promise<boolean>{
        const roles = this.reflactor.get('roles',context.getHandler());
        const request = context.switchToHttp().getRequest();
        console.log(request);
        if(request?.user){
            const {sub,email} = request.user;
            const user = await this.userService.getUserByEmail(email)
            console.log(user);
            if(user) return true;
        }
        return false;
    }
}