// Estrelas cintilando e cometas cruzando todo o céu noturno (Opção 1)
(function animarCeu() {
    const abertura = document.querySelector('.abertura');
    const ceu = document.getElementById('ceu');
    if (!abertura || !ceu) return;

    const ctx = ceu.getContext('2d');
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

    let largura = 0;
    let altura = 0;
    let estrelas = [];
    let cadente = null;
    let proximaCadente = 2;
    let visivel = true;

    function popular() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        largura = abertura.clientWidth;
        altura = abertura.clientHeight;
        ceu.width = largura * dpr;
        ceu.height = altura * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Estrelas distribuídas por toda a extensão do céu noturno
        const total = Math.max(120, Math.round((largura * altura) / 5500));
        estrelas = [];
        const centroX = largura / 2;
        const centroY = altura / 2;

        for (let i = 0; i < total; i++) {
            const x = Math.random() * largura;
            const y = Math.random() * altura;

            // Mantém área direta do título com estrelas menores para não competir com a leitura
            const dx = Math.abs(x - centroX);
            const dy = Math.abs(y - centroY);
            const noTitulo = dx < largura * 0.22 && dy < altura * 0.12;

            estrelas.push({
                x,
                y,
                raio: (noTitulo ? 0.6 : 1) * (Math.pow(Math.random(), 3.5) * 1.6 + 0.35),
                fase: Math.random() * Math.PI * 2,
                ritmo: 0.4 + Math.random() * 1.6,
                cor: Math.random() < 0.35 ? '#dcd2fc' : (Math.random() < 0.2 ? '#fff7eb' : '#ffffff'),
            });
        }
    }

    function desenharEstrela(estrela, t) {
        const alfa = 0.25 + 0.75 * Math.sin(t * estrela.ritmo + estrela.fase) ** 2;
        ctx.globalAlpha = alfa;
        ctx.fillStyle = estrela.cor;
        ctx.beginPath();
        ctx.arc(estrela.x, estrela.y, estrela.raio, 0, Math.PI * 2);
        ctx.fill();

        // As maiores ganham um brilho em cruz
        if (estrela.raio > 1.25) {
            const braco = estrela.raio * 4.2 * alfa;
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

    // Cometa cruzando amplamente o céu da esquerda ou da direita
    function lancarCadente(t) {
        const sentido = Math.random() < 0.5 ? 1 : -1;
        const angulo = Math.PI * (0.07 + Math.random() * 0.08);
        cadente = {
            x: largura * (sentido > 0 ? (0.05 + Math.random() * 0.25) : (0.95 - Math.random() * 0.25)),
            y: altura * (0.08 + Math.random() * 0.22),
            dx: Math.cos(angulo) * sentido,
            dy: Math.sin(angulo),
            inicio: t,
            duracao: 0.9,
            percurso: Math.max(largura, altura) * 0.4,
        };
    }

    function desenharCadente(t) {
        const progresso = (t - cadente.inicio) / cadente.duracao;
        if (progresso >= 1) {
            cadente = null;
            proximaCadente = t + 4.5 + Math.random() * 7;
            return;
        }
        const cabecaX = cadente.x + cadente.dx * cadente.percurso * progresso;
        const cabecaY = cadente.y + cadente.dy * cadente.percurso * progresso;
        const cauda = cadente.percurso * 0.38 * Math.sin(Math.PI * progresso);
        const caudaX = cabecaX - cadente.dx * cauda;
        const caudaY = cabecaY - cadente.dy * cauda;

        const rastro = ctx.createLinearGradient(cabecaX, cabecaY, caudaX, caudaY);
        rastro.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        rastro.addColorStop(0.3, 'rgba(225, 215, 255, 0.7)');
        rastro.addColorStop(1, 'rgba(225, 215, 255, 0)');
        ctx.globalAlpha = Math.sin(Math.PI * progresso);
        ctx.strokeStyle = rastro;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cabecaX, cabecaY);
        ctx.lineTo(caudaX, caudaY);
        ctx.stroke();
    }

    function desenharCeu(t) {
        ctx.clearRect(0, 0, largura, altura);
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

    new IntersectionObserver(([entrada]) => {
        visivel = entrada.isIntersecting;
    }).observe(abertura);

    let espera;
    new ResizeObserver(() => {
        clearTimeout(espera);
        espera = setTimeout(() => {
            cadente = null;
            popular();
            desenharCeu(0);
        }, 120);
    }).observe(abertura);

    popular();
    desenharCeu(0);
    if (!calmo.matches) {
        requestAnimationFrame(quadro);
    }
})();

// Acordeão exclusivo para Perguntas Frequentes
(function iniciarFaq() {
    const itens = document.querySelectorAll('.faq-item');
    itens.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                itens.forEach(outro => {
                    if (outro !== item && outro.open) {
                        outro.open = false;
                    }
                });
            }
        });
    });
})();
