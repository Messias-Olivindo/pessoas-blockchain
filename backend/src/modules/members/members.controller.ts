import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateMemberAssignmentDto } from './dto/create-member-assignment.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateMemberAssignmentDto } from './dto/update-member-assignment.dto';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto';
import { MembersService } from './members.service';

/**
 * Member management endpoints.
 */
@ApiTags('Members')
@Controller('members')
@UseGuards(AuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /**
   * List members with optional filters.
   */
  @Get()
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List members' })
  @ApiOkResponse({ description: 'List of members.' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'position', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'race', required: false })
  @ApiQuery({ name: 'isLgbtqia', required: false })
  @ApiQuery({ name: 'interests', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  list(
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('position') position?: string,
    @Query('gender') gender?: string,
    @Query('race') race?: string,
    @Query('isLgbtqia') isLgbtqia?: string,
    @Query('interests') interests?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.membersService.list({
      status,
      department,
      position,
      gender,
      race,
      isLgbtqia,
      interests,
      q,
      cursor,
      limit,
    });
  }

  /**
   * Get a member by id.
   */
  @Get(':id')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'Get member by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Member details.' })
  getById(@Param('id') id: string) {
    return this.membersService.getById(id);
  }

  /**
   * Create a new member.
   */
  @Post()
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create member' })
  @ApiBody({ type: CreateMemberDto })
  @ApiOkResponse({ description: 'Member created.' })
  create(@Body() body: CreateMemberDto) {
    return this.membersService.create(body);
  }

  /**
   * Update a member.
   */
  @Patch(':id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update member' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateMemberDto })
  @ApiOkResponse({ description: 'Member updated.' })
  update(@Param('id') id: string, @Body() body: UpdateMemberDto) {
    return this.membersService.update(id, body);
  }

  /**
   * Update member status.
   */
  @Patch(':id/status')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update member status' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateMemberStatusDto })
  @ApiOkResponse({ description: 'Member status updated.' })
  updateStatus(@Param('id') id: string, @Body() body: UpdateMemberStatusDto) {
    return this.membersService.updateStatus(id, body.status);
  }

  /**
   * List member assignments.
   */
  @Get(':id/assignments')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'List member assignments' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Member assignments.' })
  listAssignments(@Param('id') id: string) {
    return this.membersService.listAssignments(id);
  }

  /**
   * Create a member assignment.
   */
  @Post(':id/assignments')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create member assignment' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: CreateMemberAssignmentDto })
  @ApiOkResponse({ description: 'Member assignment created.' })
  addAssignment(
    @Param('id') id: string,
    @Body() body: CreateMemberAssignmentDto,
  ) {
    return this.membersService.createAssignment(id, body);
  }

  /**
   * Update an assignment.
   */
  @Patch('assignments/:id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update member assignment' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateMemberAssignmentDto })
  @ApiOkResponse({ description: 'Member assignment updated.' })
  updateAssignment(
    @Param('id') assignmentId: string,
    @Body() body: UpdateMemberAssignmentDto,
  ) {
    return this.membersService.updateAssignment(assignmentId, body);
  }
}
