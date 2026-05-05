import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { ApproveUserDto } from './dto/approve-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

/**
 * User management endpoints.
 */
@Controller('users')
@ApiTags('Users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * List users with optional filters.
   */
  @Get()
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ description: 'List of users.' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  list(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.list({ role, status, q, cursor, limit });
  }

  /**
   * Get a user by id.
   */
  @Get(':id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'User details.' })
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  /**
   * Approve or reject a user.
   */
  @Patch(':id/approve')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Approve or reject a user' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: ApproveUserDto })
  @ApiOkResponse({ description: 'Updated user status.' })
  approve(@Param('id') id: string, @Body() body: ApproveUserDto) {
    return this.usersService.updateStatus(id, body.status);
  }

  /**
   * Update a user role.
   */
  @Patch(':id/role')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiOkResponse({ description: 'Updated user role.' })
  updateRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, body.role);
  }
}
