/* eslint-disable prettier/prettier */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../db/models/user.schema';
import { JwtService } from '@nestjs/jwt';
import { DeleteResult } from 'typeorm/driver/mongodb/typings';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(username: string, password: string, role: string) {
    try {
      const user = new this.userModel({
        username,
        password: await bcrypt.hash(password, 10),
        role,
      });
      return user.save();
    } catch (error) {
      console.error('Error Creating User: ', error);
      throw new InternalServerErrorException('Server Error Creating User');
    }
  }

  async updateUser(
    user: { userId: string; role: string },
    _id: string,
    username: string,
    password: string,
    role: string,
  ) {
    try {
      const _user = await this.userModel.findById(_id).exec();

      if (!_user) {
        throw new NotFoundException('User not found');
      }

      // Allow updates only if user is an admin or the owner
      if (user.role !== 'admin' && user.userId !== _user._id) {
        throw new UnauthorizedException(
          'Only the User or an Administrator can update Users',
        );
      }

      // Update fields if provided
      _user.username = username ?? _user.username;
      _user.password = password
        ? await bcrypt.hash(password, 10)
        : _user.password;
      _user.role = role ?? _user.role;

      // Save the updated User
      await _user.save();

      return _user; // Return the updated User
    } catch (error) {
      console.error('Error Updating User:', error);
      throw new InternalServerErrorException('Server Error Updating User');
    }
  }

  async getUsers(user: { userId: string; role: string }) {
    try {
      if (user.role === 'admin') {
        return this.userModel.find().exec();
      } else {
        throw new UnauthorizedException(
          'Only  an Administrator can list Users',
        );
      }
    } catch (error) {
      console.error('Error Fetching Users: ', error);
      throw new InternalServerErrorException('Server Error Fetching User');
    }
  }

  async getUserDetails(user: { userId: string; role: string }, id: string) {
    try {
      const _user = await this.userModel.findById({ _id: id }).exec();

      if (user.role !== 'admin' && user.userId !== _user._id) {
        throw new UnauthorizedException(
          'Only the user or an administrator can get user details',
        );
      }

      return this.userModel.find({ _id: id }).exec();
    } catch (error) {
      console.error('Error Fetching Users: ', error);
      throw new InternalServerErrorException('Server Error Fetching User');
    }
  }

  async deleteUser(
    user: { userId: string; role: string },
    id: string,
  ): Promise<DeleteResult> {
    try {
      if (user.role !== 'admin') {
        throw new UnauthorizedException(
          'Only an Administrator are allowed to delete users',
        );
      }
      return this.userModel.deleteOne({ _id: id }).exec();
    } catch (error) {
      console.error('Error Fetching Users: ', error);
      throw new InternalServerErrorException('Server Error Fetching User');
    }
  }
}
