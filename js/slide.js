import debounce from './debouce.js';

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.activeClass = 'active';

    //  objeto para adicionar as propriedades do slide a serem trabalhadas
    this.dist = { finalPosition: 0, startX: 0, movement: 0 }

    this.changeEvent =  new Event('changeEvent')
  }

  transition(active) {
    this.slide.style.transition = active ? 'transform 0.3s' : '';
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
    this.transition(false);
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
    this.transition(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < 120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  //  adiciona os eventos
  addSlideEvent() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  //  Slides Config

  /*  calculo para centralizar imagem,
  pega o tamanho do width da tela(nesse caso o wrapper)
  e subtrai pelo tamanho da imagem, o que sobra são as margins.
  retorna o offsetLeft da imagem - uma das margins para centralizar
  */
  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  /*  array contendo todas as imgs do slide
  com os objetos contento o elemento e a posição do mesmo ja centralizada com a func slidePosition
  */
  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { position, element }
    });
  }

  //  objeto para pegar o index do array de slide, atual, anterior e proximo
  slideIndexNav(index) {
    const last = this.slideArray.length -1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1
    }
  }

  //  mudar slide de acordo com index passado
  changeSlide(index) {
    const activeSlide = this.slideArray[index]
    this.moveSlide(activeSlide.position);
    this.slideIndexNav(index);
    // atualizar distancia, para na voltar ao inicio (0)
    // se não no proximo click no slide a posição final(this.dist.finalPosition) iniciara com 0
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  changeActiveClass() {
    this.slideArray.forEach((item) => item.element.classList.remove('active'))
    this.slideArray[this.index.active].element.classList.add('active');
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) {
      this.changeSlide(this.index.prev);
    }
  }

  activeNextSlide() {
    if (this.index.next !== undefined) {
      this.changeSlide(this.index.next);
    }
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.changeSlide(this.index.active);
    }, 1000)
  }

  addResizeEvent() {
    window.addEventListener('resize', this.onResize);
  }

   //  faz o bind para que a classe Slide seja o this nos callbacks
   bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);

    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvent();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this
  }
}

export class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper)
    this.bindControlEvents()
  }

  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener('click', this.activePrevSlide);
    this.nextElement.addEventListener('click', this.activeNextSlide);
  }

  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';
    
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `
      <li><a href="#slide${ index + 1 }">${ index + 1 }</a></li>
      `
    });
    this.wrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      this.changeSlide(index)
    });
    this.wrapper.addEventListener('changeEvent', this.activeControlItem)
  }

  activeControlItem() {
    this.controlArray.forEach((item) => item.classList.remove(this.activeClass));
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];

    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
