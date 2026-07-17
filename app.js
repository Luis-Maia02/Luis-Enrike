import pg from 'pg';
import PromptSync from 'prompt-sync';


const {Client } = pg;
const prompt = PromptSync();


function criarCliente(){
    return new Client({
    host:     'localhost',
    port:     5432,
    user:     'postgres',
    password: 'root',
    database: 'almoxarifado_db'
    });
}

async function listarItens() {
    const client = criarCliente();
    try {

        await client.connect();

        const resultado = await client.query(
            'SELECT * FROM produtos ORDER BY id, nome, quantidade, valor, categoria '
        );

        console.log("======== Produtos ========")

        if (resultado.rows.length === 0) {
            console.log('A loja está vazia no momento.');
        } else {


            resultado.rows.forEach(produto  => {
                console.log(`[${produto.id}] ${produto.nome}`);
                console.log(`Categoria: ${produto.categoria} | Preço: R$ ${produto.valor} | Quantidade: ${produto.quantidade}`);
                
            });
            console.log(`\nTotal de itens: ${resultado.rows.length}`);
        }

    } catch (erro) {

        console.log('❌ Erro ao listar itens:', erro.message);

    } finally {

        await client.end();

    }
}


async function cadastraProduto() {
    const client = criarCliente();

    try {
    
            await client.reconnect();
    
            console.log('\n CADASTRAR NOVO PRODUTO\n');
    
            const nome      = prompt('Nome do Produto: ');
            const categoria = prompt('Categoria:  ');
            const valor     = prompt('Valor: ');
            const quantidade = prompt('Quantidade: ');
    
            
            if (!nome || !categoria || !valor || !quantidade ) {
                console.log('❌ Nome, tipo e preço são obrigatórios.');
                return; 
            }
    
            const listar = await client.query(
                `INSERT INTO produtos (nome, categoria, valor, quantidade)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [nome, categoria, valor, quantidade,]
            );
    
            console.log('\n✅ Produto cadastrado com sucesso!');
            console.log(`   ID gerado pelo banco: ${listar.rows[0].id}`);
            console.log(`   ${listar.rows[0].nome} adicionado à loja.`);
    
        } catch (erro) {
    
            console.log('❌ Erro ao cadastrar item:', erro.message);
    
        } finally {
    
            await client.end();
    
    }
}

async function menu() {

    let rodando = true;

    while (rodando) {

        
        console.log('LOJA DO ALQUIMISTA VALDRIS ');
        console.log(' 1 - Ver itens da loja ');
        console.log('2 - Cadastrar novo item ');
        console.log('3 - Atualizar estoque ');
        console.log('4 - Remover item ');
        console.log('0 - Fechar a loja  ');
        

        const opcao = prompt('\nEscolha uma opção: ');

        switch (opcao) {
            case '1': await listarItens();      break;
            case '2': await cadastrarItem();    break;
            case '3': await atualizarEstoque(); break;
            case '4': await removerItem();      break;
            case '0':
                rodando = false;
                console.log('\n🧙 Até a próxima, aventureiro!\n');
                break;
            default:
                console.log('❌ Opção inválida. Tente novamente.');
        }
    }
}
menu();

listarItens();

cadastraProduto();