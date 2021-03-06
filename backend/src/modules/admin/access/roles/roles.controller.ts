import {
  ValidationPipe,
  ParseIntPipe,
  Controller,
  UseGuards,
  Param,
  Body,
  Get,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  UpdateRoleRequestDto,
  CreateRoleRequestDto,
  RoleResponseDto,
} from './dtos';
import { RolesService } from './roles.service';
import { PermissionsGuard, JwtAuthGuard, Permissions, TOKEN_NAME } from '@auth';
import {
  ApiGlobalResponse,
  ApiPaginatedResponse,
  PaginationParams,
} from '@common/decorators';
import { PaginationRequest } from '@common/interfaces';
import { PaginationResponseDto } from '@common/dtos';

@ApiTags('Roles')
@ApiBearerAuth(TOKEN_NAME)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({
  path: 'access/roles',
  version: '1',
})
export class RolesController {
  constructor(private RolesService: RolesService) {}

  @ApiOperation({ description: 'Get a paginated role list' })
  @ApiPaginatedResponse(RoleResponseDto)
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    example: 'admin',
  })
  @Permissions(
    'admin.access.roles.read',
    'admin.access.roles.create',
    'admin.access.roles.update',
  )
  @Get()
  public getRoles(
    @PaginationParams() pagination: PaginationRequest,
  ): Promise<PaginationResponseDto<RoleResponseDto>> {
    return this.RolesService.getRoles(pagination);
  }

  @ApiOperation({ description: 'Get role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @Permissions(
    'admin.access.roles.read',
    'admin.access.roles.create',
    'admin.access.roles.update',
  )
  @Get('/:id')
  public getRoleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RoleResponseDto> {
    return this.RolesService.getRoleById(id);
  }

  @ApiOperation({ description: 'Create new role' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions('admin.access.roles.create')
  @Post()
  public createRole(
    @Body(ValidationPipe) roleDto: CreateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    return this.RolesService.createRole(roleDto);
  }

  @ApiOperation({ description: 'Update role by id' })
  @ApiGlobalResponse(RoleResponseDto)
  @ApiConflictResponse({ description: 'Role already exists' })
  @Permissions('admin.access.roles.update')
  @Put('/:id')
  public updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) roleDto: UpdateRoleRequestDto,
  ): Promise<RoleResponseDto> {
    return this.RolesService.updateRole(id, roleDto);
  }
}
