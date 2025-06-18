# 🔥 Guia: Como Liberar IP no Firewall do Azure SQL Database

## 📋 Informações Necessárias
- **IP para liberar:** `3.95.159.103`
- **Servidor:** `srvusetravel.database.windows.net`
- **Banco:** `dbUsetravel`

---

## 🌐 Método 1: Azure Portal (Recomendado)

### Passo a Passo:

1. **Acesse o Azure Portal**
   - Vá para: https://portal.azure.com
   - Faça login com suas credenciais

2. **Navegue até o SQL Server**
   - No menu lateral, clique em "All resources" ou "Todos os recursos"
   - Procure por `srvusetravel` na lista
   - Clique no servidor SQL

3. **Configure o Firewall**
   - No menu lateral do servidor, procure por:
     - **"Networking"** (versões mais recentes) OU
     - **"Firewalls and virtual networks"** (versões anteriores)
   - Clique na opção encontrada

4. **Adicione a Regra de Firewall**
   - Clique em **"+ Add client IP"** ou **"+ Adicionar IP do cliente"**
   - OU clique em **"+ Add firewall rule"** ou **"+ Adicionar regra de firewall"**
   
   **Se usar "Add firewall rule":**
   - **Rule name:** `SandboxAccess` (ou qualquer nome)
   - **Start IP:** `3.95.159.103`
   - **End IP:** `3.95.159.103`

5. **Salvar as Alterações**
   - Clique em **"Save"** ou **"Salvar"**
   - Aguarde a confirmação (pode levar até 5 minutos)

---

## 💻 Método 2: Azure CLI

Se você tem o Azure CLI instalado:

```bash
# Login no Azure
az login

# Adicionar regra de firewall
az sql server firewall-rule create \
  --resource-group <SEU_RESOURCE_GROUP> \
  --server srvusetravel \
  --name SandboxAccess \
  --start-ip-address 3.95.159.103 \
  --end-ip-address 3.95.159.103
```

---

## 🔧 Método 3: PowerShell

Se você tem o Azure PowerShell:

```powershell
# Login no Azure
Connect-AzAccount

# Adicionar regra de firewall
New-AzSqlServerFirewallRule `
  -ResourceGroupName "<SEU_RESOURCE_GROUP>" `
  -ServerName "srvusetravel" `
  -FirewallRuleName "SandboxAccess" `
  -StartIpAddress "3.95.159.103" `
  -EndIpAddress "3.95.159.103"
```

---

## ⚡ Opção Alternativa: Permitir Serviços do Azure

Se quiser permitir acesso de todos os serviços Azure (menos seguro):

1. No Azure Portal, vá até o servidor SQL
2. Em "Networking" ou "Firewalls and virtual networks"
3. Ative a opção **"Allow Azure services and resources to access this server"**
4. Clique em **"Save"**

---

## ✅ Como Verificar se Funcionou

Após configurar o firewall, teste a conexão:

```bash
# No diretório da API
cd /caminho/para/api-pacotes-manus
node teste_conexao.js
```

**Resultado esperado:**
```
✅ Conexão estabelecida com sucesso!
Resultado do teste: [ { teste: 1 } ]
```

---

## 🚨 Troubleshooting

### Erro persiste após 5 minutos?
- Verifique se o IP está correto: `3.95.159.103`
- Confirme se salvou as alterações no Azure Portal
- Tente desabilitar/reabilitar a regra

### Não encontra o servidor?
- Confirme o nome: `srvusetravel`
- Verifique se está na subscription correta
- Confirme se tem permissões de administrador

### Erro de permissão?
- Certifique-se de ter role de "SQL Server Contributor" ou superior
- Contate o administrador da subscription se necessário

---

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do Azure Portal
2. Confirme as credenciais no arquivo `.env`
3. Teste com uma ferramenta como SQL Server Management Studio

**Tempo estimado:** 2-5 minutos após salvar as configurações.

