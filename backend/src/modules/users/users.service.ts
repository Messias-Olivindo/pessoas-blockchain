import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

/**
 * Serviço de gerenciamento de usuários.
 * Implementa a regra de negócios para controle de acesso, busca e atualização de permissões.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Lista usuários com base nos filtros fornecidos.
   * Suporta paginação por cursor.
   *
   * @param params Filtros de busca e opções de paginação
   * @returns Lista paginada de usuários
   */
  async list(params: {
    role?: string;
    status?: string;
    q?: string;
    cursor?: string;
    limit?: string;
  }) {
    const limit = params.limit ? Number(params.limit) : 20;
    const users = await this.usersRepository.findMany({
      role: params.role,
      status: params.status,
      q: params.q,
      cursor: params.cursor,
      limit,
    });

    return { items: users };
  }

  /**
   * Obtém os detalhes de um usuário pelo seu ID único.
   *
   * @param id ID do usuário
   * @throws NotFoundException Se o usuário não for encontrado
   * @returns Usuário correspondente ao ID
   */
  async getById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return user;
  }

  /**
   * Atualiza o status de aprovação de um usuário.
   *
   * @param id ID do usuário
   * @param status Novo status do usuário ('APPROVED', 'REJECTED', etc)
   * @returns Usuário atualizado
   */
  async updateStatus(id: string, status: string) {
    return this.usersRepository.updateStatus(id, status);
  }

  /**
   * Atualiza o papel (role) de um usuário, definindo seu nível de acesso.
   *
   * @param id ID do usuário
   * @param role Novo papel do usuário ('ADMIN', 'PEOPLE', etc)
   * @returns Usuário atualizado
   */
  async updateRole(id: string, role: string) {
    return this.usersRepository.updateRole(id, role);
  }
}
