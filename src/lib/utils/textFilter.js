export function isTextMatch(itemKey, searchText, referenceData) {
    if (!searchText) return true;
    
    const fullText = referenceData[itemKey] || '';
    const normalizedFullText = normalizeText(fullText);
    const normalizedSearchTerm = normalizeText(searchText);
    const textWithoutPrefix = normalizedFullText.replace(/^the\s+/, '');
    const words = textWithoutPrefix.split(' ');
    
    return normalizedSearchTerm.length <= 1
        ? (normalizedFullText.startsWith(normalizedSearchTerm) ||
        textWithoutPrefix.startsWith(normalizedSearchTerm))
        : (normalizedFullText.startsWith(normalizedSearchTerm) ||
        textWithoutPrefix.startsWith(normalizedSearchTerm) ||
        words.some((word) => word.startsWith(normalizedSearchTerm)));
}

export function sortBySearchMatch(entries, searchText, referenceData) {
    const normalizedSearchTerm = normalizeText(searchText);
    
    return entries.sort(([keyA, _a], [keyB, _b]) => {
        const textA = normalizeText(referenceData[keyA] || '');
        const textB = normalizeText(referenceData[keyB] || '');
        
        const aStartsWithSearch = textA.startsWith(normalizedSearchTerm);
        const bStartsWithSearch = textB.startsWith(normalizedSearchTerm);
        
        if (aStartsWithSearch && !bStartsWithSearch) return -1;
        if (!aStartsWithSearch && bStartsWithSearch) return 1;
        
        return textA.localeCompare(textB);
    });
}

export function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}





export function isCountryMatch(countryIso) {
    if (!countryFilterText) return true;
    
    const countryName = countryInfoData[countryIso] || '';
    const normalizedCountryName = normalizeText(countryName);
    const nameWithoutThe = normalizedCountryName.replace(/^the\s+/, '');
    const words = nameWithoutThe.split(' ');
    
    return normalizedFilterText.length <= 1
        ? (normalizedCountryName.startsWith(normalizedFilterText) ||
        nameWithoutThe.startsWith(normalizedFilterText))
        : (normalizedCountryName.startsWith(normalizedFilterText) ||
        nameWithoutThe.startsWith(normalizedFilterText) ||
        words.some((word) => word.startsWith(normalizedFilterText)));
}

export function sortCountries(countryEntries) {
    return countryEntries.sort(([isoA, _a], [isoB, _b]) => {
        const aName = normalizeText(countryInfoData[isoA] || '');
        const bName = normalizeText(countryInfoData[isoB] || '');
        
        const aStarts = aName.startsWith(normalizedFilterText);
        const bStarts = bName.startsWith(normalizedFilterText);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return aName.localeCompare(bName);
    });
}

export function handleFilterInput(event) {
    countryFilterText = event.target.value;
}
