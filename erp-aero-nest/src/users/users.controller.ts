import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('info')
  getUserInfo(@Request() req) {   
    return { id: req.user.id };
  }

  
}
