import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/api/register')
  register(@Body() user: any) {
    return this.usersService.createUser(user);
  }

  @Post('/api/profiles/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  createBookmark(@Param('id') id: string, @Body() body: { bookmark: string }) {
    return this.usersService.createBookmark(body.bookmark, id);
  }

  @Delete('/api/profiles/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  deleteBookmark(@Param('id') id: string, @Body() body: { bookmark: string }) {
    return this.usersService.deleteBookmark(body.bookmark, id);
  }

  @Get('api/profiles/:id')
  @UseGuards(JwtAuthGuard)
  getProfile(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Patch('api/profiles/:id')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Param('id') id: string, @Body() user: any) {
    return this.usersService.updateUser(id, user);
  }

  @Get('/api/users')
  @UseGuards(JwtAuthGuard)
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('/api/users/:id')
  @UseGuards(JwtAuthGuard)
  findOneUser(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Patch('/api/users/:id')
  @UseGuards(JwtAuthGuard)
  updateUser(@Param('id') id: string, @Body() user: any) {
    return this.usersService.updateUser(id, user);
  }

  @Delete('/api/users/:id')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch('/api/profiles/:id/password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Param('id') id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.changePassword(id, currentPassword, newPassword);
  }

  @Get('api/summary/users')
  getSummary(): Promise<any> {
    return this.usersService.getSummary();
  }
}
