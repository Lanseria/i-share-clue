import { PaginationRequest } from '@common/interfaces';
import { Logger } from '@nestjs/common';
import { Polygon } from 'geojson';
import { gcj02towgs84 } from 'src/helpers/convert';
import { EntityRepository, Repository } from 'typeorm';
import { ProjectEntity } from './project.entity';
import * as _ from 'lodash';
// '{"type":"Polygon","coordinates":[[
// [121.9207763671875,29.919827938891753],
// [122.35404968261719,29.919827938891753],
// [122.35404968261719,30.194992169502903],
// [121.9207763671875,30.194992169502903],
// [121.9207763671875,29.919827938891753]
// ]]}'
@EntityRepository(ProjectEntity)
export class ProjectRepository extends Repository<ProjectEntity> {
  // TODO: 合并分页统一逻辑
  getProjectsAndCount(
    pagination: PaginationRequest,
  ): Promise<[projectEntities: ProjectEntity[], total: number]> {
    let {
      skip,
      limit: take,
      order,
      params: { name },
    } = pagination;
    let query = this.createQueryBuilder('p')
      .leftJoinAndSelect('p.creator', 'u')
      .skip(skip)
      .take(take);
    // Logger.log(pagination, this.constructor.toString().match(/\w+/g)[1]);
    if (!_.isEmpty(order)) {
      const orderIter = Object.keys(order).map((key) => {
        return [`p.${key}`, order[key]];
      });
      order = Object.fromEntries(orderIter);
      query = query.orderBy(order);
    } else {
      query = query.orderBy('p.createdAt', 'DESC');
    }
    if (name) {
      query.where(`u.name ILIKE :search`, { search: `%${name}%` });
    }
    // 回传上面API所组出來的Raw SQL, debug用
    // const sql = query.getSql();
    // Logger.log(sql, this.constructor.toString().match(/\w+/g)[1]);
    return query.getManyAndCount();
  }

  public searchArea(bounds: [number, number, number, number]) {
    const area: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          gcj02towgs84(bounds[1], bounds[0]),
          gcj02towgs84(bounds[3], bounds[0]),
          gcj02towgs84(bounds[3], bounds[2]),
          gcj02towgs84(bounds[1], bounds[2]),
          gcj02towgs84(bounds[1], bounds[0]),
        ],
      ],
    };
    const query = this.createQueryBuilder('p')
      .leftJoinAndSelect('p.creator', 'u')
      .where(`ST_DWithin(location, ST_GeomFromGeoJSON(:area), 0)`)
      .setParameters({
        // 字符串化 GeoJSON
        area: JSON.stringify(area),
      });
    return query.getManyAndCount();
  }
}
