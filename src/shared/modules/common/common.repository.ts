import { Injectable } from '@nestjs/common'

import type { IBaseModel } from '@shared/interfaces/base-model.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import type { PaginationService } from '@shared/services/pagination/pagination.service'

@Injectable()
export class CommonRepository extends BaseRepository<IBaseModel> {
  constructor(
    errorService: ErrorService,
    model: IBaseModel,
    entityName: string,
    paginationService?: PaginationService,
  ) {
    super(errorService, model, entityName, paginationService)
  }
}
