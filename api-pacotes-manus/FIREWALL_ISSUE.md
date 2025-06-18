# Problema de Firewall - Azure SQL Database

## Erro Encontrado
```
Cannot open server 'srvusetravel' requested by the login. Client with IP address '3.95.159.103' is not allowed to access the server.
```

## Causa
O Azure SQL Database tem um firewall que bloqueia conexões de IPs não autorizados por padrão.

## Soluções

### 1. Configurar Firewall no Azure Portal
1. Acesse o Azure Portal (portal.azure.com)
2. Navegue até o SQL Server: `srvusetravel`
3. Vá em "Networking" ou "Firewalls and virtual networks"
4. Adicione uma regra de firewall para o IP: `3.95.159.103`
5. Ou configure "Allow Azure services and resources to access this server"

### 2. Configurar via Azure CLI
```bash
az sql server firewall-rule create \
  --resource-group <resource-group-name> \
  --server srvusetravel \
  --name AllowSandboxIP \
  --start-ip-address 3.95.159.103 \
  --end-ip-address 3.95.159.103
```

### 3. Configurar via SQL (se tiver acesso)
```sql
EXEC sp_set_firewall_rule N'AllowSandboxIP', '3.95.159.103', '3.95.159.103'
```

## Status da Migração
✅ Código adaptado com sucesso para SQL Server
✅ Driver mssql instalado e configurado
✅ Queries convertidas de PostgreSQL para SQL Server
⚠️  Aguardando liberação do firewall para testes completos

## Próximos Passos
1. Liberar IP no firewall do Azure SQL Database
2. Executar testes de conexão
3. Validar endpoints da API
4. Gerar scripts SQL para criação das tabelas (se necessário)

