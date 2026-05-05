import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SelectionController } from './selection.controller';
import { SelectionRepository } from './selection.repository';
import { SelectionService } from './selection.service';

@Module({
  imports: [AuthModule],
  controllers: [SelectionController],
  providers: [SelectionService, SelectionRepository],
})
export class SelectionModule {}
