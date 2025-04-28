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

    // Importante: Agregar transparencia para que los eventos de click funcionen
    $(canvas).css('pointer-events', 'auto');

    canvas.on('click', function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        console.log("Click en: ", x, y); // Para verificar que se captura el evento

        if (seed.hover(x, y)) {
            hold = 0;
            canvas.off("click");
            canvas.off("mousemove");
            canvas.removeClass('hand');
            console.log("Clic en la semilla detectado");
        }
    }).on('mousemove', function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        canvas.toggleClass('hand', seed.hover(x, y));
    });

    // También agregar soporte para dispositivos táctiles
    canvas.on('touchstart', function (e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        var offset = canvas.offset(), x, y;
        x = touch.pageX - offset.left;
        y = touch.pageY - offset.top;
        console.log("Touch en: ", x, y);

        if (seed.hover(x, y)) {
            hold = 0;
            canvas.off("touchstart");
            canvas.off("click");
            canvas.off("mousemove");
            canvas.removeClass('hand');
            console.log("Touch en la semilla detectado");
        }
    });

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

    // Para debugging - muestra un mensaje cuando el árbol está listo
    console.log("Árbol preparado, haz clic en el corazón para comenzar");

    // Asegúrate de que la semilla esté dibujada antes de iniciar
    setTimeout(function () {
        seed.draw();
        // Hacemos el corazón más visible
        seed.setHeartScale(1.2);
        seed.drawHeart();
        console.log("Semilla dibujada");
    }, 100);

    // Inicia la animación después de un breve retraso
    setTimeout(function () {
        runAsync().start();
    }, 500);

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
})();