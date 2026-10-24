function extractSystemInformation(userAgent: string): string {
    const systemInfoMatch = userAgent.match(/\(([^)]+)\)/);
    const systemInfo = systemInfoMatch ? systemInfoMatch[1] : 'Unknown';
    return systemInfo.replace(/[^a-zA-Z0-9\s.]/g, ' ');
}

function extractBrowserInformation(userAgent: string): string {
    const browserInfoMatch = userAgent.match(/Chrome\/[\d.]+/);
    const browserInfo = browserInfoMatch ? browserInfoMatch[0] : 'Unknown';
    return browserInfo.replace(/[^a-zA-Z0-9\s.]/g, ' ');
}
