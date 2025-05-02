
import re
import fitz  # PyMuPDF

# MATEUS ELETRONICA - SLZ
def extrair_cnpj(texto):
    match = re.search(r'CPF/CNPJ:\s*([0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2})', texto)
    if match:
        return match.group(1)
    match = re.search(r'CPF/CNPJ:\s*([0-9]{2}\.\\d{3}\.\\d{3}\/\\d{4}-\\d{2})', texto)
    if match:
        return match.group(1)
    match = re.search(r'([0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2})', texto)
    if match:
        return match.group(1)
    match = re.search(r'([0-9]{2}\.\\d{3}\.\\d{3}\/\\d{4}-\\d{2})', texto)
    if match:
        return match.group(1)
    return None

def extrair_numero_nota(texto):
    match = re.search(r'Número da Nota\s*[:=]?\s*([0-9]{8})', texto, re.IGNORECASE)
    if match:
        return match.group(1)
    match = re.search(r'Nota Fiscal\s*n[º°]?\s*[:=]?\s*([0-9]{8})', texto, re.IGNORECASE)
    if match:
        return match.group(1)
    match = re.search(r'N[º°]\.?\s*[:=]?\s*([0-9]{8})', texto, re.IGNORECASE)
    if match:
        return match.group(1)
    match = re.search(r'Número\s*[:=]?\s*([0-9]{8})', texto, re.IGNORECASE)
    if match:
        return match.group(1)
    match = re.search(r'\b([0-9]{8})\b', texto)
    if match:
        return match.group(1)
    return None

def extrair_recolhimento(texto):
    match = re.search(r'Recolhimento:\s*(\w+)', texto)
    return match.group(1) if match else None

def extrair_valor_total_nota(texto):
    match = re.search(r'VALOR TOTAL DA NOTA\s*[:=]?\s*(R\$?\s*[0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2})', texto, re.IGNORECASE)
    return match.group(1) if match else None

def extrair_valor_iss(texto):
    match = re.search(r'Valor ISS:\s*(R\$?\s*[0-9]{1,3}(?:\.[0-9]{3})*\,[0-9]{2})', texto, re.IGNORECASE)
    return match.group(1) if match else None

# OI LINK
def extrair_oi_link_dados(texto):
    linha_digitavel_pattern = re.compile(r'\d{11}-\d\s\d{11}-\d\s\d{11}-\d\s\d{11}-\d')
    valor_pagar_pattern = re.compile(r'VALOR\s+A\s+PAGAR[\s:]*R?\$?\s*([\d\.]+,\d{2})', re.IGNORECASE)
    fatura_pattern = re.compile(r'FATURA\s*(N\.?|Nº|No\.?)\s*[:\-]?\s*(\d+)', re.IGNORECASE)
    
    linha_digitavel = "Não encontrada"
    valor_a_pagar = "Não encontrado"
    fatura_numero = "Não encontrado"
    
    match_linha = linha_digitavel_pattern.search(texto)
    if match_linha:
        linha_digitavel = match_linha.group()
    
    match_valor = valor_pagar_pattern.search(texto)
    if match_valor:
        valor_a_pagar = match_valor.group(1)
    
    match_fatura = fatura_pattern.search(texto)
    if match_fatura:
        fatura_numero = match_fatura.group(2)
    
    return {
        "Linha Digitável": linha_digitavel,
        "Valor a Pagar": valor_a_pagar,
        "Fatura N.": fatura_numero
    }

# SINDICATO e AMASP (compartilham lógica similar)
def extrair_sindicato_amasp_dados(texto, blocks=None):
    linha_digitavel_pattern = re.compile(r'\d{5}\.\d{5}\s+\d{5}\.\d{6,7}\s+\d{5}\.\d{6,7}\s+\d\s+\d{14}')
    valor_regex = re.compile(r'\b\d{1,3}(?:\.\d{3})*,\d{2}\b')
    
    cnpj_pagador = "Não encontrado"
    linha_digitavel = "Não encontrada"
    nosso_numero = "Não encontrado"
    valor_documento = "Não encontrado"
    
    # CNPJ do Pagador com abordagem inteligente
    keywords_pagador = ['pagador', 'tomador', 'cliente', 'contratante', 'sacado', 'empresa', 'cedente']
    fallback_cnpj = None
    
    for linha in texto.splitlines():
        if not fallback_cnpj:
            cnpj_match = re.search(r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}', linha)
            if cnpj_match:
                fallback_cnpj = cnpj_match.group()
                
        if any(palavra in linha.lower() for palavra in keywords_pagador):
            cnpj_match = re.search(r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}', linha)
            if cnpj_match:
                cnpj_pagador = cnpj_match.group()
                break
    
    if cnpj_pagador == "Não encontrado" and fallback_cnpj:
        cnpj_pagador = fallback_cnpj
    
    # Linha Digitável
    match_linha = linha_digitavel_pattern.search(texto)
    if match_linha:
        linha_digitavel = match_linha.group().strip()
    
    # Nosso Número (último número na linha com "DM N")
    for linha in texto.splitlines():
        if "dm n" in linha.lower():
            numeros = re.findall(r'\b\d{5}\b', linha)
            if numeros:
                nosso_numero = numeros[-1]
                break
    
    # Valor do Documento - simplificado
    if blocks:
        for i, block in enumerate(blocks):
            if "valor do documento" in block[4].lower():
                x_ref = block[0]
                y_ref = block[1]
                for b in blocks:
                    if abs(b[0] - x_ref) < 10 and b[1] > y_ref:
                        match_valor = valor_regex.search(b[4])
                        if match_valor:
                            valor_documento = match_valor.group()
                            break
                break
    else:
        # Fallback se não tivermos blocos de coordenadas
        for linha in texto.splitlines():
            if "valor do documento" in linha.lower():
                match_valor = valor_regex.search(linha)
                if match_valor:
                    valor_documento = match_valor.group()
                    break
    
    return {
        "CNPJ do Pagador": cnpj_pagador,
        "Linha Digitável": linha_digitavel,
        "Nosso Número": nosso_numero,
        "Valor do Documento": valor_documento
    }

# TECBAN
def extrair_tecban_dados(texto):
    codigo_barras_pattern = re.compile(r'\d{5}\.\d{5}\s+\d{5}\.\d{6}\s+\d{5}\.\d{6}\s+\d\s+\d{14}')
    cnpj_pattern = re.compile(r'CNPJ[:\s]*([\d\.\-/]{18})')
    valor_pattern = re.compile(r'\b\d{1,3}(?:\.\d{3})*,\d{2}\b')
    
    codigo_barras = None
    numero_nota = None
    cnpj = None
    valor_total = None
    valor_liquido = None
    
    # Código de Barras
    match = codigo_barras_pattern.search(texto)
    if match:
        codigo_barras = match.group().strip()
    
    # Número da Nota
    linhas = texto.splitlines()
    for i, linha in enumerate(linhas):
        if "Número da Nota" in linha:
            if i + 1 < len(linhas):
                valor = linhas[i + 1].strip()
                if valor.isdigit():
                    numero_nota = valor
    
    # CNPJ
    match = cnpj_pattern.search(texto)
    if match:
        cnpj = match.group(1)
    
    # Valor Total e Líquido - simplificado
    matches = re.findall(valor_pattern, texto)
    valores = []
    for v in matches:
        try:
            valores.append(float(v.replace(".", "").replace(",", ".")))
        except:
            continue
    
    if valores:
        valores.sort(reverse=True)
        if len(valores) > 0:
            valor_total = f"R$ {valores[0]:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        if len(valores) > 1:
            valor_liquido = f"R$ {valores[1]:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    
    return {
        "Código de Barras": codigo_barras,
        "Número da Nota": numero_nota,
        "CNPJ": cnpj,
        "Valor Total": valor_total,
        "Valor Líquido": valor_liquido
    }

# F DE OLIVEIRA
def extrair_f_oliveira_dados(texto, blocks=None):
    cnpj_pattern = re.compile(r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}')
    numero_nota_pattern = re.compile(r'\d{15}')
    valor_pattern = re.compile(r'R?\$?\s*[\d\.]*\d+,\d{2}')
    linha_digitavel_pattern = re.compile(r'\d{5}\.\d{5}\s+\d{5}\.\d{6,7}\s+\d{5}\.\d{6,7}\s+\d\s+\d{14}')
    
    numero_nota = "Não encontrado"
    cnpj_tomador = "Não encontrado"
    valor_servicos = "Não encontrado"
    valor_liquido = "Não encontrado"
    total_retencoes = "Não encontrado"
    iss_retido = "Não encontrado"
    linha_digitavel = "Não encontrado"
    
    # Busca simplificada
    # Número da Nota
    match = numero_nota_pattern.search(texto)
    if match:
        numero_nota = match.group()
    
    # CNPJ do Tomador
    cnpj_matches = cnpj_pattern.findall(texto)
    if cnpj_matches and len(cnpj_matches) > 0:
        cnpj_tomador = cnpj_matches[0]  # Simplificado, pega o primeiro
    
    # Valores - busca simplificada
    for linha in texto.splitlines():
        if ("valor dos serviços" in linha.lower() or "vlr dos serviços" in linha.lower()) and valor_servicos == "Não encontrado":
            match = valor_pattern.search(linha)
            if match:
                valor_servicos = match.group().replace("R$", "").strip()
                
        if "valor líquido" in linha.lower() and valor_liquido == "Não encontrado":
            match = valor_pattern.search(linha)
            if match:
                valor_liquido = match.group().replace("R$", "").strip()
                
        if "total retenções" in linha.lower() and total_retencoes == "Não encontrado":
            match = valor_pattern.search(linha)
            if match:
                total_retencoes = match.group().replace("R$", "").strip()
                
        if "iss retido" in linha.lower() and iss_retido == "Não encontrado":
            match = valor_pattern.search(linha)
            if match:
                iss_retido = match.group().replace("R$", "").strip()
    
    # Linha Digitável
    match = linha_digitavel_pattern.search(texto)
    if match:
        linha_digitavel = re.sub(r'[^\d]', '', match.group())  # remove tudo exceto números
    
    return {
        "Número da Nota": numero_nota,
        "CNPJ do Tomador": cnpj_tomador,
        "Valor dos Serviços (R$)": valor_servicos,
        "Valor Líquido (R$)": valor_liquido,
        "Total Retenções (R$)": total_retencoes,
        "ISS Retido": iss_retido,
        "Linha Digitável / Código": linha_digitavel
    }

# FPS SEGURANÇA
def extrair_fps_seguranca_dados(texto):
    numero_nota_pattern = re.compile(r'Nota de Número[:\s]*([0-9]{15})', re.IGNORECASE)
    valor_servicos_pattern = re.compile(r'VALORES DA NOTA\s*R\$([\d.,]+)', re.IGNORECASE)
    valor_liquido_pattern = re.compile(r'Valor Líquido \(R\$?\)\s*R\$?\s*([\d.,]+)', re.IGNORECASE)
    total_retencoes_pattern = re.compile(r'Total Retenções \(R\$?\)\s*R\$?\s*([\d.,]+)', re.IGNORECASE)
    cnpj_pattern = re.compile(r'(\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2})')
    
    numero_nota = "Não encontrado"
    cnpj_tomador = "Não encontrado"
    valor_servicos = "Não encontrado"
    valor_liquido = "Não encontrado"
    total_retencoes = "Não encontrado"
    
    match_nota = numero_nota_pattern.search(texto)
    if match_nota:
        numero_nota = match_nota.group(1)
    
    match_valor_serv = valor_servicos_pattern.search(texto)
    if match_valor_serv:
        valor_servicos = match_valor_serv.group(1).replace('.', ',')
    
    match_valor_liq = valor_liquido_pattern.search(texto)
    if match_valor_liq:
        valor_liquido = match_valor_liq.group(1).replace('.', ',')
    
    match_retencao = total_retencoes_pattern.search(texto)
    if match_retencao:
        total_retencoes = match_retencao.group(1).replace('.', ',')
    
    if "TOMADOR DE SERVIÇOS" in texto:
        trecho_tomador = texto.split("TOMADOR DE SERVIÇOS", 1)[1]
        cnpj_match = cnpj_pattern.search(trecho_tomador)
        if cnpj_match:
            cnpj_tomador = cnpj_match.group(1)
    
    return {
        "Número da Nota": numero_nota,
        "CNPJ Tomador": cnpj_tomador,
        "Valor dos Serviços (R$)": valor_servicos,
        "Valor Líquido (R$)": valor_liquido,
        "Total Retenções (R$)": total_retencoes
    }

# MATEUS ELETRONICA - MARABÁ
def extrair_mateus_maraba_dados(texto):
    cnpj_pattern = re.compile(r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}')
    numero_nota_pattern = re.compile(r'\b\d{15}\b')
    valor_pattern = re.compile(r'R?\$?\s*[\d\.]*\d+,\d{2}')
    
    cnpj_tomador = "Não encontrado"
    numero_nota = "Não encontrado"
    valor_servicos = "Não encontrado"
    valor_liquido = "Não encontrado"
    
    # Buscar CNPJ do Tomador
    cnpj_matches = cnpj_pattern.findall(texto)
    if cnpj_matches:
        cnpj_tomador = cnpj_matches[-1]  # Pega o último CNPJ encontrado
    
    # Buscar Número da Nota
    numero_matches = numero_nota_pattern.findall(texto)
    if numero_matches:
        numero_nota = numero_matches[0]  # Pega o primeiro número de 15 dígitos
    
    # Buscar valores monetários
    valores_encontrados = valor_pattern.findall(texto)
    valores_numericos = []
    for v in valores_encontrados:
        valor_limpo = v.replace('R$', '').replace(' ', '').replace('.', '').replace(',', '.')
        try:
            valores_numericos.append(float(valor_limpo))
        except:
            continue
    
    if valores_numericos:
        valores_numericos.sort(reverse=True)
        if len(valores_numericos) >= 1:
            valor_servicos = f"{valores_numericos[0]:,.2f}".replace(".", ",")
        if len(valores_numericos) >= 2:
            valor_liquido = f"{valores_numericos[1]:,.2f}".replace(".", ",")
    
    return {
        "CNPJ do Tomador": cnpj_tomador,
        "Número da Nota": numero_nota,
        "Valor dos Serviços (R$)": valor_servicos,
        "Valor Líquido (R$)": valor_liquido
    }

# Função para detectar automaticamente o tipo de documento
def detectar_tipo_documento(texto):
    if "mateus" in texto.lower() and "slz" in texto.lower():
        return "mateus-slz"
    elif "mateus" in texto.lower() and "maraba" in texto.lower():
        return "mateus-maraba"
    elif "oi" in texto.lower() and "link" in texto.lower():
        return "oi-link"
    elif "sindicato" in texto.lower():
        return "sindicato"
    elif "tecban" in texto.lower():
        return "tecban"
    elif "amasp" in texto.lower():
        return "amasp"
    elif "f de oliveira" in texto.lower() or "f. de oliveira" in texto.lower():
        return "f-oliveira"
    elif "fps" in texto.lower() and "seguranca" in texto.lower():
        return "fps-seguranca"
    else:
        # Detecção baseada em características específicas em vez do nome
        if re.search(r'Número da Nota\s*[:=]?\s*([0-9]{8})', texto, re.IGNORECASE):
            return "mateus-slz"
        elif re.search(r'VALOR\s+A\s+PAGAR', texto, re.IGNORECASE):
            return "oi-link"
        elif "dm n" in texto.lower():
            return "sindicato" 
        elif re.search(r'Valor\s+Liquido:', texto, re.IGNORECASE):
            return "tecban"
        else:
            # Valor padrão
            return "mateus-slz"  

# Função principal para extrair dados de acordo com o tipo de documento
def extract_data_from_pdf(pdf_bytes, document_type=None):
    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            texto = ""
            blocks = []
            for page in doc:
                texto += page.get_text()
                blocks.extend(page.get_text("blocks"))
        
        # Se o tipo de documento não foi especificado, detecta automaticamente
        if not document_type or document_type == "auto-detect":
            document_type = detectar_tipo_documento(texto)
        
        if document_type == "mateus-slz":
            cnpj = extrair_cnpj(texto)
            numero_nota = extrair_numero_nota(texto)
            recolhimento = extrair_recolhimento(texto)
            valor_total_nota = extrair_valor_total_nota(texto)
            valor_iss = extrair_valor_iss(texto)
            
            return {
                "CPF/CNPJ": cnpj,
                "Número da Nota": numero_nota,
                "Recolhimento": recolhimento,
                "VALOR TOTAL DA NOTA": valor_total_nota,
                "Valor ISS": valor_iss
            }
        elif document_type == "oi-link":
            return extrair_oi_link_dados(texto)
        elif document_type == "sindicato":
            return extrair_sindicato_amasp_dados(texto, blocks)
        elif document_type == "tecban":
            return extrair_tecban_dados(texto)
        elif document_type == "amasp":
            return extrair_sindicato_amasp_dados(texto, blocks)
        elif document_type == "f-oliveira":
            return extrair_f_oliveira_dados(texto, blocks)
        elif document_type == "fps-seguranca":
            return extrair_fps_seguranca_dados(texto)
        elif document_type == "mateus-maraba":
            return extrair_mateus_maraba_dados(texto)
        else:
            # Tipo de documento não reconhecido, tenta mateus-slz como padrão
            return extract_data_from_pdf(pdf_bytes, "mateus-slz")
    except Exception as e:
        raise Exception(f"Erro ao extrair dados do PDF: {str(e)}")
