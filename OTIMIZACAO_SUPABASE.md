# Guia de Otimização do Supabase

## Problema Identificado
A demora de carregamento está ocorrendo apenas no computador, enquanto no celular funciona normalmente. Isso pode ser causado por:
- Cache do navegador
- Extensões do navegador interferindo
- Queries não otimizadas do Supabase
- Índices faltando no banco de dados

## Soluções Implementadas

### 1. Otimização de Queries
- ✅ Substituído `select('*')` por seleção de campos específicos nas queries de `profiles`
- ✅ Otimizadas queries de `orders` no dashboard para selecionar apenas campos necessários
- ✅ Otimizadas queries de `addresses` para selecionar apenas campos necessários

### 2. Script de Otimização do Banco de Dados
Foi criado o arquivo `supabase/optimize_queries.sql` com:
- Índices para melhorar performance das queries mais usadas
- Índices parciais (WHERE clauses) para otimizar queries filtradas
- Análise das tabelas para atualizar estatísticas

## Como Aplicar as Otimizações

### Passo 1: Executar o Script SQL
1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Copie e cole o conteúdo de `supabase/optimize_queries.sql`
4. Execute o script

**Importante:** O script usa `CREATE INDEX IF NOT EXISTS`, então pode ser executado várias vezes sem problemas. Ele não apaga dados existentes.

### Passo 2: Limpar Cache do Navegador (Computador)
1. Abra as ferramentas de desenvolvedor (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione "Limpar cache e recarregar forçado" (Hard Reload)
4. Ou limpe o cache manualmente nas configurações do navegador

### Passo 3: Verificar Extensões do Navegador
1. Desative extensões de bloqueio de anúncios (AdBlock, uBlock, etc.)
2. Teste em modo anônimo/privado
3. Se funcionar, uma extensão está interferindo

## Estrutura do Script SQL

O script cria índices nas seguintes tabelas:
- `profiles` - email, role
- `products` - is_featured, is_active, combinação featured+active
- `reviews` - is_approved, created_at
- `faqs` - is_active, order_position
- `site_settings` - key
- `seasonal_layouts` - is_active
- `product_combos` - is_featured, is_active, combinação featured+active
- `orders` - status, created_at, combinação status+created_at
- `product_colors` - product_id
- `combo_items` - combo_id, product_id

## Verificação de Performance

Após aplicar as otimizações:
1. Execute o script SQL no Supabase
2. Limpe o cache do navegador
3. Teste no computador
4. Verifique se a performance melhorou

## Não Precisa Recriar o Banco

**Você NÃO precisa recriar o banco de dados.** O script SQL apenas:
- Adiciona índices (não apaga dados)
- Usa `IF NOT EXISTS` para não criar duplicados
- Executa `ANALYZE` para otimizar estatísticas

Todas as otimizações são seguras e podem ser revertidas se necessário.

## Próximos Passos (Se Ainda Estiver Lento)

1. **Verificar queries no Supabase Dashboard:**
   - Vá em "Database" > "Query Performance"
   - Identifique queries lentas (>100ms)

2. **Adicionar mais índices:**
   - Baseado nas queries mais lentas identificadas
   - Execute SQL adicional conforme necessário

3. **Otimizar queries no código:**
   - Reduzir número de queries por página
   - Usar cache onde apropriado
   - Reduzir dados buscados (limites, campos específicos)

4. **Verificar rede:**
   - Testar conexão com Supabase em diferentes horários
   - Verificar se há bloqueadores de firewall no computador

