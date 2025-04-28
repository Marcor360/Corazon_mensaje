(function () {
    var canvas = $('#canvas');

    if (!canvas[0].getContext) {
        $("#error").show();
        return false;
    }

    var width = canvas.width();
    var height = canvas.height();

    canvas.attr("width", width);
    canvas.attr("height", height);

    var opts = {
        seed: {
            x: width / 2 - 20,
            color: "rgb(199, 65, 123)", // Color del corazón inicial
            scale: 2
        },
        branch: [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [
                    [450, 435, 434, 430, 394, 395, 2, 40]
                ]],
                [550, 445, 600, 356, 680, 345, 12, 100, [
                    [578, 400, 648, 409, 661, 426, 3, 80]
                ]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60]
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [
                    [590, 293, 646, 277, 648, 271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 700,
            width: 1080,
            height: 650,
        },
        footer: {
            width: 1200,
            height: 5,
            speed: 10,
        }
    }

    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;

    // Agregar botón de inicio más visible
    var startButton = $('<button id="start-animation">Iniciar Animación ❤️</button>');
    startButton.css({
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'padding': '15px 30px',
        'background-color': '#c7417b',
        'color': 'white',
        'border': 'none',
        'border-radius': '50px',
        'font-size': '18px',
        'cursor': 'pointer',
        'box-shadow': '0 4px 15px rgba(0,0,0,0.3)',
        'z-index': '999',
        'transition': 'all 0.3s ease'
    });
    startButton.hover(function () {
        $(this).css('background-color', '#a73264');
    }, function () {
        $(this).css('background-color', '#c7417b');
    });

    $('#wrap').append(startButton);

    // Función para iniciar la animación
    function startAnimation() {
        hold = 0;
        startButton.fadeOut(500, function () {
            $(this).remove();
        });

        // Intentar reproducir la música automáticamente
        var audio = document.getElementById('media');
        if (audio) {
            audio.play().catch(function (e) {
                console.log("Autoplay prevented:", e);
            });
        }

        // Mostrar el botón de control de audio
        $('#audio-control').fadeIn(500);
    }

    // Evento de clic en el botón de inicio
    startButton.on('click', function () {
        startAnimation();
    });

    // También mantener la capacidad de hacer clic en el corazón
    canvas.on('click', function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;

        if (seed.hover(x, y)) {
            startAnimation();
        }
    });

    // Soporte táctil
    canvas.on('touchstart', function (e) {
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        var offset = canvas.offset(), x, y;
        x = touch.pageX - offset.left;
        y = touch.pageY - offset.top;

        if (seed.hover(x, y)) {
            startAnimation();
        }
    });

    // Iniciar automáticamente después de 5 segundos
    var autoStartTimer = setTimeout(function () {
        if (hold === 1) { // Solo si no se ha iniciado manualmente
            startAnimation();
        }
    }, 5000);

    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
            seed.move(0, 2);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.grow();
            $await(Jscex.Async.sleep(10));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.flower(2);
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        tree.snapshot("p1", 240, 0, 610, 680);
        while (tree.move("p1", 500, 0)) {
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
        foot.draw();
        tree.snapshot("p2", 500, 0, 610, 680);

        canvas.parent().css("background", "url(" + tree.toDataURL('image/png') + ")");
        canvas.css("background", "#f0e6fa"); // Actualizado al nuevo color de fondo
        $await(Jscex.Async.sleep(300));
        canvas.css("background", "none");
    }));

    var jumpAnimate = eval(Jscex.compile("async", function () {
        var ctx = tree.ctx;
        while (true) {
            tree.ctx.clearRect(0, 0, width, height);
            tree.jump();
            foot.draw();
            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        together.setFullYear(2024, 3, 26);
        together.setHours(0);
        together.setMinutes(0);
        together.setSeconds(0);
        together.setMilliseconds(0);

        $("#code").show().typewriter();
        $("#clock-box").fadeIn(500);
        while (true) {
            timeElapse(together);
            $await(Jscex.Async.sleep(1000));
        }
    }));

    var runAsync = eval(Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());

        textAnimate().start();

        $await(jumpAnimate());
    }));

    // Iniciar la animación desde el principio
    runAsync().start();

    // Hacer el corazón inicial más grande para que sea más visible
    seed.setHeartScale(1.2);
    seed.drawHeart();

    // Manejo del botón de audio
    $('#play-music').on('click', function () {
        var audio = document.getElementById('media');
        if (audio) {
            if (audio.paused) {
                audio.play();
                $(this).text('♫ Pausar música');
            } else {
                audio.pause();
                $(this).text('♫ Reproducir música');
            }
        }
    });

    // Ocultar el botón de audio inicialmente
    $('#audio-control').hide();
})();