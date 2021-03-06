/* -------------------------------- VARIABLES --------------------------------------- */
// --------------- CONSTANTES --------------------
const GRAVITY = 2;
// ----------  variables auxiliares --------------
var izq_1 = false; var der_1 = true;
var izq_2 = true; var der_2 = false;
var pos_actual1 = 0, ciclo1 = 0;
var pos_actual2 = 0, ciclo2 = 0, incremento_width = 0;
var ground_ref_ch_2;          var swordIsSet = false;
var fireCurrentFrame_2 = 0;   var pos_x_fire = 0;  var pos_y_fire = 0; var pos_fireIsSet = false;
var game_over = false;
// ---------------------------------
var ground;

var background = {
    src: "https://jesushernandez1995.github.io/VideojuegoLucha/assets/bg_frames/0.gif",
    currentFrame: 0,
    totalFrame: 8
}

var espada = {
    width: 70,
    height: 30,
    x: 0,
    y: 0
}

var bolafuego = {
    width: 16,
    height: 16,
    x: 0,
    y: 0
}

var character1 = {
    src: "https://jesushernandez1995.github.io/VideojuegoLucha/assets/personaje1transparente.PNG",
    currentFrame: 0,
    frameCount: 3,
    width: 56,
    height: 83,
    parado: true,
    punch: false,
    agachado: false,
    jumping: false,
    velocity: 0,
    modo: 'a',
    health: 100
}

var character2 = {
    src: "https://jesushernandez1995.github.io/VideojuegoLucha/assets/walk2_trans.png",
    currentFrame: 0,
    frameCount: 6,
    width: 51.4,
    height: 100,
    pos_x: 60,
    pos_y: 278,
    parado: true,
    patada: false,
    agachado: false,
    jumping: false,
    velocity: 0,
    modo: 'd',
    health: 100
}

// It represents the game area, the canvas section
var myGameArea = {
    canvas : document.getElementById("myCanvas"),
    start : function() {        // constructor
        // The getContext() is a built-in HTML object, with properties and methods for drawing
        this.context = this.canvas.getContext("2d");
        // In order to make the element move, we need to render it 50 times per second
        this.interval = setInterval(updateGameArea, 50);
        window.addEventListener('keydown', function (e) {
            myGameArea.key = e.keyCode;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.key = false;
            clearmove();
        })
    },
    /* It's necessary to clear it after every udate, because if not, all movements of the component 
    will leave a trail of where it was positioned in the last frame */
    clear : function(){
        // The clearRect() method clears the specified pixels within a given rectangle
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

/* -------------------------------- FUNCIONES --------------------------------------- */
const startGame = () => {
    myGameArea.start();
    // ------------------ Dibujando o Creando los componentes -----------------
    // (imageWitdh, imageHeight, imagePath, x_position, y_position, type)
    ground = new StaticComponents(726, 54, "https://jesushernandez1995.github.io/VideojuegoLucha/assets/ground.PNG", 0, 347, "image");
    bg_music = new Sound("https://jesushernandez1995.github.io/VideojuegoLucha/assets/Music/bg_music.m4a");
    background = new DynamicComponents(726, 348, background.src, 0, 0, "image", background.currentFrame, background.totalFrame);
    character1 = new Characters(character1.width, character1.height, character1.src, 10, 290, "image", character1.currentFrame, character1.frameCount, 'a');
    character2 = new Characters(character2.width, character2.height, character2.src, 360, 278, "image", character2.currentFrame, character2.frameCount, 'd');
    // ------------------ Setting important values before starting the game -------
    character1.health = 100;    character1.espada = false;      
    character2.health = 100;    character2.fuego = false;
    bg_music.play();
}

// Funci??n constructor
function StaticComponents (width, height, color, x, y, type) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;    
    this.update = function(){
        ctx = myGameArea.context;
        if (type == "image") {
            ctx.drawImage(this.image, 
                this.x, 
                this.y,
                this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// Funci??n consctructor de la clase DynamicComponents
function DynamicComponents (width, height, color, x, y, type, currentFrame, totalF) {
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;    
    this.currentFrame = currentFrame;
    this.totalF = totalF;
    this.update = function(){
        ctx = myGameArea.context;
        if (type == "image") {
            this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/bg_frames/"+this.currentFrame+".gif";
            this.currentFrame++;
            if(this.currentFrame == this.totalF) {this.currentFrame = 0}
            ctx.drawImage(this.image, 
                this.x, 
                this.y,
                this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// Funci??n constructor de la clase Characters
function Characters(width, height, source, x, y, type, currentFrame, frameCount, modo){
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = source;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.currentFrame = currentFrame;
    this.frameCount = frameCount;
    this.modo = modo;
    this.update = function(){
        ctx = myGameArea.context;
        // Habr??n distintos modos: personaje parado / desplaz??ndose / golpeando con pu??o / golpeando con botella...
        
            switch(this.modo){
                /* 
                    'a': personaje podr?? estar quieto o desplaz??ndose
                    'b': personaje har?? un movimiento de golpe con pu??o
                    'c': personaje har?? un movimiento de golpe con botella
                */
                case 'a':   // PERSONAJE 1: estar quieto o desplazarse
                    // Si el personaje 1 est?? parado, s??lo mostramos un frame
                    if(izq_1)   this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/walk_left_1.PNG";
                    if(der_1)   this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/personaje1transparente.PNG";
                    if(character1.parado){
                        this.currentFrame = this.currentFrame % this.frameCount; 
                        srx = this.currentFrame * this.width;
                        
                    } // De lo contrario, mostramos varios frames dentro de un ciclo (el personaje estar?? animado)
                    else {    
                        this.currentFrame = ++this.currentFrame % this.frameCount; 
                        srx = this.currentFrame * this.width;
                    }
                    if (type == "image") {   // Si es de tipo imagen, lo dibujamos
                        ctx.drawImage(this.image, srx, 0, this.width, this.height, this.x, this.y, this.width, this.height);
                    } else {
                        ctx.fillStyle = source;
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                    break;
                case 'b':   // PERSONAJE 1: golpear con pu??o
                    if(character1.punch){
                        if(pos_actual1 == 0)    this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/punch_transparent1.PNG";
                        pos_actual1 = ++pos_actual1 % 3;
                        srx = pos_actual1 * 60;
                        if(pos_actual1 == 2)     ciclo1++;     
                        if(ciclo1 == 2){
                            pos_actual1 = 0;
                            this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/personaje1transparente.PNG";
                            character1.punch = false;
                            character1.modo = 'a';
                            ciclo1 = 0;
                        }
                        ctx.drawImage(this.image, srx, 0, this.width, this.height, this.x, this.y, this.width, this.height);
                    }
                    break;
                case 'c':      // PERSONAJE 1: agacharse
                    this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/down1.PNG";
                    ctx.drawImage(this.image, 
                        this.x, 
                        335,
                        91, 42);
                    if(!character1.agachado)    {
                        this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/personaje1transparente.PNG";
                        character1.modo = 'a';
                    }
                    break;
                case 'd':   // PERSONAJE 2: estar quieto o desplazarse
                    if(izq_2)   {this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/walk_2_left.PNG"; this.width = 51.4}
                    if(der_2)   {this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/walk2_trans.png"; this.width = 47.5}
                    if(character2.parado){
                        this.currentFrame = this.currentFrame % this.frameCount; 
                        srx = this.currentFrame * this.width;
                        
                    } // De lo contrario, mostramos varios frames dentro de un ciclo (el personaje estar?? animado)
                    else {    
                        this.currentFrame = ++this.currentFrame % this.frameCount; 
                        srx = this.currentFrame * this.width;
                    }
                    if (type == "image") {   // Si es de tipo imagen, lo dibujamos
                        ctx.drawImage(this.image, srx, 0, this.width, this.height, this.x, this.y, this.width, this.height);
                    } else {
                        ctx.fillStyle = source;
                        ctx.fillRect(this.x, this.y, this.width, this.height);
                    }
                    break;
                case 'e':   // PERSONAJE 2: golpear con patada
                    if(pos_actual2 == 0)    this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/patada_2trans.PNG";
                    pos_actual2 = ++pos_actual2 % 2;
                    srx = pos_actual2 * (64 + incremento_width);
                    if(pos_actual2 == 1)     {ciclo2++;  incremento_width = incremento_width + 20}   
                    if(ciclo2 == 2){
                        pos_actual2 = 0;
                        this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/walk2_trans.png";
                        character2.patada = false;
                        character2.modo = 'd';
                        incremento_width = 0;
                        ciclo2 = 0;
                    }
                    ctx.drawImage(this.image, srx, 0, this.width, this.height, this.x, this.y, this.width, this.height);
                    break;
                case 'f':   // PERSONAJE 2: agacharse
                    this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/tirarse_2_trans.PNG";
                    ctx.drawImage(this.image, 
                        this.x, 
                        this.y + 15,
                        48, 77);
                    if(!character2.agachado)    {
                        this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/walk2_trans.png";
                        character2.modo = 'd';
                    }
                    break;
                case 'g':
                    ground_ref_ch_2 = 290;    // valor escogido en base a la altura del personaje
                    this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/jump2_trans.PNG";
                    if (character2.jumping){
                        if( this.y + character2.velocity <= ground_ref_ch_2 ){
                            this.y += character2.velocity;
                            character2.velocity += GRAVITY;
                        } else {
                            character2.velocity = 0;
                            character2.jumping = false;
                            character2.modo = 'd';
                            this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/walk2_trans.png";
                        }
                    }
                    ctx.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
                    break;
                case 'h':
                    this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/jump1trans.PNG";
                    if (character1.jumping){
                        if( this.y + character1.velocity <= 300 ){
                            this.y += character1.velocity;
                            character1.velocity += GRAVITY;
                        } else {
                            character1.velocity = 0;
                            character1.jumping = false;
                            character1.modo = 'a';
                            this.image.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/personaje1transparente.PNG";
                        }
                    }
                    ctx.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
                    break;
                default:
                    break;
            }
    }
    // Funci??n donde determinaremos si los personajes se han hecho da??o, y actualizaremos barra de energ??a
    this.getHurt = function(otherCharacter){
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherCharacter.x;
        var otherright = otherCharacter.x + (otherCharacter.width);
        var othertop = otherCharacter.y;
        var otherbottom = otherCharacter.y + (otherCharacter.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) ||(myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }

    // Funci??n para actualizar la nueva posici??n del personaje
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }
}

// Funci??n constructor para poner m??sica de fondo
function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.loop = true;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

// Funci??n para dibujar la barra de energia
const draw_healthbar = (x, y, health, width, thickness) => {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.rect(x-width/2, y, width*(health/100), thickness);
    if(health > 63){
        ctx.fillStyle="green"
    }else if(health > 37){
        ctx.fillStyle="gold"
    }else if(health > 13){
      ctx.fillStyle="orange";
    }else{
      ctx.fillStyle="red";
    }
    ctx.closePath();
    ctx.fill();
    if(health <= 0)     game_over = true;
}

// Funci??n para lanzar la espada
const throw_sword = (x, y, height, width, dir_left, dir_right) => {
    sword = new Image();
    ctx = myGameArea.context;
    if(!swordIsSet)     { espada.x = x; espada.y = y+15; swordIsSet = true}
    if(dir_right)   {espada.x += 16; sword.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/sword.png"}
    if(dir_left)    {espada.x -= 16; sword.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/sword_inverted.png"}
    if((espada.x >= myGameArea.canvas.width) || (espada.x <= 0))  {
        swordIsSet = false; 
        character1.espada = false;
    }
    if(character2.getHurt(espada)) {
        character2.health = character2.health - 10;
        if(character2.health <= 0)  game_over = true;
        swordIsSet = false; 
        character1.espada = false;
    }
    ctx.drawImage(sword, espada.x, espada.y, width, height);
}

 // Funci??n para dibujar bola de fuego
const throw_fireball = (x, y, w, h, dir_left, dir_right) => {
    fireball = new Image();
    fireball.src = "https://jesushernandez1995.github.io/VideojuegoLucha/assets/fireballs.png";
    ctx = myGameArea.context;
    fireCurrentFrame_2 = ++fireCurrentFrame_2 % 8; 
    srx = fireCurrentFrame_2 * w;
    if(!pos_fireIsSet)  {bolafuego.x = x; bolafuego.y = y+30; pos_fireIsSet = true}
    if(dir_right)   bolafuego.x += 18;
    if(dir_left)    bolafuego.x -= 18;
    if((bolafuego.x >= myGameArea.canvas.width) || (bolafuego.x <= 0))  {
        pos_fireIsSet = false; 
        character2.fuego = false;
    }
    if(character1.getHurt(bolafuego)){
        character1.health = character1.health - 10;
        if(character1.health <= 0)  game_over = true; 
        pos_fireIsSet = false; 
        character2.fuego = false;
    }
    ctx.drawImage(fireball, srx, 0, w, h, bolafuego.x, bolafuego.y, w, h);
}

// it will be called 50 times per second. It represents the game loop
const updateGameArea = () => {
    myGameArea.clear();
    
    // Reseteamos la velocidad del personaje 1
    character1.speedX = 0;
    character1.speedY = 0;    
    // Reseteamos la velocidad del personaje 2
    character2.speedX = 0;
    character2.speedY = 0;
    /* ----------- Control de letras para mover al personaje n?? 1 -------------  */
    if (myGameArea.key && myGameArea.key == 37) {character1.speedX = -12; character1.parado = false; izq_1 = true; der_1 = false}
    if (myGameArea.key && myGameArea.key == 39) {character1.speedX = 12; character1.parado = false; izq_1 = false; der_1 = true}
    if (myGameArea.key && myGameArea.key == 35) {character1.punch = true; character1.parado = true; character1.modo = 'b'}
    if (myGameArea.key && myGameArea.key == 40) {character1.modo = 'c'; character1.agachado = true}
    if (myGameArea.key && myGameArea.key == 38 && !character1.jumping) {character1.modo = 'h'; character1.jumping = true; character1.velocity = -20}
    if (myGameArea.key && myGameArea.key == 17) {character1.espada = true}
    /* ----------- Control de letras para mover al personaje n?? 2 -------------  */
    if (myGameArea.key && myGameArea.key == 65) {character2.speedX = -12; character2.parado = false; izq_2 = true; der_2 = false}
    if (myGameArea.key && myGameArea.key == 68) {character2.speedX = 12; character2.parado = false; izq_2 = false; der_2 = true}
    if (myGameArea.key && myGameArea.key == 88) {character2.modo = 'e'; character2.patada = true}
    if (myGameArea.key && myGameArea.key == 83) {character2.modo = 'f'; character2.agachado = true}
    if (myGameArea.key && myGameArea.key == 87 && !character2.jumping) {character2.modo = 'g'; character2.jumping = true; character2.velocity = -20}
    if (myGameArea.key && myGameArea.key == 90) {character2.fuego = true}
    // ---------- Actualizar elementos est??ticos ------------
    ground.update();
    background.update();
    // ---------- Checamos si alguno de los personajes ha lanzado una bola de fuego --------
    if(character1.espada)   throw_sword(character1.x, character1.y, espada.height, espada.width, izq_1, der_1);
    if(character2.fuego)    throw_fireball(character2.x, character2.y, bolafuego.width, bolafuego.height, izq_2, der_2);
    // ---------- Checamos si alguno de los personajes ha recibido alg??n da??o ------------
    if(character1.getHurt(character2))      character1.health--;
    if(character2.getHurt(character1))      character2.health--;
    else{
        // ---------- Dibujar Barra de salud (Health Bar) -------------
        if(!game_over){
            draw_healthbar(100,50, character1.health, 100, 10);  
            draw_healthbar(620,50, character2.health, 100, 10); 
        }
    }
    if(game_over){
        if(character1.health <= 0)  alert("El personaje 1 ha perdido");
        if(character2.health <= 0)  alert("El personaje 2 ha perdido");
        myGameArea.stop();
    }
    // ---------- Actualizar caracter??sticas personaje 1 -------------
    character1.newPos(); 
    character1.update();
    // ---------- Actualizar caracter??sticas personaje 2 -------------
    character2.update();
    character2.newPos();
}

// Funci??n que se ejecuta cuando se sueltan las teclas de acci??n (<- | -> | a | w .. etc)
const clearmove = () => {
    // ground.image.src = "assets/smiley.gif";
    character1.parado = true;
    character1.agachado = false;
    character2.parado = true;
    character2.agachado = false;
    character1.speedX = 0; 
    character1.speedY = 0; 
    character2.speedX = 0; 
    character2.speedY = 0; 
}