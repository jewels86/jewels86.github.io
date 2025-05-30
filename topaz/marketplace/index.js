async function main() {
    const widgets = await (await fetch('topaz/marketplace/widgets.json')).json();
    const themes = await (await fetch('topaz/marketplace/themes.json')).json();

    const all = [...widgets.widgets, ...themes.themes];

    const subtitle = document.getElementById('subtitle');
    subtitle.textContent = `${widgets.number + themes.number} items available; ${widgets.number} widgets and ${themes.number} themes`;
    
    const container = document.getElementById('items');
    const sortSelect = document.getElementById('sort');
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter');
    const overlay = document.getElementById('overlay');
    const overlayContent = document.getElementById('overlay-details');
    const closeOverlay = document.getElementById('close-overlay');

    function renderItems(items) {
        container.innerHTML = '';
        items.forEach(item => {
            const itemBox = document.createElement('div');
            itemBox.className = 'item-box';

            const title = document.createElement('a');
            title.href = `?item=${item.id}`;
            title.textContent = item.name;
            itemBox.appendChild(title);

            const description = document.createElement('p');
            description.textContent = item.description[0];
            itemBox.appendChild(description);

            const author = document.createElement('p');
            author.textContent = `Author: ${item.author}`;
            itemBox.appendChild(author);

            const version = document.createElement('p');
            version.textContent = `Version: ${item.version}`;
            itemBox.appendChild(version);

            container.appendChild(itemBox);
        });
    }

    function parseDate(dateArray) {
        return new Date(dateArray[2], dateArray[0] - 1, dateArray[1]);
    }

    function sortItems(items, criteria) {
        switch (criteria) {
            case 'newest':
                return items.sort((a, b) => parseDate(b.created_on) - parseDate(a.created_on));
            case 'oldest':
                return items.sort((a, b) => parseDate(a.created_on) - parseDate(b.created_on));
            case 'alphabetical':
                return items.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return items;
        }
    }

    function filterItems(items, query, filter) {
        return items.filter(item => {
            const isWidget = widgets.widgets.some(widget => widget.id === item.id);
            const isTheme = themes.themes.some(theme => theme.id === item.id);
            const matchesFilter = (filter === 'all') || 
                                  (filter === 'widgets' && isWidget) || 
                                  (filter === 'themes' && isTheme);
            return matchesFilter &&
                   (item.name.toLowerCase().includes(query.toLowerCase()) ||
                   item.description.some(desc => desc.toLowerCase().includes(query.toLowerCase())) ||
                   item.author.toLowerCase().includes(query.toLowerCase()));
        });
    }

    function showOverlay(item) {
        overlayContent.innerHTML = `
            <div class="overlay-header">
                <h2>${item.name}</h2>
                <button class="download-button" onclick="download('${item.id}')">Download</button>
            </div>
            <p>${item.description.join('<br>')}</p>
            <p>Created on: ${item.created_on.join('/')}</p>
            <p>Dependencies: ${item.dependencies.join(', ')}</p>
            <p>Author: ${item.author}</p>
            <p>Version: ${item.version}</p>
        `;
        overlay.classList.remove('hidden');
        document.body.classList.add('overlay-active');
    }

    function checkForItemInUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('item')) {
            const itemId = params.get('item');
            const item = [...widgets.widgets, ...themes.themes].find(widget => widget.id === itemId);
            if (item) {
                showOverlay(item);
            }
        }
    }

    sortSelect.addEventListener('change', () => {
        const sortedItems = sortItems([...widgets.widgets, ...themes.themes], sortSelect.value);
        const filteredItems = filterItems(sortedItems, searchInput.value, filterSelect.value);
        renderItems(filteredItems);
    });

    searchInput.addEventListener('input', () => {
        const sortedItems = sortItems([...widgets.widgets, ...themes.themes], sortSelect.value);
        const filteredItems = filterItems(sortedItems, searchInput.value, filterSelect.value);
        renderItems(filteredItems);
    });

    filterSelect.addEventListener('change', () => {
        const sortedItems = sortItems([...widgets.widgets, ...themes.themes], sortSelect.value);
        const filteredItems = filterItems(sortedItems, searchInput.value, filterSelect.value);
        renderItems(filteredItems);
    });

    closeOverlay.addEventListener('click', () => {
        overlay.classList.add('hidden');
        document.body.classList.remove('overlay-active');
        window.history.pushState({}, document.title, window.location.pathname);
    });

    const sortedItems = sortItems([...widgets.widgets, ...themes.themes], 'newest');
    renderItems(sortedItems);
    checkForItemInUrl();
}

function download(id) {
    window.postMessage({ paths: all.find(item => item.id === id)?.files }, '*');
}

main();