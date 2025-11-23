# Sistema de Gerenciamento de Almoxarifado - TODO

## Autenticação e Usuários
- [x] Interface de login com validação de credenciais
- [x] Tratamento de erros de autenticação com mensagens informativas
- [x] Redirecionamento automático para login em caso de falha
- [x] Funcionalidade de logout com redirecionamento para login
- [x] Exibição do nome do usuário logado na interface principal

## Interface Principal
- [x] Layout principal com navegação intuitiva
- [x] Exibição do nome do usuário logado
- [x] Menu de navegação para "Cadastro de Produto"
- [x] Menu de navegação para "Gestão de Estoque"
- [x] Botão de logout com redirecionamento

## Cadastro de Produtos
- [x] Listar produtos cadastrados em tabela
- [x] Carregamento automático de produtos ao acessar a interface
- [x] Campo de busca para filtrar produtos
- [x] Atualização dinâmica da tabela conforme busca
- [x] Formulário para adicionar novo produto
- [x] Validação de dados do novo produto
- [x] Funcionalidade de edição de produto existente
- [x] Validação de dados na edição
- [x] Funcionalidade de exclusão de produto
- [x] Confirmação antes de deletar
- [x] Mensagens de alerta para validações
- [x] Botão para retornar à interface principal

## Gestão de Estoque
- [x] Listar produtos em ordem alfabética
- [x] Implementar algoritmo de ordenação
- [x] Interface para registrar entrada de produto
- [x] Interface para registrar saída de produto
- [x] Campo para quantidade de entrada/saída
- [x] Campo para data da movimentação (automática)
- [x] Campo para identificação do responsável (usuário logado)
- [x] Validação de quantidade disponível para saída
- [x] Registro de histórico de movimentações
- [x] Exibição do histórico com data, responsável e tipo de movimentação
- [x] Sistema de alerta para estoque mínimo
- [x] Configuração de estoque mínimo por produto
- [x] Notificações automáticas quando estoque fica abaixo do mínimo
- [x] Rastreabilidade completa das operações

## Banco de Dados
- [x] Tabela de usuários (já existe)
- [x] Tabela de produtos com campos: id, nome, descrição, quantidade, estoque_mínimo
- [x] Tabela de movimentações com: id, produto_id, tipo (entrada/saída), quantidade, data, responsável_id
- [x] Relacionamentos entre tabelas
- [x] Índices para otimização de buscas

## Backend (tRPC Procedures)
- [x] Procedimento para listar produtos
- [x] Procedimento para buscar produtos por termo
- [x] Procedimento para criar novo produto
- [x] Procedimento para atualizar produto
- [x] Procedimento para deletar produto
- [x] Procedimento para registrar entrada de estoque
- [x] Procedimento para registrar saída de estoque
- [x] Procedimento para listar histórico de movimentações
- [x] Procedimento para obter estoque mínimo de um produto
- [x] Procedimento para listar produtos com estoque baixo

## Frontend (React Components)
- [x] Componente de Login
- [x] Componente de Dashboard Principal
- [x] Componente de Cadastro de Produtos
- [x] Componente de Tabela de Produtos
- [x] Componente de Formulário de Produto
- [x] Componente de Busca de Produtos
- [x] Componente de Gestão de Estoque
- [x] Componente de Formulário de Movimentação
- [x] Componente de Histórico de Movimentações (integrado na tabela)
- [x] Componente de Alertas de Estoque Mínimo

## Testes
- [x] Testes unitários para procedures de autenticação (já existente)
- [ ] Testes para procedures de produtos
- [ ] Testes para procedures de estoque
- [ ] Testes de validação de dados

## Design e UX
- [x] Escolher paleta de cores e tipografia
- [x] Implementar tema consistente com Tailwind CSS
- [x] Design responsivo para diferentes tamanhos de tela
- [x] Ícones e indicadores visuais apropriados
- [x] Mensagens de feedback ao usuário (sucesso, erro, aviso)
- [x] Estados de carregamento em tabelas e formulários
