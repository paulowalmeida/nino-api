export interface BasePrismaDelegate {
    findMany: (args?: any) => Promise<any>
    findFirst: (args?: any) => Promise<any>
    create: (args?: any) => Promise<any>
    update: (args?: any) => Promise<any>
    count: (args?: any) => Promise<any>
    deleteMany: (args?: any) => Promise<any>
  }
