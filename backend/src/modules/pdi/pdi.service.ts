import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePdiEntryDto } from './dto/create-pdi-entry.dto';
import { CreatePdiRevisionDto } from './dto/create-pdi-revision.dto';
import { UpdatePdiEntryDto } from './dto/update-pdi-entry.dto';
import { PdiRepository } from './pdi.repository';

/**
 * Serviço responsável pela gestão de Planos de Desenvolvimento Individual (PDI).
 */
@Injectable()
export class PdiService {
  constructor(private readonly pdiRepository: PdiRepository) {}

  /**
   * Lista as entradas de PDI. Pode ser filtrado para um membro específico.
   *
   * @param memberId - ID opcional do membro para buscar apenas seus PDIs.
   * @returns Lista de PDIs cadastrados.
   */
  list(memberId?: string) {
    return this.pdiRepository.list(memberId);
  }

  /**
   * Busca uma entrada de PDI pelo ID.
   *
   * @param id - ID da entrada de PDI.
   * @returns Dados completos do PDI incluindo revisões.
   * @throws {NotFoundException} Se o PDI não for encontrado.
   */
  async getById(id: string) {
    const entry = await this.pdiRepository.findById(id);
    if (!entry) {
      throw new NotFoundException('Entrada de PDI nao encontrada.');
    }
    return entry;
  }

  /**
   * Cria uma nova entrada principal de PDI para um membro.
   *
   * @param payload - Dados de criação do PDI (título, conteúdo, ID do membro e ID do autor).
   * @returns A entrada de PDI recém-criada.
   */
  create(payload: CreatePdiEntryDto) {
    return this.pdiRepository.create(payload);
  }

  /**
   * Atualiza uma entrada de PDI. Quando o conteúdo é alterado, uma revisão é
   * automaticamente registrada em PdiEntryRevision para manter o histórico completo.
   *
   * @param id - ID da entrada de PDI.
   * @param payload - Dados parciais de atualização.
   * @param editorId - ID do usuário que está editando.
   * @returns A entrada de PDI atualizada.
   */
  update(id: string, payload: UpdatePdiEntryDto, editorId: string) {
    return this.pdiRepository.update(id, payload, editorId);
  }

  /**
   * Registra uma nova revisão (atualização de histórico) para um PDI existente.
   *
   * @param pdiEntryId - ID da entrada principal do PDI que está recebendo a revisão.
   * @param payload - Dados da revisão (novo conteúdo e ID do editor).
   * @returns A revisão criada atrelada ao PDI.
   */
  createRevision(pdiEntryId: string, payload: CreatePdiRevisionDto) {
    return this.pdiRepository.createRevision(pdiEntryId, payload);
  }
}
