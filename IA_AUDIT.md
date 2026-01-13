# Auditoria do uso de Inteligência Artificial

Neste arquivo, estarei citando os prompts utilizados para o desenvolvimento do projeto, junto a minha justificativa em concordância ou não, de acordo com os resultados recebidos.

## O conceito inicial e apresentação da idéia proposta, firmamento do banco de dados e backend.

    "Estou iniciando o desenvolvimento em um mini-projeto de um processo seletivo da Interest. Gostaria que me ajudasse com o desenvolvimento do mini-projeto em algumas etapas, desde a configuração inicial do ambiente (instalação de dependencias, etc) até a implementação das etapas em si.

    As etapas serão:

    - Banco de dados
    - Backend
    - Frontend
    - Testes e Cobertura de testes

    Etapa 1: Módulo do Banco de Dados

    - Você deve criar duas tabelas: teams e users_teams
    - Deverá usar como Ferramenta o Alembic e o PostgreSQL

    Seu objetivo é:
    - Criar tabelas para equipes e associação com usuários
    - Garantir que a equipe tenha líder obrigatório
    - Impedir que o usuário esteja em múltiplas equipes (Constraints única) 
    - Impedir líder em múltiplas equipes (Constraints única)
    - Criar migrações reversíveis com Alembic

    Etapa 2: Módulo do Backend

    - Você deve implementar a seguinte estrutura: /models, /crud, /api/routes
    - Adote como ferramentas a serem utilizadas no Backend: FastAPI, Pydantic,PostgreSQL
    - Utilize os padrões de projeto: RESTful, Dependency Injection

    Seu objetivo é:

    - Criar endpoints para CRUD de usuários
    - Criar endpoints para CRUD de equipes
    - Criar endpoints para adicionar/remover membros de equipes
    - Respeitar regras: usuário em apenas uma equipe, líder único
    - Usar padrão Repository e validação com Pydantic
    - Documentar API com OpenAPI/Swagger

    Por hora, quero iniciar a implementação dessas duas etapas, posteriormente seguindo as outras duas. Quero também, que leia o arquivo README.md, onde contém informações dos requisitos funcionais que podem ser úteis para a implementação destas fases."

### Resultados obtidos:
- Pude agilizar o processo de desenvolvimento, onde não tive problemas durante a criação das tabelas, tanto por ser algo simples de executar, quanto por ter já proposto meus objetivos com o backend, que eu já sabia que afetariam as tabelas, dado os requisitos de padrão de arquitetura de projetos solicitados.
- Com isso, tive que fazer pequenas correções, para ficar mais próximo a realidade do meu entendimento, o que diminiu a complexidade do problema.
- Após isso, realizei testes manuais dentro da interface web do Adminer na porta 8080, para validar se minha implementação estaria correta.
- Por fim, entendendo um resultado satisfatório quanto a regra de negócio, apenas fiz uma validação nas rotas do backend, para trazer mais segurança e robustez ao projeto.