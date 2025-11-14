# Sistema de Gestão para Clínica Veterinária - TODO

## Arquitetura e Planejamento
- [x] Definir schema do banco de dados (pacientes, tutores, agendamentos, prontuários, vacinas)
- [ ] Criar modelos de dados e tipos TypeScript
- [ ] Planejar estrutura de pastas e componentes

## Backend - API REST com tRPC
- [x] Criar tabelas: patients, tutors, appointments, medical_records, vaccines, clinics, users
- [x] Implementar procedures para CRUD de pacientes
- [x] Implementar procedures para CRUD de tutores
- [x] Implementar procedures para CRUD de agendamentos
- [x] Implementar procedures para CRUD de prontuários
- [x] Implementar procedures para CRUD de vacinas e retornos
- [x] Criar helpers de query no server/db.ts
- [x] Implementar autenticação baseada em roles (recepcionista, veterinário, admin)

## Frontend - Interface React
- [x] Criar layout principal com navegação (DashboardLayout)
- [x] Implementar página de dashboard com resumo
- [x] Criar página de cadastro de pacientes
- [x] Criar página de cadastro de tutores
- [x] Criar página de gestão de agendamentos
- [x] Criar página de visualização de prontuários
- [x] Criar página de gestão de vacinas/retornos
- [ ] Implementar busca e filtros de pacientes
- [ ] Implementar visualização de histórico de consultas

## Alertas e Notificações
- [ ] Implementar sistema de alertas para vacinas vencidas
- [ ] Implementar sistema de alertas para retornos programados
- [ ] Criar notificações automáticas (push/email)
- [ ] Implementar job para verificar alertas periodicamente
- [ ] Criar interface para visualizar e gerenciar alertas

## Rastreabilidade e Auditoria
- [ ] Adicionar campos de auditoria (criado_por, atualizado_por, data_criação, data_atualização)
- [ ] Implementar log de alterações em prontuários
- [ ] Criar relatório de histórico de operações

## Testes e Qualidade
- [ ] Testar CRUD de pacientes
- [ ] Testar CRUD de agendamentos
- [ ] Testar sistema de alertas
- [ ] Validar rastreabilidade de operações
- [ ] Testar responsividade do frontend

## Integração GitHub
- [ ] Clonar repositório silvak1ing/simulado_saep
- [ ] Fazer push do código para o repositório
- [ ] Criar documentação (README.md)
- [ ] Adicionar instruções de setup e deployment

## Deploy e Publicação
- [ ] Criar checkpoint final
- [ ] Publicar projeto
- [ ] Validar funcionamento em produção
