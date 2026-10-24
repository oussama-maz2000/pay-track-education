import {HttpErrorResponse} from "@angular/common/http";

export class ErrorUtils{
   static  extractErrorMessage(error: HttpErrorResponse): string {

        if (error.error && error.error.errors) {
            const messages = Object.values(error.error.errors);
            return messages.join(' | ');
        }


        if (error.error && typeof error.error.message === 'string') {
            return error.error.message;
        }


        try {
            const parsed = JSON.parse(error.error);
            return parsed?.message || 'An unknown error occurred';
        } catch {
            return 'An unknown error occurred';
        }
    }
}

