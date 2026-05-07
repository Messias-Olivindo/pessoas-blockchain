import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
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
import { CreatePdiEntryDto } from './dto/create-pdi-entry.dto';
import { CreatePdiRevisionDto } from './dto/create-pdi-revision.dto';
import { UpdatePdiEntryDto } from './dto/update-pdi-entry.dto';
import { PdiService } from './pdi.service';

/**
 * PDI endpoints for members and revisions.
 */
@ApiTags('PDI')
@Controller('pdi')
@UseGuards(AuthGuard, RolesGuard)
export class PdiController {
  constructor(private readonly pdiService: PdiService) {}

  /**
   * List PDI entries.
   */
  @Get()
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'List PDI entries' })
  @ApiOkResponse({ description: 'List of PDI entries.' })
  @ApiQuery({ name: 'memberId', required: false })
  list(@Query('memberId') memberId?: string) {
    return this.pdiService.list(memberId);
  }

  /**
   * Get a PDI entry by id.
   */
  @Get(':id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Get PDI entry by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'PDI entry details.' })
  getById(@Param('id') id: string) {
    return this.pdiService.getById(id);
  }

  /**
   * Create a PDI entry. authorId is inferred from the authenticated user header.
   */
  @Post()
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create PDI entry' })
  @ApiBody({ type: CreatePdiEntryDto })
  @ApiOkResponse({ description: 'PDI entry created.' })
  create(@Body() body: CreatePdiEntryDto, @Req() req: Request) {
    const authorId = (req.user as { id: string })?.id;
    return this.pdiService.create({ ...body, authorId: body.authorId ?? authorId });
  }

  /**
   * Update a PDI entry. Automatically records a revision when content changes.
   */
  @Patch(':id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update PDI entry' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdatePdiEntryDto })
  @ApiOkResponse({ description: 'PDI entry updated.' })
  update(
    @Param('id') id: string,
    @Body() body: UpdatePdiEntryDto,
    @Req() req: Request,
  ) {
    const editorId = (req.user as { id: string })?.id;
    return this.pdiService.update(id, body, editorId);
  }

  /**
   * Create a PDI revision.
   */
  @Post(':id/revisions')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create PDI revision' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: CreatePdiRevisionDto })
  @ApiOkResponse({ description: 'PDI revision created.' })
  addRevision(
    @Param('id') pdiEntryId: string,
    @Body() body: CreatePdiRevisionDto,
  ) {
    return this.pdiService.createRevision(pdiEntryId, body);
  }
}
