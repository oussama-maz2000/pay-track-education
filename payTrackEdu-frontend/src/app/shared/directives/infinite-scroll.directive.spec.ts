import { ElementRef } from '@angular/core';
import { InfiniteScrollDirective } from './infinite-scroll.directive';

describe('InfiniteScrollDirective', () => {
  let element: HTMLElement;
  let directive: InfiniteScrollDirective;

  beforeEach(() => {
    element = document.createElement('div');
    Object.defineProperties(element, {
      scrollHeight: { configurable: true, value: 500 },
      clientHeight: { configurable: true, value: 200 },
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    directive = new InfiniteScrollDirective(new ElementRef(element));
  });

  it('emits once when the user reaches the bottom', () => {
    const listener = jasmine.createSpy();
    directive.infiniteScrollEnd.subscribe(listener);
    element.scrollTop = 300;

    directive.onScroll();
    directive.onScroll();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('allows another emission after the user scrolls away from the bottom', () => {
    const listener = jasmine.createSpy();
    directive.infiniteScrollEnd.subscribe(listener);
    element.scrollTop = 300;
    directive.onScroll();

    element.scrollTop = 100;
    directive.onScroll();
    element.scrollTop = 300;
    directive.onScroll();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('does not emit while disabled', () => {
    const listener = jasmine.createSpy();
    directive.infiniteScrollEnd.subscribe(listener);
    directive.infiniteScrollDisabled = true;
    element.scrollTop = 300;

    directive.onScroll();

    expect(listener).not.toHaveBeenCalled();
  });
});
