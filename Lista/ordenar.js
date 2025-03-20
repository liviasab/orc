const fs = require('fs');
const readline = require('readline');

async function processarArquivo(caminho) {
    const fileStream = fs.createReadStream(caminho, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let secoes = [];
    let secaoAtual = null;
    const regexCargo = /CARGO 17/; // Regex para identificar "CARGO 17"
    const regexTRE = /TRE\/([A-Z]{2})/; // Captura a sigla do estado após "TRE/"

    let cabecalhoBuffer = '';

    for await (const linha of rl) {
        const linhaLimpa = linha.trim();
        if (!linhaLimpa) continue; // Ignora linhas vazias

        // Verifica se a linha contém "CARGO 17"
        if (regexCargo.test(linhaLimpa)) {
            // Se houver um cabeçalho anterior, armazena
            if (secaoAtual) {
                const treMatch = cabecalhoBuffer.match(regexTRE);
                secaoAtual.estado = treMatch ? treMatch[1] : 'N/A'; // Captura a sigla do estado
                secoes.push(secaoAtual);
            }

            // Adiciona a nova linha ao buffer do cabeçalho
            cabecalhoBuffer = linhaLimpa; // Reinicia o buffer com o novo cabeçalho

            secaoAtual = {
                cabecalho: cabecalhoBuffer, // Armazena o cabeçalho
                estado: 'N/A', // Inicializa o estado como N/A
                candidatos: []
            };
        } else if (secaoAtual) {
            // Acumula cabeçalho se não for uma nova seção
            cabecalhoBuffer += ' ' + linhaLimpa; // Adiciona a linha ao cabeçalho

            // Processa linhas de candidatos
            const candidatos = linhaLimpa.split('/').map(c => c.trim()).filter(c => c);
            
            for (const cand of candidatos) {
                try {
                    const campos = cand.split(',').map(c => c.trim());
                    if (campos.length < 4) continue;

                    const inscricao = campos[0];
                    const nome = campos.slice(1, -2).join(', '); // Junta os nomes que tenham vírgula
                    const objetiva = parseFloat(campos[campos.length - 2]);
                    const discursiva = parseFloat(campos[campos.length - 1]);

                    secaoAtual.candidatos.push({
                        inscricao,
                        nome,
                        objetiva: isNaN(objetiva) ? 0 : objetiva,
                        discursiva: isNaN(discursiva) ? 0 : discursiva
                    });
                } catch (e) {
                    console.error(`Erro ao processar: ${cand}\n${e.message}`);
                }
            }
        }
    }

    // Verifica se existe uma seção atual a ser adicionada ao final
    if (secaoAtual) {
        const treMatch = cabecalhoBuffer.match(regexTRE);
        secaoAtual.estado = treMatch ? treMatch[1] : 'N/A'; // Captura a sigla do estado
        secoes.push(secaoAtual);
    }
    
    return secoes;
}

function ordenarCandidatos(secoes) {
    return secoes.map(secao => ({
        ...secao,
        candidatos: secao.candidatos.sort((a, b) => {
            if (a.objetiva !== b.objetiva) {
                return a.objetiva - b.objetiva; // Ordenação crescente pela nota objetiva
            }
            return a.discursiva - b.discursiva; // Se empatar, ordena pela nota discursiva
        })
    }));
}

async function main() {
    if (process.argv.length !== 3) {
        console.log('Uso: node ordenar.js <candidatos.txt>');
        console.log('Exemplo: node ordenar.js candidatos.txt');
        process.exit(1);
    }

    const arquivoResultado = 'resultado.txt'; // Define um arquivo padrão para saída

    try {
        const secoes = await processarArquivo(process.argv[2]);
        const secoesOrdenadas = ordenarCandidatos(secoes);
        
        let resultadoTexto = ''; // Variável para armazenar o resultado final

        secoesOrdenadas.forEach(secao => {
            resultadoTexto += `\n${secao.cabecalho} - Estado: ${secao.estado}\n`;
            secao.candidatos.forEach(c => {
                resultadoTexto += `${c.inscricao}, ${c.nome}, ${c.objetiva.toFixed(2)}, ${c.discursiva.toFixed(2)}\n`;
            });
        });

        // Grava os resultados em um arquivo de texto
        fs.writeFileSync(arquivoResultado, resultadoTexto.trim());
        console.log(`Resultados salvos em ${arquivoResultado}`);
        
    } catch (err) {
        console.error(`Erro: ${err.message}`);
        process.exit(1);
    }
}

main();
