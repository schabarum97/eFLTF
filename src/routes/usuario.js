const usuarioController = require('../controllers/usuario');

module.exports = (app) => {

  app.get('/usuario', usuarioController.getUsuarios
    /*
        #swagger.tags = ["Usuário"]
        #swagger.summary = "Lista todos os usuários"
        #swagger.description = "Retorna a lista completa de usuários (sem hash/salt)."

        #swagger.responses[200] = {
          description: "Sucesso!",
          schema: {
            total: 2,
            items: [
              {
                usu_id: 1,
                usu_email: "joao@example.com",
                usu_nome: "João da Silva",
                usu_ativo: true,
                usu_criacao: "2024-01-10",
                usu_alteracao: "2024-02-15"
              },
              {
                usu_id: 2,
                usu_email: "maria@example.com",
                usu_nome: "Maria Souza",
                usu_ativo: true,
                usu_criacao: "2024-03-01",
                usu_alteracao: "2024-03-20"
              }
            ]
          }
        }
        #swagger.responses[500] = { description: "Erro ao buscar Usuários" }
    */
  );

  app.get('/usuario/:id', usuarioController.getById
    /*
        #swagger.tags = ["Usuário"]
        #swagger.summary = "Consulta usuário por ID"
        #swagger.description = "Retorna os dados públicos de um usuário específico."

        #swagger.parameters['id'] = {
          in: "path",
          description: "ID do usuário",
          required: true,
          type: "integer",
          example: 1
        }

        #swagger.responses[200] = {
          description: "Sucesso!",
          schema: {
            total: 1,
            item: {
              usu_id: 1,
              usu_email: "joao@example.com",
              usu_nome: "João da Silva",
              usu_ativo: true,
              usu_criacao: "2024-01-10",
              usu_alteracao: "2024-02-15"
            }
          }
        }
        #swagger.responses[404] = { description: "Usuário não encontrado" }
        #swagger.responses[500] = { description: "Erro ao buscar Usuário" }
    */
  );

  app.post('/usuario', usuarioController.postUsuario
    /*
        #swagger.tags = ["Usuário"]
        #swagger.summary = "Cria um novo usuário"
        #swagger.description = "Cria um usuário exigindo email, nome e senha. Internamente gera salt e hash."

        #swagger.parameters['obj'] = {
          in: "body",
          required: true,
          description: "Dados para criação do usuário",
          schema: {
            $email: "novo@exemplo.com",
            $nome: "Novo Usuário",
            $senha: "SenhaForte123"
          }
        }

        #swagger.responses[201] = {
          description: "Usuário criado",
          schema: { mensagem: "Usuário criado com sucesso!", id: 123 }
        }
        #swagger.responses[500] = { description: "Erro ao tentar criar Usuário (ex.: campos obrigatórios ausentes)" }
    */
  );

  app.patch('/usuario/:id', usuarioController.patchUsuario
    /*
        #swagger.tags = ["Usuário"]
        #swagger.summary = "Atualiza parcialmente um usuário"
        #swagger.description = "Atualiza nome e/ou senha. Exige a senha atual (pass) para validar."

        #swagger.parameters['id'] = {
          in: "path",
          description: "ID do usuário",
          required: true,
          type: "integer",
          example: 1
        }

        #swagger.parameters['obj'] = {
          in: "body",
          required: true,
          description: "Campos aceitos: name (novo nome), newpass (nova senha) e pass (senha atual - obrigatória)",
          schema: {
            $pass: "SenhaAtual123",
            name: "Nome Atualizado",
            newpass: "NovaSenha456"
          }
        }

        #swagger.responses[200] = {
          description: "Operação concluída",
          schema: { mensagem: "Dados atualizados com sucesso!" }
        }
        #swagger.responses[200] = {
          description: "Nada para atualizar (quando não vem name/newpass)",
          schema: { mensagem: "Nada para atualizar" }
        }
        #swagger.responses[200] = {
          description: "Senha inválida",
          schema: { mensagem: "Senha inválida" }
        }
        #swagger.responses[400] = { description: "id e pass são obrigatórios" }
        #swagger.responses[404] = { description: "Usuário não encontrado" }
        #swagger.responses[500] = { description: "Erro ao atualizar Usuário" }
    */
  );

  app.delete('/usuario/:id', usuarioController.deleteUsuario
    /*
        #swagger.tags = ["Usuário"]
        #swagger.summary = "Deleta um usuário por ID"
        #swagger.description = "Remove o usuário informado. Retorna mensagem de sucesso."

        #swagger.parameters['id'] = {
          in: "path",
          description: "ID do usuário",
          required: true,
          type: "integer",
          example: 1
        }

        #swagger.responses[200] = {
          description: "Usuário deletado",
          schema: { mensagem: "Usuário deletado com sucesso!" }
        }
        #swagger.responses[404] = { description: "Usuário não encontrado" }
        #swagger.responses[500] = { description: "Erro ao tentar deletar o Usuário" }
    */
  );

};
