import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appEventlistener]'
})
export class EventlistenerDirective {

  private el:HTMLElement;
  private elChild:HTMLElement;

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
    this.elChild = el.nativeElement.querySelector(".dashboard-sidebar__project");
  }

  @HostListener('scroll') scrolling(){
    //console.log('scrolling');
  }

  @HostListener('click') clicking(){
    //console.log('clicking...');
  }
  @HostListener('mouseenter') hover(){
    //console.log('hovering...');
    this.el.style.overflowY = "auto";
    //this.elChild.style.margin = "0";
  }
  @HostListener('mouseleave') noHover(){
    //console.log('leaving...');
    this.el.style.overflowY = "hidden";
  }

}
