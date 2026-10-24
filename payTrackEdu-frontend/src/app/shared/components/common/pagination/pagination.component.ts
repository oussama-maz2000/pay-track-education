import { Component, Input, Output, EventEmitter, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Pageable } from "../../../../core/model/pageable.model";

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pagination.component.html'
})
export class PaginationComponent {
    @Input({ required: true }) paginationSignal: Signal<Pageable>;
    @Output() onPageChange = new EventEmitter<any>();


    protected next(event: PageEvent) {
        this.onPageChange.emit(event);
    }

    onSizeChange(event: any): void {
        const size = parseInt(event.target.value);
        this.next({ pageIndex: 0, pageSize: size, length: this.paginationSignal()?.totalElements || 0 });
    }

    getPageRangeLabel(): string {
        const pagination = this.paginationSignal();
        if (!pagination || pagination.totalElements === 0) {
            return '0 of 0';
        }
        const startIndex = pagination.page * pagination.size + 1;
        const endIndex = Math.min((pagination.page + 1) * pagination.size, pagination.totalElements);
        return `${startIndex} - ${endIndex} of ${pagination.totalElements}`;
    }

    isFirstPage(): boolean {
        return (this.paginationSignal()?.page || 0) === 0;
    }

    isLastPage(): boolean {
        const pagination = this.paginationSignal();
        if (!pagination) return true;
        const lastPage = Math.ceil(pagination.totalElements / pagination.size) - 1;
        return pagination.page >= lastPage;
    }

    goToFirstPage(): void {
        if (!this.isFirstPage()) {
            this.next({
                pageIndex: 0,
                pageSize: this.paginationSignal()?.size || 50,
                length: this.paginationSignal()?.totalElements || 0
            });
        }
    }

    goToPreviousPage(): void {
        if (!this.isFirstPage()) {
            const pagination = this.paginationSignal();
            this.next({
                pageIndex: (pagination?.page || 0) - 1,
                pageSize: pagination?.size || 50,
                length: pagination?.totalElements || 0
            });
        }
    }

    goToNextPage(): void {
        if (!this.isLastPage()) {
            const pagination = this.paginationSignal();
            this.next({
                pageIndex: (pagination?.page || 0) + 1,
                pageSize: pagination?.size || 50,
                length: pagination?.totalElements || 0
            });
        }
    }

    goToLastPage(): void {
        if (!this.isLastPage()) {
            const pagination = this.paginationSignal();
            if (pagination) {
                const lastpage = Math.ceil(pagination.totalElements / pagination.size) - 1;
                this.next({
                    pageIndex: lastpage,
                    pageSize: pagination.size,
                    length: pagination.totalElements
                });
            }
        }
    }
}