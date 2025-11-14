# Sistema de Gestão para Clínica Veterinária

Um sistema web completo para gerenciar clínicas veterinárias de médio porte com múltiplas unidades espalhadas pela cidade. O sistema centraliza a gestão de pacientes, tutores, agendamentos e prontuários, garantindo rastreabilidade e transparência dos processos.

## Funcionalidades Principais

### 📋 Gestão de Pacientes
- Cadastro completo de animais (cães, gatos, pássaros, coelhos, hamsters e outros)
- Armazenamento de informações como raça, cor, peso, data de nascimento e microchip
- Associação automática com tutores
- Histórico completo de consultas e procedimentos

### 👥 Gestão de Tutores
- Cadastro de proprietários com informações de contato
- Armazenamento de CPF, endereço e dados de localização
- Vinculação com múltiplos pacientes
- Gerenciamento de preferências e observações

### 📅 Agendamentos
- Sistema intuitivo de agendamento de consultas
- Visualização de calendário com disponibilidade
- Controle de status (agendado, concluído, cancelado, não compareceu)
- Registro de motivo da consulta e duração

### 📝 Prontuários Eletrônicos
- Registro completo de consultas, procedimentos e exames
- Campos para diagnóstico, tratamento e prescrição
- Histórico completo de atendimentos
- Rastreabilidade com identificação de responsável e data

### 💊 Gestão de Vacinas
- Registro de todas as vacinações realizadas
- Controle de próximas doses programadas
- Alertas automáticos para vacinas vencidas
- Armazenamento de número de lote e observações

### 🚨 Sistema de Alertas
- Alertas automáticos para vacinas vencidas
- Alertas para retornos programados
- Alertas para agendamentos próximos
- Notificações automáticas quando prazos estão próximos
- Interface para gerenciar e resolver alertas

### 🔐 Controle de Acesso
- Autenticação baseada em OAuth
- Roles diferenciadas: Recepcionista, Veterinário, Administrador
- Permissões específicas por função
- Rastreabilidade de quem criou/modificou cada registro

### 📊 Auditoria e Rastreabilidade
- Log completo de todas as operações
- Registro de quem fez cada alteração e quando
- Histórico de mudanças em registros críticos
- Transparência total dos processos

## Tecnologias Utilizadas

### Backend
- **Node.js** com Express 4
- **tRPC 11** para API type-safe
- **MySQL/TiDB** com Drizzle ORM
- **TypeScript** para type safety
- **Manus OAuth** para autenticação

### Frontend
- **React 19** com Vite
- **Tailwind CSS 4** para styling
- **shadcn/ui** para componentes
- **Wouter** para roteamento
- **Sonner** para notificações

## Estrutura do Projeto

```
vet_clinic_manager/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Home.tsx      # Dashboard principal
│   │   │   ├── Patients.tsx  # Gestão de pacientes
│   │   │   ├── Tutors.tsx    # Gestão de tutores
│   │   │   ├── Appointments.tsx # Agendamentos
│   │   │   ├── MedicalRecords.tsx # Prontuários
│   │   │   ├── Vaccines.tsx  # Vacinas
│   │   │   └── Alerts.tsx    # Alertas
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Utilitários e configurações
│   │   └── App.tsx           # Roteamento principal
│   └── public/               # Arquivos estáticos
├── server/                   # Backend Express
│   ├── routers.ts            # Procedures tRPC
│   ├── db.ts                 # Query helpers
│   └── _core/                # Configurações internas
├── drizzle/                  # Schema do banco de dados
│   ├── schema.ts             # Definição de tabelas
│   └── migrations/           # Migrações do banco
└── shared/                   # Código compartilhado

```

## Banco de Dados

O sistema utiliza as seguintes tabelas:

- **users** - Usuários do sistema com roles diferenciadas
- **clinics** - Unidades da clínica
- **tutors** - Proprietários dos animais
- **patients** - Animais (pacientes)
- **appointments** - Agendamentos de consultas
- **medicalRecords** - Prontuários e registros médicos
- **vaccines** - Registro de vacinas
- **alerts** - Alertas automáticos
- **auditLogs** - Log de auditoria

## Como Usar

### 1. Instalação

```bash
# Clonar o repositório
git clone https://github.com/silvak1ing/simulado_saep.git
cd simulado_saep

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

### 2. Configurar Banco de Dados

```bash
# Criar e migrar o banco de dados
pnpm db:push
```

### 3. Executar em Desenvolvimento

```bash
# Iniciar o servidor de desenvolvimento
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

### 4. Build para Produção

```bash
# Compilar para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

## Fluxo de Uso

### Para Recepcionistas
1. Cadastrar novos tutores e pacientes
2. Gerenciar agendamentos
3. Registrar check-in e check-out
4. Visualizar alertas de vacinas vencidas

### Para Veterinários
1. Visualizar agendamentos do dia
2. Registrar prontuários e consultas
3. Prescrever medicamentos
4. Registrar vacinações
5. Acompanhar histórico do paciente

### Para Administradores
1. Gerenciar usuários e permissões
2. Configurar múltiplas clínicas
3. Visualizar relatórios de auditoria
4. Monitorar alertas do sistema

## Recursos Avançados

### Alertas Automáticos
- Verificação periódica de vacinas vencidas
- Notificações automáticas para tutores
- Dashboard centralizado de alertas pendentes
- Rastreamento de notificações enviadas

### Rastreabilidade Completa
- Cada operação registra quem a realizou
- Histórico de mudanças em prontuários
- Log de auditoria para conformidade
- Identificação de responsável por cada ação

### Segurança
- Autenticação OAuth integrada
- Controle de acesso baseado em roles
- Validação de dados em frontend e backend
- Proteção contra operações não autorizadas

## Próximos Passos

1. **Implementar notificações por email** - Enviar alertas de vacinas para tutores
2. **Adicionar relatórios** - Gerar relatórios de atendimentos e receita
3. **Integrar pagamentos** - Sistema de cobrança de consultas
4. **Mobile app** - Aplicativo móvel para recepcionistas
5. **Integração com veterinários** - App para veterinários consultarem prontuários

## Contribuindo

Para contribuir com o projeto, abra uma issue ou pull request no repositório.

## Licença

Este projeto está sob licença MIT.

## Suporte

Para suporte, entre em contato através do repositório do projeto.

---

**Desenvolvido com ❤️ para clínicas veterinárias**
