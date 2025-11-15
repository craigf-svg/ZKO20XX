export const getMoveIcon = (moveName: string): string => {
    const name = moveName.toLowerCase();
    if (name.includes('uptilt') || name.includes('utilt') || name.includes('up') || name.includes('uair') || name.includes('usmash')) {
        return 'ArrowUp';
    } else if (name.includes('down') || name.includes('dair') || name.includes('dsmash') || name.includes('dtilt')) {
        return 'ArrowDown';
    } else if (name.includes('back') || name.includes('bair')) {
        return 'Undo2';
    }

    return 'ChevronRight';
};

export const getShortLabel = (moveName: string): string => {
    const abbreviations: Record<string, string> = {
        'upsmash': 'Up Smash',
        'uptilt': 'Up-Tilt',
        'dtilt': 'Down-Tilt',
        'shuair': 'Short Hop Up air',
        'bair': 'Back Air'
    };
    const lower = moveName.toLowerCase();
    for (const [key, value] of Object.entries(abbreviations)) {
        if (lower.includes(key)) {
            return value;
        }
    }

    return moveName;
};

export const getPriorityColor = (koPercent: number | number[], currentPercent: number): string => {
    if (Array.isArray(koPercent)) {
        const [min, , max] = koPercent;
        if (currentPercent >= max) {
            return 'danger';
        }
        if (currentPercent >= min) {
            return 'warning';
        }
        return 'neutral';
    }

    return currentPercent >= koPercent ? 'danger' : 'neutral';
};