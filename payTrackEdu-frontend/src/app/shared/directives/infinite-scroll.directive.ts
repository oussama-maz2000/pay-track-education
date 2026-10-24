import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';

/**
 * Emits once when a scrollable element reaches its lower edge.
 *
 * Bind `infiniteScrollDisabled` while a page request is pending or when the
 * API has no more pages. The owning component remains responsible for keeping
 * its current page and appending the received options.
 */
@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScrollDirective {
  @Input({ transform: booleanAttribute }) infiniteScrollDisabled = false;
  @Input({ transform: numberAttribute }) infiniteScrollThreshold = 24;
  @Output() infiniteScrollEnd = new EventEmitter<void>();

  private hasReachedEnd = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  @HostListener('scroll')
  onScroll(): void {
    if (this.infiniteScrollDisabled) {
      return;
    }

    const element = this.elementRef.nativeElement;
    const remainingDistance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    const threshold = Math.max(0, this.infiniteScrollThreshold);

    if (remainingDistance > threshold) {
      this.hasReachedEnd = false;
      return;
    }

    if (!this.hasReachedEnd) {
      this.hasReachedEnd = true;
      this.infiniteScrollEnd.emit();
    }
  }
}
