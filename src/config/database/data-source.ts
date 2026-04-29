import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
config({ path: join(process.cwd(), '.env') })

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'database',
  entities: [join(__dirname, '../../**/*.entity.ts')],
  migrations: [join(__dirname, '../../../migrations/*.ts')],
  synchronize: false,
  logging: true,
})
