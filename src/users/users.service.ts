import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    
    async userLogin(dto){
        dto.password = await bcrypt.hash(dto.password,10)
        return dto;
    }
}
