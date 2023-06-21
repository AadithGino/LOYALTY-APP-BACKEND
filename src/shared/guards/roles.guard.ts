import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector,private readonly userService:UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get('roles', context.getHandler());
    const request:any = context.switchToHttp().getRequest();
    const user = await this.userService.getUserById(request.user.sub)
    const role = user.roles;
    if(roles.includes(role)) return true;
    return false;
  }
}
