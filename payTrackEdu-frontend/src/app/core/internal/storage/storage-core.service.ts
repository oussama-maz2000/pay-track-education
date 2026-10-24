import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class StorageCoreService{

    /**
     * Get item from localStorage with type safety
     */
    getItem<T>(key: string): T | null
    {
        const item = localStorage.getItem(key);
        if (!item) return null;

        try
        {
            return JSON.parse(item) as T;
        } catch
        {
            // If it's not valid JSON, return as string
            return item as unknown as T;
        }
    }

    /**
     * Store item in localStorage with automatic serialization
     */
    setItem(key: string, value: unknown): void
    {
        if (value === undefined || value === null)
        {
            localStorage.removeItem(key);
            return;
        }

        const serialized = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

        localStorage.setItem(key, serialized);
    }

    /**
     * Remove item from localStorage
     */
    removeItem(key: string): void
    {
        localStorage.removeItem(key);
    }

    /**
     * Clear all app-related items from localStorage
     * @param keyPrefix Prefix to identify app-specific keys (optional)
     */
    clearAll(keyPrefix?: string): void
    {
        if (keyPrefix)
        {
            // Only clear keys with specified prefix
            Object.keys(localStorage)
                .filter(key => key.startsWith(keyPrefix))
                .forEach(key => localStorage.removeItem(key));
        } else
        {
            localStorage.clear();
        }
    }

    /**
     * Get item from sessionStorage with type safety
     */
    getSessionItem<T>(key: string): T | null
    {
        const item = sessionStorage.getItem(key);
        if (!item) return null;

        try
        {
            return JSON.parse(item) as T;
        } catch
        {
            // If it's not valid JSON, return as string
            return item as unknown as T;
        }
    }

    /**
     * Store item in sessionStorage with automatic serialization
     */
    setSessionItem(key: string, value: unknown): void
    {
        if (value === undefined || value === null)
        {
            sessionStorage.removeItem(key);
            return;
        }

        const serialized = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);

        sessionStorage.setItem(key, serialized);
    }

    /**
     * Remove item from sessionStorage
     */
    removeSessionItem(key: string): void
    {
        sessionStorage.removeItem(key);
    }

    /**
     * Clear all app-related items from sessionStorage
     */
    clearSessionAll(keyPrefix?: string): void
    {
        if (keyPrefix)
        {
            // Only clear keys with specified prefix
            Object.keys(sessionStorage)
                .filter(key => key.startsWith(keyPrefix))
                .forEach(key => sessionStorage.removeItem(key));
        } else
        {
            sessionStorage.clear();
        }
    }

}
