// Geolocation functionality (apenas endereço)
function getLocation() {
    const statusDiv = document.getElementById('location-status');
    const enderecoInput = document.getElementById('endereco');

    if (!navigator.geolocation) {
        showStatus('Geolocalização não é suportada por este navegador.', 'error');
        return;
    }

    showStatus('Obtendo localização...', 'loading');

    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            showStatus('Localização obtida com sucesso!', 'success');

            try {
                const address = await getAddressFromCoordinates(lat, lon);
                if (address && !enderecoInput.value) {
                    enderecoInput.value = address;
                }
            } catch (error) {
                console.log('Não foi possível obter o endereço automaticamente');
            }
        },
        function (error) {
            let message = '';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Acesso à localização foi negado. Por favor, permita o acesso à localização.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Informações de localização não estão disponíveis.';
                    break;
                case error.TIMEOUT:
                    message = 'Tempo limite para obter localização excedido.';
                    break;
                default:
                    message = 'Erro desconhecido ao obter localização.';
                    break;
            }
            showStatus(message, 'error');
        }
    );
}

async function getAddressFromCoordinates(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await response.json();
    return data.display_name || `Endereço não encontrado`;
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('location-status');
    statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
}

// PDF Generation (sem latitude/longitude)
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Get form data
    const cliente = document.querySelector('input[placeholder="Nome do Cliente"]').value || 'NÃO INFORMADO';
    const contrato = document.querySelector('input[placeholder="Nº"]').value || 'NÃO INFORMADO';
    const data = document.querySelector('input[type="date"]').value || new Date().toISOString().split('T')[0];
    const servicoDescricao = document.getElementById('service-description').value || 'NÃO INFORMADO';
    const local = document.getElementById('local').value || 'NÃO INFORMADO';
    const endereco = document.getElementById('endereco').value || 'NÃO INFORMADO';

    // Get equipment quantities
    const equipments = document.querySelectorAll('.equipment-item input');
    const equipmentData = [];
    equipments.forEach((input) => {
        const label = input.parentElement.querySelector('span').textContent;
        const qty = input.value || '0';
        if (parseInt(qty) > 0) {
            equipmentData.push(`${qty} ${label.toUpperCase()}`);
        }
    });
    const equipmentText = equipmentData.join(' / ') || 'NENHUM EQUIPAMENTO INFORMADO';

    // Format date
    const dateFormatted = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

    let yPosition = 20;

    // Header
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('RELATÓRIO FOTOGRÁFICO DE UNIDADE PARA ENTREGA AO CONTRATANTE', 20, yPosition);
    yPosition += 20;

    // Client info section
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`CLIENTE: ${cliente.toUpperCase()}`, 20, yPosition);
    pdf.text(`CONTRATO: ${contrato}`, 120, yPosition);
    pdf.text(`DATA: ${dateFormatted}`, 160, yPosition);
    yPosition += 15;

    // Service description
    pdf.text(`DESCRIÇÃO DE SERVIÇO REALIZADO: ${servicoDescricao.toUpperCase()}`, 20, yPosition);
    yPosition += 15;

    // Equipment section
    pdf.text('QTDE DE EQUIPAMENTOS:', 20, yPosition);
    yPosition += 10;

    const maxLineLength = 80;
    const equipmentLines = [];
    let currentLine = '';

    equipmentText.split(' / ').forEach((item) => {
        if (currentLine.length + item.length > maxLineLength) {
            if (currentLine) equipmentLines.push(currentLine);
            currentLine = item;
        } else {
            currentLine += (currentLine ? ' / ' : '') + item;
        }
    });
    if (currentLine) equipmentLines.push(currentLine);

    equipmentLines.forEach((line) => {
        pdf.text(line, 20, yPosition);
        yPosition += 8;
    });

    yPosition += 10;

    // Location section
    pdf.text(`LOCAL: ${local}`, 20, yPosition);
    yPosition += 10;

    pdf.text(`ENDEREÇO: ${endereco}`, 20, yPosition);
    yPosition += 15;

    // Photos
    if (photoFiles && photoFiles.length > 0) {
        pdf.text('FOTOS DO RELATÓRIO:', 20, yPosition);
        yPosition += 15;

        let photoCount = 1;
        let photosPerRow = 2;
        let photoWidth = 80;
        let photoHeight = 60;
        let startX = 20;
        let currentX = startX;

        for (let i = 0; i < photoFiles.length; i++) {
            const photoData = photoFiles[i];

            try {
                const imageDataUrl = await fileToDataURL(photoData.file);

                if (yPosition + photoHeight + 30 > pdf.internal.pageSize.height) {
                    pdf.addPage();
                    yPosition = 20;
                    currentX = startX;
                }

                pdf.addImage(imageDataUrl, 'JPEG', currentX, yPosition, photoWidth, photoHeight);

                pdf.setFontSize(10);
                const photoLabel = `FOTO ${photoCount}: ${photoData.caption.toUpperCase()}`;

                const maxCaptionWidth = photoWidth;
                const words = photoLabel.split(' ');
                let lines = [];
                let currentLine = '';

                words.forEach((word) => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const lineWidth = pdf.getStringUnitWidth(testLine) * 10 / pdf.internal.scaleFactor;

                    if (lineWidth > maxCaptionWidth && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                if (currentLine) lines.push(currentLine);

                lines.forEach((line, lineIndex) => {
                    pdf.text(line, currentX + (photoWidth / 2) - (pdf.getStringUnitWidth(line) * 10 / pdf.internal.scaleFactor / 2),
                        yPosition + photoHeight + 8 + (lineIndex * 5));
                });

                pdf.setFontSize(12);
                photoCount++;
                currentX += photoWidth + 10;

                if (photoCount % photosPerRow === 1) {
                    currentX = startX;
                    yPosition += photoHeight + 20 + (lines.length * 5);
                }
            } catch (error) {
                console.error('Erro ao processar foto:', error);
            }
        }
    } else {
        pdf.text('NENHUMA FOTO ADICIONADA', 20, yPosition);
    }

    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Relatório gerado por 7Lan - Sistema de Relatórios Fotográficos', 20, pageHeight - 20);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10);

    const fileName = `Relatorio_${cliente.replace(/\s+/g, '_')}_${contrato}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    showStatus('PDF gerado com sucesso!', 'success');
}

// Preview, caption & utility functions continuam iguais...
// (previewPhotos, renderPhotoPreview, updatePhotoCaption, fileToDataURL, etc.)

// Auto-load location and set current date
window.addEventListener('load', function () {
    setTimeout(() => {
        getLocation();
    }, 1000);
});

document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});
// Adicione esta função ao seu arquivo index.js

// Função para criar inputs de número de série dinâmicos
function createSerialInputs(equipmentItem, quantity, equipmentName) {
    let serialContainer = equipmentItem.querySelector('.serial-container');
    const currentInputs = serialContainer ? serialContainer.querySelectorAll('.serial-input-group').length : 0;

    // Se quantidade for 0 ou menor, remove o container
    if (quantity <= 0) {
        if (serialContainer) {
            serialContainer.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                if (serialContainer && serialContainer.parentNode) {
                    serialContainer.remove();
                }
            }, 300);
        }
        return;
    }

    // Se não existe container, cria um novo
    if (!serialContainer) {
        serialContainer = document.createElement('div');
        serialContainer.className = 'serial-container';
        
        // Título para a seção de números de série
        const title = document.createElement('div');
        title.className = 'serial-title';
        title.textContent = `Números de Série - ${equipmentName}:`;
        serialContainer.appendChild(title);

        // Adiciona o container após o input de quantidade
        equipmentItem.appendChild(serialContainer);
    }

    // Ajusta a quantidade de inputs
    if (quantity > currentInputs) {
        // Adiciona novos inputs
        for (let i = currentInputs + 1; i <= quantity; i++) {
            const serialGroup = document.createElement('div');
            serialGroup.className = 'serial-input-group';
            serialGroup.style.animation = 'slideDown 0.3s ease-out';

            const label = document.createElement('label');
            label.textContent = `${i}°:`;
            label.className = 'serial-label';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'serial-number-input';
            input.placeholder = `Número de série ${i}`;
            input.setAttribute('data-equipment', equipmentName.toLowerCase());
            input.setAttribute('data-index', i);

            serialGroup.appendChild(label);
            serialGroup.appendChild(input);
            serialContainer.appendChild(serialGroup);
        }
    } else if (quantity < currentInputs) {
        // Remove inputs excedentes
        const inputGroups = serialContainer.querySelectorAll('.serial-input-group');
        for (let i = inputGroups.length - 1; i >= quantity; i--) {
            const groupToRemove = inputGroups[i];
            groupToRemove.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                if (groupToRemove && groupToRemove.parentNode) {
                    groupToRemove.remove();
                }
            }, 300);
        }
    }
}

// Função para monitorar mudanças nos inputs de equipamentos
function setupEquipmentWatchers() {
    const equipmentItems = document.querySelectorAll('.equipment-item');
    
    equipmentItems.forEach(item => {
        const input = item.querySelector('input[type="number"]');
        const equipmentName = item.querySelector('span').textContent;
        
        if (input) {
            // Event listener para mudanças no input
            input.addEventListener('input', function() {
                const quantity = parseInt(this.value) || 0;
                createSerialInputs(item, quantity, equipmentName);
            });

            // Event listener para mudanças com mouse (scroll wheel)
            input.addEventListener('change', function() {
                const quantity = parseInt(this.value) || 0;
                createSerialInputs(item, quantity, equipmentName);
            });
        }
    });
}

// Função para coletar todos os números de série (para usar na geração do PDF)
function collectSerialNumbers() {
    const serialData = {};
    const serialInputs = document.querySelectorAll('.serial-number-input');
    
    serialInputs.forEach(input => {
        const equipment = input.getAttribute('data-equipment');
        const index = input.getAttribute('data-index');
        const value = input.value.trim();
        
        if (value) {
            if (!serialData[equipment]) {
                serialData[equipment] = {};
            }
            serialData[equipment][index] = value;
        }
    });
    
    return serialData;
}

// Função para formatar números de série para exibição no PDF
function formatSerialNumbersForPDF(serialData) {
    let formattedText = '';
    
    Object.keys(serialData).forEach(equipment => {
        const equipmentSerials = serialData[equipment];
        const serialNumbers = Object.values(equipmentSerials);
        
        if (serialNumbers.length > 0) {
            const equipmentName = equipment.charAt(0).toUpperCase() + equipment.slice(1);
            formattedText += `\n${equipmentName}: ${serialNumbers.join(', ')}`;
        }
    });
    
    return formattedText;
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar os watchers depois que a página carregar completamente
    setTimeout(() => {
        setupEquipmentWatchers();
    }, 100);
    
    // Configurar data atual
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});

// Exemplo de como usar na função generatePDF() - adicione esta parte na sua função existente:
/*
// Na sua função generatePDF(), após coletar os dados dos equipamentos, adicione:

// Coletar números de série
const serialNumbers = collectSerialNumbers();
const serialText = formatSerialNumbersForPDF(serialNumbers);

// Adicionar ao PDF após a seção de equipamentos
if (serialText) {
    yPosition += 5;
    pdf.text('NÚMEROS DE SÉRIE DOS EQUIPAMENTOS:', 20, yPosition);
    yPosition += 10;
    
    const serialLines = serialText.split('\n').filter(line => line.trim());
    serialLines.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 8;
    });
    yPosition += 10;
}
*/