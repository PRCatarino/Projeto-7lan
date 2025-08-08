// Dados mockados de contratos e clientes
const contractsDatabase = {
    "2024001": {
        cliente: "Shopping Centro Norte",
        endereco: "Av. das Nações, 1500 - Centro, São Paulo - SP",
        local: "Shopping Center - Área Externa",
        servicoTipo: "Instalação de Sistema de Segurança Patrimonial"
    },
    "2024002": {
        cliente: "Banco Santander - Agência Vila Madalena",
        endereco: "Rua Harmonia, 456 - Vila Madalena, São Paulo - SP",
        local: "Agência Bancária",
        servicoTipo: "Manutenção Preventiva em Sistema de Alarmes"
    },
    "2024003": {
        cliente: "Condomínio Residencial Vista Alegre",
        endereco: "Rua das Flores, 789 - Jardim Botânico, Rio de Janeiro - RJ",
        local: "Portaria Principal",
        servicoTipo: "Instalação de CCTV e Controle de Acesso"
    },
    "2024004": {
        cliente: "Indústria Metalúrgica Santos LTDA",
        endereco: "Rod. Presidente Dutra, km 156 - Guarulhos - SP",
        local: "Galpão Industrial - Setor A",
        servicoTipo: "Sistema Integrado de Segurança Industrial"
    },
    "2024005": {
        cliente: "Hospital São Lucas",
        endereco: "Av. Paulista, 1200 - Bela Vista, São Paulo - SP",
        local: "Ala de Emergência",
        servicoTipo: "Instalação de Monitoramento 24h"
    },
    "2024006": {
        cliente: "Universidade Mackenzie - Campus Higienópolis",
        endereco: "Rua da Consolação, 930 - Consolação, São Paulo - SP",
        local: "Biblioteca Central",
        servicoTipo: "Upgrade de Sistema de Segurança"
    },
    "2024007": {
        cliente: "Supermercado Extra - Filial Moema",
        endereco: "Av. Ibirapuera, 3103 - Moema, São Paulo - SP",
        local: "Área de Checkout e Estoque",
        servicoTipo: "Instalação de Sistema Anti-Furto"
    },
    "2024008": {
        cliente: "Posto de Combustível Shell - BR-116",
        endereco: "Rod. Presidente Dutra, km 203 - Taubaté - SP",
        local: "Área de Abastecimento",
        servicoTipo: "Sistema de Monitoramento Perimetral"
    },
    "2024009": {
        cliente: "Farmácia Drogasil - Centro Histórico",
        endereco: "Rua XV de Novembro, 245 - Centro, Santos - SP",
        local: "Loja Principal",
        servicoTipo: "Instalação de Alarmes e Sensores"
    },
    "2024010": {
        cliente: "Edifício Comercial Torre Sul",
        endereco: "Av. Faria Lima, 2500 - Itaim Bibi, São Paulo - SP",
        local: "Lobby e Garagem",
        servicoTipo: "Sistema Completo de Segurança Predial"
    },
    "2024011": {
        cliente: "Restaurante Dom Giovanni",
        endereco: "Rua Augusta, 1567 - Consolação, São Paulo - SP",
        local: "Salão Principal e Cozinha",
        servicoTipo: "Instalação de CCTV e Alarmes"
    },
    "2024012": {
        cliente: "Concessionária Honda - Zona Sul",
        endereco: "Av. Santo Amaro, 4567 - Brooklin, São Paulo - SP",
        local: "Showroom e Oficina",
        servicoTipo: "Sistema de Monitoramento Integrado"
    }
};

// Função para criar elementos de busca/seleção
function createSearchableSelect(inputId, placeholder, data, onSelectCallback) {
    const input = document.querySelector(`input[placeholder="${placeholder}"]`);
    if (!input) return;

    // Substituir input por container de busca
    const container = document.createElement('div');
    container.className = 'searchable-select-container';
    container.style.position = 'relative';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = placeholder;
    searchInput.className = 'searchable-input';
    searchInput.style.cssText = input.style.cssText;
    searchInput.value = input.value;

    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.style.display = 'none';

    container.appendChild(searchInput);
    container.appendChild(dropdown);
    input.parentNode.replaceChild(container, input);

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        showDropdown(dropdown, data, query, onSelectCallback, searchInput);
    });

    searchInput.addEventListener('focus', (e) => {
        const query = e.target.value.toLowerCase();
        showDropdown(dropdown, data, query, onSelectCallback, searchInput);
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    return searchInput;
}

function showDropdown(dropdown, data, query, onSelectCallback, inputElement) {
    dropdown.innerHTML = '';
    dropdown.style.display = 'block';

    const filteredData = Object.entries(data).filter(([key, value]) => {
        const searchText = `${key} ${value.cliente || value}`.toLowerCase();
        return searchText.includes(query);
    });

    if (filteredData.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item no-results">Nenhum resultado encontrado</div>';
        return;
    }

    filteredData.slice(0, 10).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        if (typeof value === 'object') {
            item.innerHTML = `
                <div class="dropdown-contract">${key}</div>
                <div class="dropdown-client">${value.cliente}</div>
            `;
        } else {
            item.innerHTML = `<div class="dropdown-client">${value}</div>`;
        }

        item.addEventListener('click', () => {
            inputElement.value = typeof value === 'object' ? key : value;
            dropdown.style.display = 'none';
            onSelectCallback(key, value);
        });

        dropdown.appendChild(item);
    });
}

// Função para preencher apenas o campo correspondente
function fillContractField(contractNumber) {
    const contratoInput = document.querySelector('input[placeholder="Nº"]');
    if (contratoInput) {
        contratoInput.value = contractNumber;
        contratoInput.classList.add('auto-filled');
        setTimeout(() => {
            contratoInput.classList.remove('auto-filled');
        }, 600);
    }
    showStatus(`✅ Contrato ${contractNumber} selecionado`, 'success');
}

function fillClientField(clientName) {
    const clienteInput = document.querySelector('input[placeholder="Nome do Cliente"]');
    if (clienteInput) {
        clienteInput.value = clientName;
        clienteInput.classList.add('auto-filled');
        setTimeout(() => {
            clienteInput.classList.remove('auto-filled');
        }, 600);
    }
    showStatus(`✅ Cliente "${clientName}" selecionado`, 'success');
}

// Criar mapa reverso (cliente -> contratos)
function createClientMap() {
    const clientMap = {};
    Object.entries(contractsDatabase).forEach(([contract, data]) => {
        if (!clientMap[data.cliente]) {
            clientMap[data.cliente] = [];
        }
        clientMap[data.cliente].push(contract);
    });
    return clientMap;
}

// Função para lidar com seleção de cliente
function handleClientSelection(clientName, contracts) {
    if (Array.isArray(contracts) && contracts.length > 1) {
        // Cliente tem múltiplos contratos, mostrar opções
        showContractOptions(clientName, contracts);
    } else {
        // Cliente tem apenas um contrato, apenas preenche o campo cliente
        fillClientField(clientName);
    }
}

// Mostrar opções de contrato quando cliente tem múltiplos
function showContractOptions(clientName, contracts) {
    const modal = document.createElement('div');
    modal.className = 'contract-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Cliente Selecionado</h3>
            <p>Cliente <strong>${clientName}</strong> selecionado com sucesso!</p>
            <p><em>Se desejar, você pode escolher um contrato específico:</em></p>
            <div class="contract-options">
                ${contracts.map(contract => `
                    <div class="contract-option" data-contract="${contract}">
                        <strong>${contract}</strong>
                        <span>${contractsDatabase[contract].servicoTipo}</span>
                    </div>
                `).join('')}
            </div>
            <button class="modal-close">Continuar sem contrato</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Preencher campo cliente imediatamente
    fillClientField(clientName);

    // Event listeners para as opções de contrato (opcional)
    modal.querySelectorAll('.contract-option').forEach(option => {
        option.addEventListener('click', () => {
            const contractNumber = option.getAttribute('data-contract');
            fillContractField(contractNumber);
            document.body.removeChild(modal);
        });
    });

    // Fechar modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Inicializar sistema de busca
function initializeContractSystem() {
    const clientMap = createClientMap();

    // Criar busca para contratos
    createSearchableSelect(
        'contrato',
        'Nº',
        contractsDatabase,
        (contractNumber, contractData) => {
            fillContractField(contractNumber);
            // Também preenche o cliente correspondente
            fillClientField(contractData.cliente);
        }
    );

    // Criar busca para clientes
    createSearchableSelect(
        'cliente',
        'Nome do Cliente',
        clientMap,
        (clientName, contracts) => {
            handleClientSelection(clientName, contracts);
        }
    );
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeContractSystem();
    }, 500);
});