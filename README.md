# Prova de Backend

O projeto inicial é um cadastro de usuários em memória muito simples e sem utilizar nenhuma lib. Apesar de o código estar em qualidade baixa, o projeto está funcional. O que se espera é que o candidato melhore este código de uma maneira que possamos avaliar suas habilidades e competências.

### Rodando o projeto

`node src/index.js`

## O que será avaliado?

A idéia é deixar o candidato bem livre pra reimplementar o código da maneira que mais lhe for conveniente e que mais demonstre suas habilidades. Está liberado o uso de libs de terceiros, bancos de dados, autenticação, etc.

1. Qualidade de código
2. Uso de patterns adequados
3. Estratégia de validação de dados
4. Testes unitários

## O que é desejado (não obrigatório) na entrega?

1. Adição de Banco de dados
2. Utilização de docker
3. Autenticação
4. Utilização de typescript

## Como será feita a entrega?

Deverá ser realizado um fork deste repositório e no formulário enviado você deverá responder com o link deste fork.

## Documentação da solução
Para executar buildar e executar o docker você precisa 
executar os comandos na pasta do projeto
docker image build -t back .
docker container run -d -p 3000:5000 back
O projeto estara sendo executado no link 192.168.99.100:3000
Ou de acordo com os padrões do seu Docker.

O projeto inclui testes que podem ser executados assim que a instancia do docker estiver ativa com o comando yarn test
Recomendo a utilização do yarn para instalar os pacotes e métodos.