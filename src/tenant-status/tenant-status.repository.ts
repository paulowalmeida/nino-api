import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { TenantStatus } from '@tenant-status/types/tenant-status.type'
import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'

@Injectable()
export class TenantStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

   async getAll(): Promise<TenantStatus[]> {
     try {
       return await this.prisma.tenantStatus.findMany({
         orderBy: { name: 'asc' },
       })
     } catch (error) {
       this.prismaErrorService.handleError(error)
     }
   }
 
   async getById(id: string): Promise<TenantStatus> {
     try {
       const found = await this.prisma.tenantStatus.findUnique({
         where: { id },
       })
 
       if (!found) throw new NotFoundException('Tenant Status not found')
 
       return found
     } catch (error) {
       this.prismaErrorService.handleError(error)
     }
   }
 
   async create(data: CreateTenantStatusDto): Promise<TenantStatus> {
     try {
       const existsByName = await this.prisma.tenantStatus.findUnique({
         where: { name: data.name },
       })
       if (existsByName) throw new ConflictException('Name already exists')
 
       return await this.prisma.tenantStatus.create({ data })
     } catch (error) {
       this.prismaErrorService.handleError(error)
     }
   }
 
   async update(id: string, data: UpdateTenantStatusDto): Promise<TenantStatus> {
     try {
       if (data.name) {
         const found = await this.prisma.tenantStatus.findUnique({
           where: { name: data.name },
         })
 
         if (found && found.id !== id) {
           throw new ConflictException('Name already exists')
         }
       }
 
       return await this.prisma.tenantStatus.update({
         where: { id },
         data,
       })
     } catch (error) {
       this.prismaErrorService.handleError(error)
     }
   }
 
   async delete(id: string): Promise<{ message: string }> {
     try {
       await this.prisma.tenantStatus.delete({ where: { id } })
       return { message: 'Tenant Status deleted successfully' }
     } catch (error) {
       this.prismaErrorService.handleError(error)
     }
   }
}
