import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel('users') private readonly userModel: Model<User>) {}

  async createUser(user: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = new this.userModel({
      ...user,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<any> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async updateUser(id: string, user: any): Promise<User> {
    const existingUser = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return existingUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async createBookmark(bookmark: string, id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (user.bookmarks.some((b) => b.bookmark === bookmark)) {
      throw new ConflictException('Bookmark already exists');
    }
    user.bookmarks.push({ bookmark });
    return user.save();
  }

  async deleteBookmark(bookmark: string, id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const index = user.bookmarks.findIndex((b) => b.bookmark === bookmark);
    if (index > -1) {
      user.bookmarks.splice(index, 1);
      return user.save();
    } else {
      throw new NotFoundException('Bookmark not found');
    }
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    return user.save();
  }

  async getSummary(): Promise<any> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const result = await this.userModel
        .aggregate([
          {
            $facet: {
              totalItems: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              itemsLast24Hours: [
                {
                  $match: {
                    createdAt: { $gte: yesterday },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
            },
          },
        ])
        .exec();

      // Safeguard to prevent accessing properties of undefined
      const totalItemsCount = result[0]?.totalItems[0]?.count || 0;
      const itemsLast24HoursCount = result[0]?.itemsLast24Hours[0]?.count || 0;

      return {
        totalItems: totalItemsCount,
        itemsLast24Hours: itemsLast24HoursCount,
      };
    } catch (error) {
      throw new Error(`Unable to get summary: ${error.message}`);
    }
  }
}
