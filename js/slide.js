export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);

    //  objeto para adicionar as propriedades do slide a serem trabalhadas
    this.dist = { finalPosition: 0, startX: 0, movement: 0 }
  }

  //  adiciona o a distancia ao moveposition para ter referencia do quanto foi movido
  //  função que move o slide recebendo o calculo final
  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  //  recebe a quantidade movida, e subtrai de onde foi o clique inicial( *1.6 para  o slide correr mais)
  //  retorna a posição final (subtrai a distancia movida para o slide não ocorrer ao contrario)
  uptadePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  //  função inicial, pega a posição inicial do clique
  //  chamava a função onMove, peg
  onStart(e) {
    let movetype;
    if (e.type === 'mousedown') {
      e.preventDefault();
      this.dist.startX = e.clientX;
      movetype = 'mousemove'
    } else {
      this.dist.startX = e.changedTouches[0].clientX;
      movetype = 'touchmove'
    }
    this.wrapper.addEventListener(movetype, this.onMove);
  }

  //  chama a updatePosition que faz o calculo para a posição final (do click inicial - a quantidade movida)
  //  chama a função que move o slide passando o calculo final
  onMove(e) {
    const pointerPosition = (e.type === 'mousemove')  ? e.clientX : e.changedTouches[0].clientX;
    const finalPosition = this.uptadePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  // remove o listener de mousemove ao soltar o clique
  /* adiciona a quantidade movida(moveposition) ao final position
    para que na proxima chamada ele fique da onde parou e não resete para 0*/
  onEnd(e) {
    const movetype = (e.type === 'mouseup') ? 'mousemove' : 'touchmove';
    this.wrapper.removeEventListener(movetype, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
  }

  //  adiciona os eventos
  addSlideEvent() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  //  faz o bind para que a classe Slide seja o this nos callbacks
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }

  init() {
    this.bindEvents();
    this.addSlideEvent();
    return this
  }
}