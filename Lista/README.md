# Ordenador de Candidatos

## Descrição
O **Ordenador de Candidatos** é uma ferramenta escrita em Node.js que processa arquivos de texto contendo informações sobre candidatos de concursos públicos. Ele organiza os dados, classifica os candidatos por suas notas e grava os resultados em um novo arquivo de texto.

## Funcionalidades
- Lê um arquivo de entrada com dados dos candidatos, incluindo notas objetivas e discursivas.
- Captura informações de cabeçalho, como cargo e sigla do estado.
- Classifica os candidatos em ordem crescente com base nas notas.
- Gera um arquivo de saída com os resultados formatados.

## Pré-requisitos
Para executar o programa, você precisa ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

## Como Usar

1. **Clonar o Repositório**: Clone este repositório ou baixe o código-fonte em sua máquina:

    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA>
    ```

2. **Criar o Arquivo de Entrada**: Crie um arquivo de texto chamado `candidatos.txt` com os dados dos candidatos no formato esperado. Por exemplo:

    ```
    CARGO 17: ANALISTA JUDICIÁRIO – ÁREA: APOIO ESPECIALIZADO – ESPECIALIDADE: TECNOLOGIA DA INFORMAÇÃO – TRE/AL 
    10020147, Ailton Braz dos Santos Junior, 70.00, 45.50 / 10649533, Alexander Raphael Justo Balbino dos Reis, 68.00, 17.46 / ...
    ```

3. **Instalar Dependências**: No diretório do projeto, instale as dependências (se necessário). Para este projeto específico, não são necessárias dependências além do Node.js.

4. **Executar o Programa**: Execute o programa utilizando o Node.js, passando o arquivo de entrada como argumento. Os resultados serão salvos em `resultado.txt`. 

    ```bash
    node ordenar.js candidatos.txt
    ```

5. **Verificar os Resultados**: Após a execução, um arquivo chamado `resultado.txt` será criado no mesmo diretório, contendo a lista ordenada de candidatos e suas notas.

## Exemplo execução 
```bash
node ordenar.js candidatos.txt
