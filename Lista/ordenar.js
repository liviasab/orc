const fs = require('fs');
const readline = require('readline');

class Seção {
    constructor(cabecalho) {
        this.cabecalho = cabecalho;
        this.estado = 'N/A';
        this.candidatos = [];
    }

    adicionarCandidatos(candidatos) {
        for (const cand of candidatos) {
            try {
                const campos = cand.split(',').map(c => c.trim());
                if (campos.length < 4) continue;

                const inscricao = campos[0];
                const nome = campos.slice(1, -2).join(', ');
                const objetiva = parseFloat(campos[campos.length - 2]);
                const discursiva = parseFloat(campos[campos.length - 1]);

                this.candidatos.push({
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

class Processador {
    constructor(caminho) {
        this.caminho = caminho;
        this.regexCargo = /CARGO 17/;
        this.regexTRE = /TRE\/([A-Z]{2})/;
    }

    async processarArquivo() {
        const fileStream = fs.createReadStream(this.caminho, { encoding: 'utf-8' });
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let secoes = [];
        let secaoAtual = null;
        let cabecalhoBuffer = '';

        for await (const linha of rl) {
            const linhaLimpa = linha.trim();
            if (!linhaLimpa) continue;

            if (this.regexCargo.test(linhaLimpa)) {
                if (secaoAtual) {
                    const treMatch = cabecalhoBuffer.match(this.regexTRE);
                    secaoAtual.estado = treMatch ? treMatch[1] : 'N/A';
                    secoes.push(secaoAtual);
                }

                cabecalhoBuffer = linhaLimpa;
                secaoAtual = new Seção(cabecalhoBuffer);
            } else if (secaoAtual) {
                cabecalhoBuffer += ' ' + linhaLimpa;
                const candidatos = linhaLimpa.split('/').map(c => c.trim()).filter(c => c);
                secaoAtual.adicionarCandidatos(candidatos);
            }
        }

        if (secaoAtual) {
            const treMatch = cabecalhoBuffer.match(this.regexTRE);
            secaoAtual.estado = treMatch ? treMatch[1] : 'N/A';
            secoes.push(secaoAtual);
        }

        return secoes;
    }
}

function ordenarCandidatos(secoes) {
    return secoes.map(secao => ({
        ...secao,
        candidatos: secao.candidatos.sort((a, b) => {
            if (a.objetiva !== b.objetiva) {
                return a.objetiva - b.objetiva;
            }
            return a.discursiva - b.discursiva;
        })
    }));
}

async function main() {
    if (process.argv.length !== 3) {
        console.log('Uso: node ordenar.js <candidatos.txt>');
        process.exit(1);
    }

    const arquivoResultado = 'resultado.txt';
    const processador = new Processador(process.argv[2]);

    try {
        const secoes = await processador.processarArquivo();
        const secoesOrdenadas = ordenarCandidatos(secoes);
        
        let resultadoTexto = '';

        secoesOrdenadas.forEach(secao => {
            resultadoTexto += `\n${secao.cabecalho} - Estado: ${secao.estado}\n`;
            secao.candidatos.forEach(c => {
                resultadoTexto += `${c.inscricao}, ${c.nome}, ${c.objetiva.toFixed(2)}, ${c.discursiva.toFixed(2)}\n`;
            });
        });

        fs.writeFileSync(arquivoResultado, resultadoTexto.trim());
        console.log(`Resultados salvos em ${arquivoResultado}`);
        
    } catch (err) {
        console.error(`Erro: ${err.message}`);
        process.exit(1);
    }
}

main();
