async function main() {
    const marketplace = await (await fetch('/static/topaz/marketplace/marketplace.json')).json();

    const subtitle = document.getElementById('subtitle');
    subtitle.textContent = `${marketplace.number} items available`;
    
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
            default:
                return items;
        }
    }

    function filterItems(items, query, filter) {
        return items.filter(item => 
            (filter === 'all' || item.type === filter) &&
            (item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.some(desc => desc.toLowerCase().includes(query.toLowerCase())) ||
            item.author.toLowerCase().includes(query.toLowerCase()))
        );
    }

    function showOverlay(item) {
        overlayContent.innerHTML = `
            <h2>${item.name}</h2>
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
            const item = marketplace.widgets.find(widget => widget.id === itemId);
            if (item) {
                showOverlay(item);
            }
        }
    }

    sortSelect.addEventListener('change', () => {
        const sortedItems = sortItems([...marketplace.widgets], sortSelect.value);
        renderItems(sortedItems);
    });

    searchInput.addEventListener('input', () => {
        const filteredItems = filterItems(marketplace.widgets, searchInput.value, filterSelect.value);
        renderItems(filteredItems);
    });

    filterSelect.addEventListener('change', () => {
        const filteredItems = filterItems(marketplace.widgets, searchInput.value, filterSelect.value);
        renderItems(filteredItems);
    });

    closeOverlay.addEventListener('click', () => {
        overlay.classList.add('hidden');
        document.body.classList.remove('overlay-active');
        window.history.pushState({}, document.title, window.location.pathname);
    });

    renderItems(marketplace.widgets);
    checkForItemInUrl();
}

main();