export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
  }

  onStart(e) {
    e.preventDefault();
    this.wrapper.addEventListener('mousemove', this.onMove);
    console.log('mousedown');
  }

  onMove(e) {
    console.log('moveu')
  }

  onEnd(e) {
    console.log('acabou')
    this.wrapper.removeEventListener('mousemove', this.onMove);
  }

  addSlideEvent() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
  }

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