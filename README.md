Detalhamento do projeto

Público Alvo
Profissionais que atuam em uma rede de indicação de trabalhos freelance que precisam comprar, vender ou trocar produtos de tecnologia (notebooks, mouses, teclados, etc) que possibilitem a 
realização de seus trabalhos de forma rápida, otimizando seus custos com estruturas de trabalho.


Orientações adicionais
Backend de armazenamento de dados
A equipe do Sr. Vibbraneo produziu toda a estrutura de gravação das informações, porém ainda esta em um ambiente interno da empresa, para isso eles disponibilizaram um JSON com exemplos 
de dados para que você possa trabalhar as chamadas REST´s da API para inclusão, alteração, exclusão e consulta de dados, veja os detalhes no link.

Ambiente de simulação
Como a API esta disponível apenas no ambiente interno d a empresa do Sr. Vibbraneo, você deve simular as chamadas de acordo com as orientações do apis ecommerce venda e troca e
 tratar os retornos especificados.

1. Login
Deve ser acessada na URL base de login do site (/login) e deverá conter campo para informar login e senha, efetuando o login.
Existe a possibilidade desta tela ser chamada com o login realizado através de single sign on, com a passagem do token de autenticação.

2. Tela inicial
Deve ser acessada na URL base do site (raiz) e listar as ofertas principais que estejam mais próximas à localização do usuário, caso não tenha acesso a localização, exibir todas as ofertas.
O menu deve conter os seguintes itens:
Criar negociação.
Minhas negociações.
Meus convites.

3. Criar Negociação
A tela de criação dos dados da negociação deve ter campos que possibilitem a criação de uma nova negociação.
Ao salvar o usuário é direcionado para a tela de visualização da negociação.

4. VISUALIZAR NEGOCIAÇÃO
Ao acessar a url da negociação o usuário poderá ver, de acordo com seu perfil:
Criador da oferta:
Poderá editar os dados.
Poderá ver e responder as mensagens enviadas.
Poderá ver e aprovar as ofertas realizadas na negociação.
Demais usuários:
Poderá ver os detalhes da negociação.
Poderá enviar uma mensagem para o dono da negociação.
Poderá ver as mensagens enviadas pelo dono da negociação.
Poderá enviar uma oferta para o dono da negociação.
Poderá acompanhar o status da sua oferta.
Poderá acompanhar o status da entrega do produto.

5. MINHAS NEGOCIAÇÕES
Ao acessar a url de listagem das negociações o usuário irá visualizar duas listagens:
Minhas negociações:
Todos as negociações que foram criadas pelo usuário.
Pode acessar os dados através da tela de Visualização da Negociação.
Minhas ofertas:
Todas as negociações onde o usuário realizou uma oferta ou enviou uma mensagem.
Pode acessar os dados através da tela de Visualização da Negociação.

6. CONVITES
Ao acessar a url dos convites o usuário poderá visualizar a sua lista de convites enviados, acompanhando o status de cada convite.
Criar um novo convite informando os dados do convidado.