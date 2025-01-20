/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * @param body - Contains username and password
   */
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    try {
      const user = await this.authService.register(
        body.username,
        body.password,
      );
      return { message: 'User registered successfully', user };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Log in an existing user
   * @param body - Contains username and password
   */
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    try {
      const token = await this.authService.login(body.username, body.password);
      return { id: token.user, role: token.role, access_token: token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get the profile of the currently authenticated user
   * This route is protected by JWT
   * @param req - Request object containing user details from the JWT payload
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return {
      message: 'This is a protected route',
      user: req.user, // Populated by JwtStrategy validate() method
    };
  }
}
