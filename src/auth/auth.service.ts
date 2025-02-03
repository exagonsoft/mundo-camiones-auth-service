/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../db/models/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user
   * @param username - The username of the user
   * @param password - The password of the user
   * @returns The created user document
   */
  async register(username: string, password: string) {
    try {
      const existingUser = await this.userModel.findOne({ username });
      if (existingUser) {
        throw new BadRequestException('Username is already taken');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new this.userModel({
        username,
        password: hashedPassword,
      });
      return await newUser.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw known exception
      }
      console.error('Error during user registration:', error); // Log the unexpected error
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /**
   * Logs in an existing user
   * @param username - The username of the user
   * @param password - The password of the user
   * @returns JWT access token
   */
  async login(username: string, password: string) {
    try {
      const user = await this.userModel.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new BadRequestException('Invalid credentials');
      }

      const token = this.jwtService.sign(
        { id: user._id, role: user.role },
        { secret: process.env.JWT_SECRET },
      );
      return { user: user.username, role: user.role, access_token: token };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw known exception
      }
      console.error('Error during user login:', error); // Log the unexpected error
      throw new InternalServerErrorException('Failed to login user');
    }
  }
}
