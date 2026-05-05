import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { PdiModule } from './modules/pdi/pdi.module';
import { SelectionModule } from './modules/selection/selection.module';
import { UsersModule } from './modules/users/users.module';
import { ImportExportModule } from './modules/import-export/import-export.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, MembersModule, SelectionModule, PdiModule, ImportExportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
