import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberStatus } from '@prisma/client';
import { CreateMemberDto } from './dto/create-member.dto';
import { CreateMemberAssignmentDto } from './dto/create-member-assignment.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersRepository } from './members.repository';

/**
 * Serviço responsável por concentrar toda a regra de negócio da gestão de membros.
 */
@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  /**
   * Lista todos os membros cadastrados, permitindo filtragem combinada e busca textual.
   *
   * @param params - Objeto contendo os filtros de busca.
   * @param params.status - Filtra por status do membro (ex: ACTIVE, ALUMNI, CANDIDATE).
   * @param params.department - Filtra por departamento (ex: PEOPLE, MARKETING, PROJECTS, EDUCATIONAL).
   * @param params.position - Filtra por cargo (ex: MEMBER, DIRECTOR, PRESIDENT, HEAD).
   * @param params.gender - Filtra por gênero.
   * @param params.race - Filtra por raça.
   * @param params.isLgbtqia - Filtra pela flag de LGBTQIAPN+ ('true' ou 'false').
   * @param params.interests - Filtra por áreas de interesse do membro.
   * @param params.q - Busca textual livre que deve coincidir com o nome ou email do membro.
   * @returns Retorna uma lista com os membros que atendem aos critérios de busca.
   */
  list(params: {
    status?: string;
    department?: string;
    position?: string;
    gender?: string;
    race?: string;
    isLgbtqia?: string;
    interests?: string;
    q?: string;
    cursor?: string;
    limit?: string;
  }) {
    const limit = params.limit ? Number(params.limit) : 20;
    return this.membersRepository.findMany({
      status: params.status,
      department: params.department,
      position: params.position,
      gender: params.gender,
      race: params.race,
      isLgbtqia: params.isLgbtqia,
      interests: params.interests,
      q: params.q,
      cursor: params.cursor,
      limit,
    });
  }

  /**
   * Busca os detalhes de um membro específico a partir do seu ID.
   *
   * @param id - Identificador único (UUID) do membro.
   * @returns Retorna os dados completos do membro encontrado.
   * @throws {NotFoundException} Caso não exista nenhum membro associado ao ID informado.
   */
  async getById(id: string) {
    const member = await this.membersRepository.findById(id);
    if (!member) {
      throw new NotFoundException('Membro nao encontrado.');
    }

    return member;
  }

  /**
   * Registra a criação de um novo membro na plataforma.
   *
   * @param payload - Objeto DTO contendo as informações necessárias (nome, email, status inicial, etc).
   * @returns Retorna o registro recém-criado do membro.
   */
  create(payload: CreateMemberDto) {
    return this.membersRepository.create(payload);
  }

  /**
   * Atualiza os dados cadastrais de um membro existente.
   *
   * @param id - Identificador único (UUID) do membro a ser atualizado.
   * @param payload - Objeto DTO com os campos que serão alterados (parcial).
   * @returns Retorna o membro com os dados já atualizados.
   */
  update(id: string, payload: UpdateMemberDto) {
    return this.membersRepository.update(id, payload);
  }

  /**
   * Lista todas as atribuições, alocações e papéis históricos (assignments) do membro.
   *
   * @param memberId - Identificador único (UUID) do membro.
   * @returns Retorna um array contendo o histórico de atribuições deste membro.
   */
  listAssignments(memberId: string) {
    return this.membersRepository.listAssignments(memberId);
  }

  /**
   * Adiciona um novo registro de atribuição, alocação ou papel ao histórico do membro.
   *
   * @param memberId - Identificador único (UUID) do membro.
   * @param payload - Dados da atribuição (descrição, data de início e possível data de fim).
   * @returns Retorna a atribuição recém-criada.
   */
  createAssignment(memberId: string, payload: CreateMemberAssignmentDto) {
    return this.membersRepository.createAssignment(memberId, payload);
  }

  updateStatus(memberId: string, status: string) {
    return this.membersRepository.updateStatus(
      memberId,
      status as MemberStatus,
    );
  }

  updateAssignment(
    assignmentId: string,
    payload: {
      description?: string;
      startAt?: string;
      endAt?: string;
    },
  ) {
    return this.membersRepository.updateAssignment(assignmentId, payload);
  }
}
