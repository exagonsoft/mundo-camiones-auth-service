/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUser(
    @Body()
    body: {
      username: string;
      password: string;
      role: string;
    },
  ) {
    return this.authService.createUser(body.username, body.password, body.role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: {
      username: string;
      password: string;
      role: string;
    },
    @Request() req,
  ) {
    return this.authService.updateUser(
      req.user,
      id,
      body.username,
      body.password,
      body.role,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(@Request() req) {
    return this.authService.getUsers(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserDetails(@Param('id') id: string, @Request() req) {
    return this.authService.getUserDetails(req.user, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string, @Request() req) {
    return this.authService.deleteUser(req.user, id);
  }
}
