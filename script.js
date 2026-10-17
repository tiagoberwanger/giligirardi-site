// Roda zodiacal: 12 signos no sentido anti-horário a partir de Áries (à esquerda), como num mapa astral
(function desenharRoda() {
    const roda = document.querySelector('.roda');
    const centro = 300;
    const externo = 290;
    const interno = 245;
    const ponto = (raio, graus) => {
        const angulo = (180 + graus) * Math.PI / 180;
        return [centro + raio * Math.cos(angulo), centro - raio * Math.sin(angulo)];
    };
    const linha = (r1, r2, graus) => {
        const [x1, y1] = ponto(r1, graus);
        const [x2, y2] = ponto(r2, graus);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" vector-effect="non-scaling-stroke" />`;
    };

    let tracos = '';
    for (let graus = 0; graus < 360; graus += 5) {
        if (graus % 30 === 0) {
            tracos += linha(interno, externo, graus);
        } else {
            tracos += linha(interno, interno - (graus % 10 === 0 ? 9 : 5), graus);
        }
    }

    let signos = '';
    for (let i = 0; i < 12; i++) {
        const [x, y] = ponto((externo + interno) / 2, i * 30 + 15);
        // ︎ força a versão em texto do glifo (evita virar emoji no celular)
        const glifo = String.fromCodePoint(0x2648 + i) + '︎';
        signos += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${glifo}</text>`;
    }

    roda.innerHTML = `
        <g fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="${centro}" cy="${centro}" r="${externo}" vector-effect="non-scaling-stroke" />
            <circle cx="${centro}" cy="${centro}" r="${interno}" vector-effect="non-scaling-stroke" />
            ${tracos}
        </g>
        <g fill="currentColor">${signos}</g>`;
})();

// Estrelas cintilando no miolo escuro da nebulosa e uma estrela cadente de vez em quando
(function animarCeu() {
    const mapa = document.querySelector('.mapa');
    const ceu = document.getElementById('ceu');
    const ctx = ceu.getContext('2d');
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

    let tamanho = 0;
    let estrelas = [];
    let cadente = null;
    let proximaCadente = 2;
    let visivel = true;

    function popular() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        tamanho = mapa.clientWidth;
        ceu.width = tamanho * dpr;
        ceu.height = tamanho * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const centro = tamanho / 2;
        const total = Math.round(tamanho / 9);
        estrelas = [];
        while (estrelas.length < total) {
            const angulo = Math.random() * Math.PI * 2;
            const distancia = Math.sqrt(Math.random()) * tamanho * 0.36;
            const dx = Math.cos(angulo) * distancia;
            const dy = Math.sin(angulo) * distancia;
            // Deixa livre o retângulo do título
            if (Math.abs(dx) < tamanho * 0.2 && Math.abs(dy) < tamanho * 0.12) {
                continue;
            }
            estrelas.push({
                x: centro + dx,
                y: centro + dy,
                raio: Math.pow(Math.random(), 4) * 1.5 + 0.35,
                fase: Math.random() * Math.PI * 2,
                ritmo: 0.4 + Math.random() * 1.6,
                cor: Math.random() < 0.3 ? '#e4dcff' : '#ffffff',
            });
        }
    }

    function desenharEstrela(estrela, t) {
        const alfa = 0.3 + 0.7 * Math.sin(t * estrela.ritmo + estrela.fase) ** 2;
        ctx.globalAlpha = alfa;
        ctx.fillStyle = estrela.cor;
        ctx.beginPath();
        ctx.arc(estrela.x, estrela.y, estrela.raio, 0, Math.PI * 2);
        ctx.fill();

        // As maiores ganham um brilho em cruz
        if (estrela.raio > 1.25) {
            const braco = estrela.raio * 4 * alfa;
            ctx.strokeStyle = estrela.cor;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(estrela.x - braco, estrela.y);
            ctx.lineTo(estrela.x + braco, estrela.y);
            ctx.moveTo(estrela.x, estrela.y - braco);
            ctx.lineTo(estrela.x, estrela.y + braco);
            ctx.stroke();
        }
    }

    // Cruza a parte de cima da lua, acima do título
    function lancarCadente(t) {
        const sentido = Math.random() < 0.5 ? 1 : -1;
        const angulo = Math.PI * (0.08 + Math.random() * 0.08);
        cadente = {
            x: tamanho * (0.5 - sentido * (0.1 + Math.random() * 0.08)),
            y: tamanho * (0.24 + Math.random() * 0.06),
            dx: Math.cos(angulo) * sentido,
            dy: Math.sin(angulo),
            inicio: t,
            duracao: 0.8,
            percurso: tamanho * 0.3,
        };
    }

    function desenharCadente(t) {
        const progresso = (t - cadente.inicio) / cadente.duracao;
        if (progresso >= 1) {
            cadente = null;
            proximaCadente = t + 6 + Math.random() * 10;
            return;
        }
        const cabecaX = cadente.x + cadente.dx * cadente.percurso * progresso;
        const cabecaY = cadente.y + cadente.dy * cadente.percurso * progresso;
        const cauda = tamanho * 0.12 * Math.sin(Math.PI * progresso);
        const caudaX = cabecaX - cadente.dx * cauda;
        const caudaY = cabecaY - cadente.dy * cauda;

        const rastro = ctx.createLinearGradient(cabecaX, cabecaY, caudaX, caudaY);
        rastro.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        rastro.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.globalAlpha = Math.sin(Math.PI * progresso);
        ctx.strokeStyle = rastro;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cabecaX, cabecaY);
        ctx.lineTo(caudaX, caudaY);
        ctx.stroke();
    }

    function desenharCeu(t) {
        ctx.clearRect(0, 0, tamanho, tamanho);
        for (const estrela of estrelas) {
            desenharEstrela(estrela, t);
        }
        if (calmo.matches) {
            return;
        }
        if (!cadente && t > proximaCadente) {
            lancarCadente(t);
        }
        if (cadente) {
            desenharCadente(t);
        }
    }

    function quadro(agora) {
        if (visivel) {
            desenharCeu(agora / 1000);
        }
        requestAnimationFrame(quadro);
    }

    // Não anima enquanto a roda está fora da tela
    new IntersectionObserver(([entrada]) => {
        visivel = entrada.isIntersecting;
    }).observe(mapa);

    let espera;
    new ResizeObserver(() => {
        clearTimeout(espera);
        espera = setTimeout(() => {
            cadente = null;
            popular();
            desenharCeu(0);
        }, 150);
    }).observe(mapa);

    popular();
    desenharCeu(0);
    if (!calmo.matches) {
        requestAnimationFrame(quadro);
    }
})();
