import { PaginationParams } from '@common/decorators';
import { PaginationRequest } from '@common/interfaces';
import { SliceItem } from '@global-enums/subtitles.enum';
import { UserEntity } from '@modules/admin/access/users/user.entity';
import {
  CurrentUser,
  JwtAuthGuard,
  PermissionsGuard,
  TOKEN_NAME,
} from '@modules/auth';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTransfyRequestDto } from './dtos/';
import { TransfyService } from './transfy.service';

@ApiTags('Transfy')
@ApiBearerAuth(TOKEN_NAME)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({
  path: 'transfy-ai/transfy',
  version: '1',
})
export class TransfyController {
  constructor(private transfyService: TransfyService) {}

  @ApiOperation({ description: '重置分割字幕' })
  @Get('/resplit/:id')
  public resplitSubtitles(@Param('id', ParseUUIDPipe) id: string) {
    return this.transfyService.resplitSubtitles(id);
  }

  @ApiOperation({ description: '更新修改的字幕文件与属性' })
  @Patch('/subtitles/:id')
  public updateSubtitlesTransfy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() subtitles: SliceItem[],
  ) {
    return this.transfyService.updateSubtitlesTransfy(id, subtitles);
  }

  @ApiOperation({ description: '运行自动转译任务' })
  @Get('/run_rec/:id')
  public runRecQueueTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.transfyService.runRecQueueTask(id);
  }

  @ApiOperation({ description: '删除项目' })
  @Delete()
  public deleteTransfy(@Body() ids: string[]) {
    return this.transfyService.deleteTransfy(ids);
  }
  /**
   * 字幕转译分页
   * @param pagination 分页参数
   * @returns 分页
   */
  @ApiOperation({ description: '字幕转译项目分页' })
  @Get('/page')
  public getTransfyPage(@PaginationParams() pagination: PaginationRequest) {
    return this.transfyService.getTransfyPage(pagination);
  }
  /**
   * 创建字幕转译项目
   */
  @ApiOperation({ description: '创建字幕转译项目' })
  @Post()
  public createTransfy(
    @Body(ValidationPipe) transfyFormDto: CreateTransfyRequestDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.transfyService.createTransfy(transfyFormDto, user);
  }
  /**
   * 获取单个详情
   * @param id ID
   * @returns
   */
  @ApiOperation({ description: '查询详情' })
  @Get('/:id')
  public getTransfy(@Param('id', ParseUUIDPipe) id: string) {
    return this.transfyService.getTransfy(id);
  }
}
